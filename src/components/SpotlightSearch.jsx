import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X } from 'lucide-react';

const SpotlightSearch = ({ isOpen, onClose, links, theme }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter links based on query
  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(query.toLowerCase()) ||
    link.url.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8); // Max 8 results

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredLinks.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredLinks.length) % filteredLinks.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredLinks.length > 0) {
          const selectedLink = filteredLinks[selectedIndex];
          
          // Fire heatmap API
          fetch('/api/heatmap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ id: selectedLink.id })
          }).catch(err => console.error("Heatmap ping failed:", err));

          window.open(selectedLink.url, selectedLink.openInNewTab ? '_blank' : '_self');
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredLinks, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '15vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)'
      }} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`
          }}>
            <Search size={24} color={theme === 'light' ? '#64748b' : '#94a3b8'} style={{ marginRight: '16px' }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Uygulama veya link ara..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '1.25rem',
                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
              <kbd style={{ background: theme === 'light' ? '#f1f5f9' : '#0f172a', padding: '2px 6px', borderRadius: '4px', border: `1px solid ${theme === 'light'?'#cbd5e1':'#334155'}` }}>ESC</kbd>
            </div>
          </div>

          <div style={{ padding: '8px 0', maxHeight: '400px', overflowY: 'auto' }}>
            {filteredLinks.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                Sonuç bulunamadı.
              </div>
            ) : (
              filteredLinks.map((link, index) => (
                <div
                  key={link.id}
                  onClick={() => {
                    fetch('/api/heatmap', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({ id: link.id })
                    }).catch(err => console.error(err));
                    window.open(link.url, link.openInNewTab ? '_blank' : '_self');
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    backgroundColor: index === selectedIndex 
                      ? (theme === 'light' ? '#f1f5f9' : '#334155') 
                      : 'transparent',
                    transition: 'background-color 0.1s'
                  }}
                >
                  <img 
                    src={link.icon.startsWith('/') ? link.icon : `/icons/${link.icon}`} 
                    alt={link.title} 
                    style={{ width: '24px', height: '24px', marginRight: '16px', borderRadius: '4px' }}
                    onError={(e) => { e.target.src = '/icons/default.svg'; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', fontWeight: 500 }}>
                      {link.title}
                    </div>
                    <div style={{ color: theme === 'light' ? '#64748b' : '#94a3b8', fontSize: '0.85rem' }}>
                      {link.url}
                    </div>
                  </div>
                  {index === selectedIndex && (
                    <div style={{ color: '#3b82f6', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Git <kbd style={{ background: theme === 'light' ? '#e2e8f0' : '#0f172a', padding: '2px 6px', borderRadius: '4px', border: `1px solid ${theme === 'light'?'#cbd5e1':'#334155'}`, marginLeft:'4px', color:'#94a3b8' }}>↵</kbd>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SpotlightSearch;
