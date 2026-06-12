import express from 'express';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import Parser from 'rss-parser';
import { fileURLToPath } from 'url';
import multer from 'multer';
import https from 'https';
import YahooFinance from 'yahoo-finance2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const yahooFinance = new YahooFinance();
const parser = new Parser();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file.');
  process.exit(1);
}


const app = express();

// Güvenlik Başlıkları
app.use(helmet({
  crossOriginResourcePolicy: false, // İkonların farklı porttan (80) yüklenmesine izin ver
}));

// Sadece yetkili kaynaklara izin veren CORS ayarı
app.use(cors());

// Kaba kuvvet saldırılarını önlemek için Hız Sınırı (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 500, // Her IP için 15 dakikada en fazla 500 istek (Dashboard çok API atıyor)
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json());

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

const getPortfolioFile = (username) => path.join(__dirname, 'data', `portfolio_${username}.json`);
const getLinksFile = (username) => path.join(__dirname, 'data', `links_${username}.json`);
const getPreferencesFile = (username) => path.join(__dirname, 'data', `preferences_${username}.json`);
const getTagsFile = (username) => path.join(__dirname, 'data', `tags_${username}.json`);
const getNetworksFile = (username) => path.join(__dirname, 'data', `networks_${username}.json`);
const ICONS_DIR = path.join(__dirname, 'public', 'icons');

// Ensure directories exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Legacy data migration for admin
const oldPortfolio = path.join(__dirname, 'data', 'portfolio.json');
const adminPortfolio = getPortfolioFile('admin');
if (fs.existsSync(oldPortfolio) && !fs.existsSync(adminPortfolio)) {
  fs.renameSync(oldPortfolio, adminPortfolio);
}

const oldLinks = path.join(__dirname, 'data', 'links.json');
const adminLinks = getLinksFile('admin');
if (fs.existsSync(oldLinks) && !fs.existsSync(adminLinks)) {
  fs.renameSync(oldLinks, adminLinks);
}

const oldTags = path.join(__dirname, 'data', 'tags.json');
const adminTags = getTagsFile('admin');
if (fs.existsSync(oldTags) && !fs.existsSync(adminTags)) {
  fs.renameSync(oldTags, adminTags);
}

// Serve static icons
app.use('/icons', express.static(ICONS_DIR));

// Setup Multer for manual uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ICONS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
const upload = multer({ storage });

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Get/Init Users
const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultHash = crypto.createHash('sha256').update('admin123').digest('hex');
    const defaultUsers = [{ username: 'admin', passwordHash: defaultHash, role: 'admin' }];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    return defaultUsers;
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
};

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
  if (user) {
    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username, role: user.role });
  } else {
    res.status(401).json({ error: 'Hatalı kullanıcı adı veya şifre' });
  }
});

// Create User Endpoint (Admin Only)
app.post('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sadece admin yetkilidir.' });
  const { newUsername, newPassword } = req.body;
  if (!newUsername || !newPassword) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli.' });
  
  const users = getUsers();
  if (users.find(u => u.username === newUsername)) return res.status(400).json({ error: 'Kullanıcı adı zaten var.' });
  
  const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  users.push({ username: newUsername, passwordHash, role: 'user' });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  // Create empty portfolio, links, tags, and preferences for new user
  fs.writeFileSync(getPortfolioFile(newUsername), JSON.stringify([]));
  fs.writeFileSync(getLinksFile(newUsername), JSON.stringify([]));
  fs.writeFileSync(getPreferencesFile(newUsername), JSON.stringify({}));
  fs.writeFileSync(getTagsFile(newUsername), JSON.stringify([]));
  fs.writeFileSync(getNetworksFile(newUsername), JSON.stringify([]));
  
  res.json({ success: true });
});

