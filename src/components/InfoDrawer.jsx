import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, Terminal, Server, Network, FileText, Hash } from 'lucide-react';
import { RenderHomelabIcon } from '../utils/homelabIcons';

const InfoDrawer = ({ isOpen, onClose, link, backendUrl }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen || !link) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isHomelabIcon = link.icon && link.icon.startsWith('homelab:');
  const homelabKey = isHomelabIcon ? link.icon.replace('homelab:', '') : null;
  const href = (link.url && !link.url.startsWith('http')) ? `http://${link.url}` : link.url;
  
  // SSH Command generator
  const sshCmd = link.ip ? `ssh root@${link.ip}${link.port && link.port !== '22' && link.port !== 22 ? ` -p ${link.port}` : ''}` : null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9000,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '460px',
            height: '100vh',
            backgroundColor: 'rgba(6, 13, 31, 0.96)',
            borderLeft: '1px solid var(--border-cyan)',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 200, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '24px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,229,200,0.1)', border: '1px solid var(--border-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', flexShrink: 0 }}>
                {isHomelabIcon ? (
                  <RenderHomelabIcon iconKey={homelabKey} />
                ) : link.icon ? (
                  <img 
                    src={link.icon.startsWith('http') ? link.icon : `${backendUrl}${link.icon.startsWith('/') ? '' : '/'}${link.icon}`} 
                    alt="" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Server size={24} color="var(--neon-cyan)" />
                )}
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', color: 'var(--text-light)', fontSize: '1.25rem', fontWeight: 700 }}>
                  {link.title}
                </h2>
                {link.category && (
                  <span style={{ fontSize: '11px', color: 'var(--neon-cyan)', background: 'rgba(0,229,200,0.15)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(0,229,200,0.3)' }}>
                    {link.category}
                  </span>
                )}
              </div>
            </div>

            <button 
              onClick={onClose} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
              title="Kapat"
            >
              <X size={22} />
            </button>
          </div>

          {/* Quick Direct Link Button */}
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              background: 'rgba(0, 229, 200, 0.12)',
              border: '1px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              borderRadius: '8px',
              fontWeight: 'bold',
              textDecoration: 'none',
              marginBottom: '28px',
              transition: 'all 0.2s ease'
            }}
            className="hover-pulse"
          >
            <span>Servisi Yeni Sekmede Aç</span>
            <ExternalLink size={16} />
          </a>

          {/* Network & Connection Info */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-green)', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '14px', textTransform: 'uppercase' }}>
              <Network size={16} />
              <span>Ağ ve Bağlantı Bilgileri</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* URL */}
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>WEB URL</div>
                  <div style={{ color: 'var(--text-light)', fontSize: '13px', wordBreak: 'break-all' }}>{link.url}</div>
                </div>
                <button 
                  onClick={() => handleCopy(link.url, 'url')} 
                  style={{ background: 'transparent', border: 'none', color: copiedKey === 'url' ? 'var(--neon-green)' : 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="URL'yi Kopyala"
                >
                  {copiedKey === 'url' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              {/* IP Address */}
              {link.ip && (
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>YEREL IP ADRESİ</div>
                    <div style={{ color: 'var(--neon-cyan)', fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold' }}>{link.ip}</div>
                  </div>
                  <button 
                    onClick={() => handleCopy(link.ip, 'ip')} 
                    style={{ background: 'transparent', border: 'none', color: copiedKey === 'ip' ? 'var(--neon-green)' : 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="IP'yi Kopyala"
                  >
                    {copiedKey === 'ip' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              )}

              {/* Port */}
              {link.port && (
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>SERVİS / SSH PORTU</div>
                    <div style={{ color: 'var(--text-light)', fontSize: '14px', fontFamily: 'monospace' }}>{link.port}</div>
                  </div>
                  <button 
                    onClick={() => handleCopy(link.port.toString(), 'port')} 
                    style={{ background: 'transparent', border: 'none', color: copiedKey === 'port' ? 'var(--neon-green)' : 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Portu Kopyala"
                  >
                    {copiedKey === 'port' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              )}

              {/* SSH Quick Command */}
              {sshCmd && (
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(0, 255, 102, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--neon-green)', fontSize: '11px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Terminal size={12} /> SSH BAĞLANTI KOMUTU
                    </div>
                    <div style={{ color: 'var(--text-light)', fontSize: '12px', fontFamily: 'monospace' }}>{sshCmd}</div>
                  </div>
                  <button 
                    onClick={() => handleCopy(sshCmd, 'ssh')} 
                    style={{ background: 'transparent', border: 'none', color: copiedKey === 'ssh' ? 'var(--neon-green)' : 'var(--neon-green)', cursor: 'pointer', padding: '4px' }}
                    title="SSH Komutunu Kopyala"
                  >
                    {copiedKey === 'ssh' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description & Operational Notes */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-cyan)', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '14px', textTransform: 'uppercase' }}>
              <FileText size={16} />
              <span>Servis Notları ve Açıklamalar</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {link.appdescription && (
                <div style={{ color: 'var(--text-light)', fontSize: '13px', lineHeight: '1.6', marginBottom: link.notes ? '14px' : '0' }}>
                  {link.appdescription}
                </div>
              )}

              {link.notes ? (
                <div style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '12px', 
                  lineHeight: '1.6', 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'monospace',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '12px',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--neon-cyan)'
                }}>
                  {link.notes}
                </div>
              ) : (
                !link.appdescription && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                    Bu servis için henüz özel bir teknik not veya açıklama eklenmemiş. Admin panelinden düzenleyebilirsiniz.
                  </div>
                )
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InfoDrawer;
