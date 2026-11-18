import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Copy, Trash2, Check, Download, Terminal, Plus, ShieldAlert } from 'lucide-react';

const QuickNotesDrawer = ({ isOpen, onClose }) => {
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('golge_scratchpad_notes');
    if (saved) setNotes(saved);
  }, []);

  useEffect(() => {
    // Notify window that a drawer is open so other floating widgets can hide
    window.dispatchEvent(new CustomEvent('golge-drawer-state', { detail: { open: isOpen } }));
  }, [isOpen]);

  const handleChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem('golge_scratchpad_notes', val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Hızlı notları tamamen temizlemek istediğinize emin misiniz?')) {
      setNotes('');
      localStorage.removeItem('golge_scratchpad_notes');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `golge-notlar-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertSnippet = (snippet) => {
    const updated = (notes ? notes + '\n\n' : '') + snippet;
    setNotes(updated);
    localStorage.setItem('golge_scratchpad_notes', updated);
  };

  if (!isOpen) return null;

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
            maxWidth: '520px',
            height: '100vh',
            backgroundColor: 'rgba(6, 13, 31, 0.96)',
            borderLeft: '1px solid var(--border-cyan)',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 200, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(0, 229, 200, 0.1)',
                border: '1px solid var(--neon-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={18} color="var(--neon-cyan)" />
              </div>
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-light)', fontSize: '1.15rem', fontWeight: 'bold' }}>
                  HIZLI NOT DEFTERİ
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Otomatik yerel kayıt (LocalStorage)
                </span>
              </div>
            </div>

            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
              title="Kapat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Snippet Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => insertSnippet(`[${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}] - `)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-light)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              + Tarih Damgası
            </button>
            <button
              onClick={() => insertSnippet('ssh root@10.20.20. -p 22')}
              style={{
                background: 'rgba(0,255,102,0.08)',
                border: '1px solid rgba(0,255,102,0.2)',
                color: 'var(--neon-green)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              + SSH Şablonu
            </button>
            <button
              onClick={() => insertSnippet('curl -Iv https:// -k')}
              style={{
                background: 'rgba(0,229,200,0.08)',
                border: '1px solid rgba(0,229,200,0.2)',
                color: 'var(--neon-cyan)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              + cURL Testi
            </button>
          </div>

          {/* Text Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
            <textarea
              value={notes}
              onChange={handleChange}
              placeholder="Geçici IP adresleri, SSH komutları, port yönlendirme notları veya yapılacaklar listenizi buraya yazabilirsiniz..."
              style={{
                width: '100%',
                flex: 1,
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(0, 229, 200, 0.25)',
                borderRadius: '8px',
                padding: '16px',
                color: 'var(--text-light)',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                resize: 'none',
                outline: 'none',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--neon-cyan)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0, 229, 200, 0.25)'}
            />
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopy}
                disabled={!notes}
                style={{
                  background: copied ? 'rgba(0, 255, 102, 0.15)' : 'rgba(0, 229, 200, 0.1)',
                  border: `1px solid ${copied ? 'var(--neon-green)' : 'var(--border-cyan)'}`,
                  color: copied ? 'var(--neon-green)' : 'var(--neon-cyan)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: notes ? 'pointer' : 'not-allowed',
                  opacity: notes ? 1 : 0.5
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Kopyalandı' : 'Tümünü Kopyala'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!notes}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-light)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: notes ? 'pointer' : 'not-allowed',
                  opacity: notes ? 1 : 0.5
                }}
                title=".txt Olarak İndir"
              >
                <Download size={14} /> İndir
              </button>
            </div>

            <button
              onClick={handleClear}
              disabled={!notes}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--neon-red)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: notes ? 'pointer' : 'not-allowed',
                opacity: notes ? 1 : 0.5
              }}
              title="Notları Temizle"
            >
              <Trash2 size={14} /> Temizle
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickNotesDrawer;