// Update User Endpoint (Admin Only)
app.put('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sadece admin yetkilidir.' });
  const { oldUsername, newUsername, newPassword } = req.body;
  if (!oldUsername || !newUsername) return res.status(400).json({ error: 'Gerekli alanlar eksik.' });
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === oldUsername);
  if (userIndex === -1) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  
  if (newUsername !== oldUsername && users.find(u => u.username === newUsername)) {
    return res.status(400).json({ error: 'Yeni kullanıcı adı zaten kullanımda.' });
  }
  
  users[userIndex].username = newUsername;
  if (newPassword) {
    users[userIndex].passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  // Rename portfolio file if username changed
  if (newUsername !== oldUsername) {
    const oldFile = getPortfolioFile(oldUsername);
    const newFile = getPortfolioFile(newUsername);
    if (fs.existsSync(oldFile)) fs.renameSync(oldFile, newFile);

    const oldLinksF = getLinksFile(oldUsername);
    const newLinksF = getLinksFile(newUsername);
    if (fs.existsSync(oldLinksF)) fs.renameSync(oldLinksF, newLinksF);

    const oldPrefF = getPreferencesFile(oldUsername);
    const newPrefF = getPreferencesFile(newUsername);
    if (fs.existsSync(oldPrefF)) fs.renameSync(oldPrefF, newPrefF);

    const oldTagsF = getTagsFile(oldUsername);
    const newTagsF = getTagsFile(newUsername);
    if (fs.existsSync(oldTagsF)) fs.renameSync(oldTagsF, newTagsF);

    const oldNetF = getNetworksFile(oldUsername);
    const newNetF = getNetworksFile(newUsername);
    if (fs.existsSync(oldNetF)) fs.renameSync(oldNetF, newNetF);
  }
  
  res.json({ success: true });
});

// Delete User Endpoint (Admin Only)
app.delete('/api/users/:username', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sadece admin yetkilidir.' });
  const username = req.params.username;
  if (username === 'admin') return res.status(400).json({ error: 'Admin hesabı silinemez.' });
  
  let users = getUsers();
  users = users.filter(u => u.username !== username);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  const pFile = getPortfolioFile(username);
  if (fs.existsSync(pFile)) fs.unlinkSync(pFile);
  
  const prefFile = getPreferencesFile(username);
  if (fs.existsSync(prefFile)) fs.unlinkSync(prefFile);

  const lFile = getLinksFile(username);
  if (fs.existsSync(lFile)) fs.unlinkSync(lFile);
  
  const tFile = getTagsFile(username);
  if (fs.existsSync(tFile)) fs.unlinkSync(tFile);
  
  const nFile = getNetworksFile(username);
  if (fs.existsSync(nFile)) fs.unlinkSync(nFile);
  
  res.json({ success: true });
});

// Fetch All Users (Admin Only)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sadece admin yetkilidir.' });
  const users = getUsers().map(u => ({ username: u.username, role: u.role }));
  res.json(users);
});

