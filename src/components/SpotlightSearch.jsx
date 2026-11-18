import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { RenderHomelabIcon, matchHomelabIcon } from '../utils/homelabIcons';

const SpotlightSearch = ({ isOpen, onClose, links = [], theme = 'dark' }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter links based on title, category, url or ip
  const filteredLinks = (links || []).filter(link => {
    const q = query.toLowerCase();
    const titleMatch = (link.title || '').toLowerCase().includes(q);
    const urlMatch = (link.url || '').toLowerCase().includes(q);
    const catMatch = (link.category || '').toLowerCase().includes(q);
    const ipMatch = (link.ip || '').toLowerCase().includes(q);
    return titleMatch || urlMatch || catMatch || ipMatch;
  }).slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const pingHeatmapAndOpen = (selectedLink) => {
    if (!selectedLink) return;
    const token = localStorage.getItem('golgeToken');
    const backendUrl = `http://${window.location.hostname}:3001`;

    fetch(`${backendUrl}/api/heatmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: selectedLink.id })
    }).catch(err => console.error("Heatmap ping failed:", err));

    const targetUrl = (selectedLink.url && !selectedLink.url.startsWith('http')) 
      ? `http://${selectedLink.url}` 
      : selectedLink.url;
      
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredLinks.length ? (prev + 1) % filteredLinks.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (filteredLinks.length ? (prev - 1 + filteredLinks.length) % filteredLinks.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredLinks.length > 0 && selectedIndex < filteredLinks.length) {
          pingHeatmapAndOpen(filteredLinks[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredLinks, selectedIndex, onClose]);

  if (!isOpen) return null;

  const backendUrl = `http://${window.location.hostname}:3001`;

  return (
    <AnimatePresence>
      <div 
        style={{
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
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)'
        }} 
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '620px',
            backgroundColor: '#0a1329',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(0, 229, 200, 0.2)',
            overflow: 'hidden',
            border: '1px solid var(--border-cyan)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0, 229, 200, 0.2)'
          }}>
            <Search size={22} color="var(--neon-cyan)" style={{ marginRight: '16px', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Uygulama, IP veya servis ara..."
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
                fontSize: '1.15rem',
                color: 'var(--text-light)',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>ESC</kbd>
            </div>
          </div>

          <div style={{ padding: '8px 0', maxHeight: '420px', overflowY: 'auto' }}>
            {filteredLinks.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Sonuç bulunamadı.
              </div>
            ) : (
              filteredLinks.map((link, index) => {
                const isHomelab = link.icon && link.icon.startsWith('homelab:');
                const homelabKey = isHomelab ? link.icon.replace('homelab:', '') : null;
                const autoKey = (!link.icon || link.icon.trim() === '') ? matchHomelabIcon(`${link.title} ${link.url}`) : null;
                const iconSrc = (!isHomelab && link.icon) 
                  ? (link.icon.startsWith('http') ? link.icon : `${backendUrl}${link.icon.startsWith('/') ? '' : '/'}${link.icon}`)
                  : null;

                return (
                  <div
                    key={link.id || index}
                    onClick={() => pingHeatmapAndOpen(link)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      backgroundColor: index === selectedIndex ? 'rgba(0, 229, 200, 0.12)' : 'transparent',
                      borderLeft: index === selectedIndex ? '4px solid var(--neon-cyan)' : '4px solid transparent',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', marginRight: '16px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isHomelab ? (
                        <RenderHomelabIcon iconKey={homelabKey} />
                      ) : iconSrc ? (
                        <img 
                          src={iconSrc} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : autoKey ? (
                        <RenderHomelabIcon iconKey={autoKey} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'rgba(0,229,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-cyan)', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>
                          {(link.title || 'U').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '0.95rem' }}>
                        {link.title}
                        {link.category && (
                          <span style={{ marginLeft: '8px', fontSize: '10px', color: 'var(--neon-cyan)', background: 'rgba(0,229,200,0.15)', padding: '2px 6px', borderRadius: '10px' }}>
                            {link.category}
                          </span>
                        )}
                        {link.ip && (
                          <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--neon-green)', background: 'rgba(0,255,102,0.1)', padding: '2px 6px', borderRadius: '6px', fontFamily: 'monospace' }}>
                            {link.ip}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {link.url}
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <div style={{ color: 'var(--neon-green)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
                        Aç <kbd style={{ background: 'rgba(0, 255, 102, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0, 255, 102, 0.3)', color: 'var(--neon-green)' }}>↵</kbd>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SpotlightSearch;
