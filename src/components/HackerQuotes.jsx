import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

const quotes = [
  "Güvenlik bir ürün değil, bir süreçtir. - Bruce Schneier",
  "Sisteme girmek kolaydır, iz bırakmadan çıkmak sanattır.",
  "İki tür şirket vardır: Hacklendiklerini bilenler ve henüz bilmeyenler.",
  "Şifreler iç çamaşırı gibidir. Sık değiştirin ve ortalıkta bırakmayın.",
  "Eğer bir sistem çalışıyorsa, dokunma. Sadece izle.",
  "Bulut diye bir şey yok, sadece başkalarının bilgisayarları var.",
  "Sosyal mühendislik, insan donanımındaki açıkları kullanır.",
  "En iyi savunma, görünmez olmaktır.",
  "Ağ paketleri asla yalan söylemez.",
  "Sıfır güven, maksimum kontrol."
];

const HackerQuotes = ({ preferences }) => {
  const [quote, setQuote] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (preferences.hackerQuotes === false) return;

    const changeQuote = () => {
      setIsVisible(false);
      setTimeout(() => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
        setIsVisible(true);
      }, 1000);
    };

    // Initial quote
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Change quote every 30 seconds
    const interval = setInterval(changeQuote, 30000);
    return () => clearInterval(interval);
  }, [preferences.hackerQuotes]);

  if (preferences.hackerQuotes === false || !quote) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '30px',
      maxWidth: '350px',
      zIndex: 50,
      fontFamily: 'monospace',
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: preferences.theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '8px',
              border: `1px solid ${preferences.theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Terminal size={16} color={preferences.theme === 'light' ? '#3b82f6' : '#10b981'} style={{ marginTop: '2px' }} />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <span style={{ 
                color: preferences.theme === 'light' ? '#334155' : '#10b981',
                fontSize: '0.85rem'
              }}>
                {quote}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HackerQuotes;
