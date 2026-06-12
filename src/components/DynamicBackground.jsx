import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DynamicBackground = ({ preferences }) => {
  const [bgUrl, setBgUrl] = useState('');
  
  useEffect(() => {
    // If user prefers static background or no background, respect that
    if (preferences.dynamicBackground === false) return;
    
    // Fetch a beautiful Unsplash random technology/abstract image
    // Note: We use source.unsplash for random images without needing API key
    const theme = preferences.theme === 'light' ? 'light,abstract' : 'dark,cyberpunk,technology';
    const url = `https://source.unsplash.com/random/1920x1080/?${theme}&sig=${new Date().getDay()}`;
    
    setBgUrl(url);
  }, [preferences.theme, preferences.dynamicBackground]);

  if (preferences.dynamicBackground === false) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -2,
      backgroundColor: preferences.theme === 'light' ? '#f0f2f5' : '#0f172a',
      overflow: 'hidden'
    }}>
      <AnimatePresence>
        {bgUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 2 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(8px)',
              transform: 'scale(1.05)'
            }}
          />
        )}
      </AnimatePresence>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: preferences.theme === 'light' 
          ? 'linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(240,242,245,0.9))'
          : 'linear-gradient(to bottom right, rgba(15,23,42,0.85), rgba(0,0,0,0.95))',
        zIndex: -1
      }} />
    </div>
  );
};

export default DynamicBackground;
