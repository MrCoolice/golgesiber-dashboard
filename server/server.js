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
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

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

const getLinksFile = (username) => path.join(__dirname, 'data', `links_${username}.json`);
const getPreferencesFile = (username) => path.join(__dirname, 'data', `preferences_${username}.json`);
const getTagsFile = (username) => path.join(__dirname, 'data', `tags_${username}.json`);
const getHeatmapFile = (username) => path.join(__dirname, 'data', `heatmap_${username}.json`);
const ICONS_DIR = path.join(__dirname, 'public', 'icons');

// Ensure directories exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
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
  
  // Create empty links, tags, preferences and heatmap for new user
  fs.writeFileSync(getLinksFile(newUsername), JSON.stringify([]));
  fs.writeFileSync(getPreferencesFile(newUsername), JSON.stringify({}));
  fs.writeFileSync(getTagsFile(newUsername), JSON.stringify([]));
  fs.writeFileSync(getHeatmapFile(newUsername), JSON.stringify({}));
  
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
  
  // Rename files if username changed
  if (newUsername !== oldUsername) {
    const oldLinksF = getLinksFile(oldUsername);
    const newLinksF = getLinksFile(newUsername);
    if (fs.existsSync(oldLinksF)) fs.renameSync(oldLinksF, newLinksF);

    const oldPrefF = getPreferencesFile(oldUsername);
    const newPrefF = getPreferencesFile(newUsername);
    if (fs.existsSync(oldPrefF)) fs.renameSync(oldPrefF, newPrefF);

    const oldTagsF = getTagsFile(oldUsername);
    const newTagsF = getTagsFile(newUsername);
    if (fs.existsSync(oldTagsF)) fs.renameSync(oldTagsF, newTagsF);

    const oldHeatF = getHeatmapFile(oldUsername);
    const newHeatF = getHeatmapFile(newUsername);
    if (fs.existsSync(oldHeatF)) fs.renameSync(oldHeatF, newHeatF);
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
  
  const prefFile = getPreferencesFile(username);
  if (fs.existsSync(prefFile)) fs.unlinkSync(prefFile);

  const lFile = getLinksFile(username);
  if (fs.existsSync(lFile)) fs.unlinkSync(lFile);
  
  const tFile = getTagsFile(username);
  if (fs.existsSync(tFile)) fs.unlinkSync(tFile);
  
  const hFile = getHeatmapFile(username);
  if (fs.existsSync(hFile)) fs.unlinkSync(hFile);
  
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

// --- HEATMAP ROUTES ---
app.get('/api/heatmap', authenticateToken, (req, res) => {
  const hFile = getHeatmapFile(req.user.username);
  fs.readFile(hFile, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return res.json({});
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try { res.json(JSON.parse(data)); } catch (e) { res.json({}); }
  });
});

app.post('/api/heatmap', authenticateToken, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID gerekli' });
  const hFile = getHeatmapFile(req.user.username);
  let heatmap = {};
  if (fs.existsSync(hFile)) {
    try { heatmap = JSON.parse(fs.readFileSync(hFile, 'utf8')); } catch (e) {}
  }
  heatmap[id] = (heatmap[id] || 0) + 1;
  fs.writeFileSync(hFile, JSON.stringify(heatmap, null, 2), 'utf8');
  res.json({ success: true });
});

// --- EXPORT / IMPORT ROUTES ---
app.get('/api/export', authenticateToken, (req, res) => {
  try {
    const username = req.user.username;
    const lFile = getLinksFile(username);
    const pFile = getPreferencesFile(username);
    const tFile = getTagsFile(username);
    const hFile = getHeatmapFile(username);
    
    const links = fs.existsSync(lFile) ? JSON.parse(fs.readFileSync(lFile, 'utf8')) : [];
    const preferences = fs.existsSync(pFile) ? JSON.parse(fs.readFileSync(pFile, 'utf8')) : {};
    const tags = fs.existsSync(tFile) ? JSON.parse(fs.readFileSync(tFile, 'utf8')) : [];
    const heatmap = fs.existsSync(hFile) ? JSON.parse(fs.readFileSync(hFile, 'utf8')) : {};
    
    res.json({ links, preferences, tags, heatmap });
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Dışa aktarma başarısız oldu' });
  }
});

app.post('/api/import', authenticateToken, (req, res) => {
  try {
    const { links, preferences, tags, heatmap } = req.body;
    const username = req.user.username;
    
    if (links) fs.writeFileSync(getLinksFile(username), JSON.stringify(links, null, 2));
    if (preferences) fs.writeFileSync(getPreferencesFile(username), JSON.stringify(preferences, null, 2));
    if (tags) fs.writeFileSync(getTagsFile(username), JSON.stringify(tags, null, 2));
    if (heatmap) fs.writeFileSync(getHeatmapFile(username), JSON.stringify(heatmap, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({ error: 'İçe aktarma başarısız oldu' });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Backend API çalışıyor: http://0.0.0.0:3001');
});