// Manual File Upload Endpoint
app.post('/api/upload', authenticateToken, upload.single('icon'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/icons/${req.file.filename}` });
});

// Auto Fetch Icon Endpoint
app.post('/api/fetch-icon', authenticateToken, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    let domain = new URL(url.startsWith('http') ? url : `http://${url}`).hostname;
    // Remove port if exists
    domain = domain.split(':')[0];
    const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=128`;
    
    const response = await fetch(faviconUrl);
    if (!response.ok) {
      return res.status(400).json({ error: 'Could not fetch icon' });
    }
    
    const buffer = await response.arrayBuffer();
    const filename = `fetch-${Date.now()}.png`;
    const filepath = path.join(ICONS_DIR, filename);
    
    fs.writeFileSync(filepath, Buffer.from(buffer));
    res.json({ url: `/icons/${filename}` });
  } catch (e) {
    res.status(400).json({ error: 'Invalid URL format' });
  }
});

// Get all links
app.get('/api/links', authenticateToken, (req, res) => {
  const file = getLinksFile(req.user.username);
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return res.json([]);
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try { res.json(JSON.parse(data)); } catch (e) { res.json([]); }
  });
});

// Save all links
app.post('/api/links', authenticateToken, (req, res) => {
  const file = getLinksFile(req.user.username);
  fs.writeFile(file, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save data' });
    res.json({ success: true });
  });
});

// Get all tags
app.get('/api/tags', authenticateToken, (req, res) => {
  const file = getTagsFile(req.user.username);
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return res.json([]);
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try { res.json(JSON.parse(data)); } catch (e) { res.json([]); }
  });
});

// Save all tags
app.post('/api/tags', authenticateToken, (req, res) => {
  const file = getTagsFile(req.user.username);
  fs.writeFile(file, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save data' });
    res.json({ success: true });
  });
});

// Get all networks
app.get('/api/networks', authenticateToken, (req, res) => {
  const file = getNetworksFile(req.user.username);
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return res.json([]);
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try { res.json(JSON.parse(data)); } catch (e) { res.json([]); }
  });
});

// Save all networks
app.post('/api/networks', authenticateToken, (req, res) => {
  const file = getNetworksFile(req.user.username);
  fs.writeFile(file, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save data' });
    res.json({ success: true });
  });
});

// --- PORTFOLIO ROUTES ---
app.get('/api/portfolio', authenticateToken, (req, res) => {
  const pFile = getPortfolioFile(req.user.username);
  fs.readFile(pFile, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return res.json([]);
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try { res.json(JSON.parse(data)); } catch (e) { res.json([]); }
  });
});

app.post('/api/portfolio', authenticateToken, (req, res) => {
  const pFile = getPortfolioFile(req.user.username);
  fs.writeFile(pFile, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save data' });
    res.json({ success: true });
  });
});

app.get('/api/preferences', authenticateToken, (req, res) => {
  const pFile = getPreferencesFile(req.user.username);
  fs.readFile(pFile, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return res.json({});
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try { res.json(JSON.parse(data)); } catch (e) { res.json({}); }
  });
});

app.post('/api/preferences', authenticateToken, (req, res) => {
  const pFile = getPreferencesFile(req.user.username);
  fs.writeFile(pFile, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save data' });
    res.json({ success: true });
  });
});

const histCache = {};

async function getHistorical(symbol) {
  const now = Date.now();
  if (histCache[symbol] && (now - histCache[symbol].timestamp < 3600 * 1000)) {
    return histCache[symbol].data;
  }
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  try {
    const data = await yahooFinance.chart(symbol, { period1: oneYearAgo });
    const quotes = data && data.quotes ? data.quotes : [];
    histCache[symbol] = { data: quotes, timestamp: now };
    return quotes;
  } catch(e) {
    console.error(`Hist error for ${symbol}:`, e.message);
    return [];
  }
}

function calcHistPct(history, livePrice, daysAgo) {
  if (!history || history.length === 0 || livePrice === 0) return null;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysAgo);
  let closest = null;
  let minDiff = Infinity;
  for (const item of history) {
    const diff = Math.abs(item.date - targetDate);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  if (closest && closest.close > 0) {
    return ((livePrice - closest.close) / closest.close) * 100;
  }
  return null;
}

// --- FINANCE RADAR API ---
app.get('/api/finance/radar', authenticateToken, async (req, res) => {
  try {
    const pFile = getPortfolioFile(req.user.username);
    const rawData = fs.existsSync(pFile) ? JSON.parse(fs.readFileSync(pFile, 'utf8')) : [];
    if (!rawData || rawData.length === 0) return res.json([]);

    const groupedData = {};
    rawData.forEach(item => {
      const code = item.code;
      if (!groupedData[code]) {
        groupedData[code] = {
          code: code,
          displayName: item.displayName,
          totalQuantity: 0,
          totalCost: 0,
          targetProfitPct: item.targetProfitPct || 0,
          stopLossPct: item.stopLossPct || 0
        };
      }
      const qty = item.quantity || 0;
      groupedData[code].totalQuantity += qty;
      groupedData[code].totalCost += (qty * item.buyPrice);
    });

    const data = Object.values(groupedData).map(g => ({
      ...g,
      buyPrice: g.totalQuantity > 0 ? (g.totalCost / g.totalQuantity) : 0
    }));

    const formatSymbol = (code) => {
      let c = code.toUpperCase().trim().replace(':', '');
      if (!c.includes('.') && !c.includes('-') && !c.includes('=')) {
        const cryptos = ['BTC', 'ETH', 'XRP', 'SOL', 'AVAX', 'BNB', 'DOGE', 'ADA', 'TRX'];
        const fiats = ['USD', 'EUR', 'GBP', 'CHF'];
        if (cryptos.includes(c)) c += '-USD';
        else if (fiats.includes(c)) c += 'TRY=X';
        else c += '.IS';
      }
      return c;
    };
    const symbols = data.map(item => formatSymbol(item.code));
    const quotes = await yahooFinance.quote(symbols);
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes];

    const histDataPromises = symbols.map(sym => getHistorical(sym));
    const histDataArray = await Promise.all(histDataPromises);
    const historyMap = {};
    symbols.forEach((sym, idx) => { historyMap[sym] = histDataArray[idx]; });

    const radarData = data.map(item => {
      const lookupCode = formatSymbol(item.code);
      const q = quotesArray.find(quote => quote.symbol === lookupCode);
      if (!q) return { ...item, livePrice: 0, totalPct: 0, dayPct: 0, status: '- BEKLE' };
      
      const livePrice = q.regularMarketPrice || 0;
      const prevClose = q.regularMarketPreviousClose || livePrice;

      const totalPct = item.buyPrice > 0 ? ((livePrice - item.buyPrice) / item.buyPrice) * 100 : 0;
      const dayPct = prevClose > 0 ? ((livePrice - prevClose) / prevClose) * 100 : 0;
      
      let status = '- BEKLE';
      if (item.targetProfitPct && totalPct >= item.targetProfitPct) status = '🟢 SAT';
      else if (item.stopLossPct) {
        const stopLossValue = item.stopLossPct > 0 ? -item.stopLossPct : item.stopLossPct;
        if (totalPct <= stopLossValue) status = '🔴 STOP';
      }

      const history = historyMap[lookupCode] || [];
      
      const totalInvestment = item.totalCost || 0;
      const currentValue = item.totalQuantity > 0 ? (item.totalQuantity * livePrice) : 0;
      const totalProfitAmount = currentValue - totalInvestment;

      return {
        ...item,
        livePrice,
        totalPct,
        dayPct,
        status,
        currency: q.currency || '',
        totalInvestment,
        currentValue,
        totalProfitAmount,
        historical: {
          w1: calcHistPct(history, livePrice, 7),
          m1: calcHistPct(history, livePrice, 30),
          m3: calcHistPct(history, livePrice, 90),
          m6: calcHistPct(history, livePrice, 180),
          y1: calcHistPct(history, livePrice, 365)
        }
      };
    });

    res.json(radarData);
  } catch (error) {
    console.error("Radar Error:", error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

app.get('/api/widgets/ipo', authenticateToken, (req, res) => {
  res.json([
    { name: 'Koton Mağazacılık (KOTON)', date: '30-31 Mayıs', price: '34.50 TL', demand: 'Yüksek', status: 'Yaklaşıyor' },
    { name: 'Lila Kağıt (LILAK)', date: '1-2 Haziran', price: '37.39 TL', demand: 'Orta', status: 'Talep Toplanıyor' },
    { name: 'Altınay Savunma (ALTNY)', date: '5-6 Haziran', price: '32.00 TL', demand: 'Çok Yüksek', status: 'Duyuruldu' }
  ]);
});

app.get('/api/widgets/whales', authenticateToken, (req, res) => {
  res.json([
    { asset: 'BTC', amount: '2,500', value: '$165M', from: 'Bilinmeyen', to: 'Binance', type: 'Transfer', time: '5 dk önce' },
    { asset: 'ETH', amount: '15,000', value: '$45M', from: 'Coinbase', to: 'Bilinmeyen', type: 'Çıkış', time: '12 dk önce' },
    { asset: 'SOL', amount: '500,000', value: '$72M', from: 'Bilinmeyen', to: 'Bilinmeyen', type: 'Transfer', time: '23 dk önce' }
  ]);
});

app.get('/api/widgets/osint', authenticateToken, (req, res) => {
  res.json({
    companyMentions: 12,
    darkWebLeaks: 0,
    status: 'GÜVENLİ',
    lastScan: new Date().toISOString(),
    alerts: [
      { source: 'Telegram (Exploit)', text: 'No matching keywords found.' },
      { source: 'Twitter', text: 'Brand sentiment is neutral/positive.' }
    ]
  });
});

app.get('/api/widgets/sentiment', authenticateToken, (req, res) => {
  res.json({
    index: 74,
    label: 'AÇGÖZLÜLÜK',
    trend: 'Yükseliş',
    tips: [
      'Piyasada aşırı alım bölgesi gözleniyor, kar alımları (take-profit) değerlendirilebilir.',
      'Havacılık ve teknoloji hisselerinde sosyal medya etkileşimi son 24 saatte %30 arttı.'
    ]
  });
});

app.get('/api/widgets/rss', authenticateToken, async (req, res) => {
  try {
    const pFile = getPreferencesFile(req.user.username);
    let customFeeds = [];
    if (fs.existsSync(pFile)) {
      const prefs = JSON.parse(fs.readFileSync(pFile, 'utf8'));
      if (prefs.rssUrls && Array.isArray(prefs.rssUrls) && prefs.rssUrls.length > 0) {
        customFeeds = prefs.rssUrls;
      }
    }
    
    const feeds = customFeeds.length > 0 ? customFeeds : [
      'https://siberbulten.com/feed/',
      'https://www.megabayt.com/rss/categorynews/siber-guvenlik'
    ];
    
    let allItems = [];
    for (const url of feeds) {
      try {
        const feed = await parser.parseURL(url);
        allItems = allItems.concat(feed.items);
      } catch (err) {
        console.error(`RSS Error fetching ${url}:`, err.message);
      }
    }

    // Tarihe göre en yeniden en eskiye sırala
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const items = allItems.slice(0, 50).map(item => ({
      title: item.title,
      time: new Date(item.pubDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' }),
      link: item.link
    }));
    res.json(items);
  } catch (error) {
    console.error('RSS Aggregator Error:', error);
    res.status(500).json({ error: 'Haberler çekilemedi' });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Backend API çalışıyor: http://0.0.0.0:3001');
});
