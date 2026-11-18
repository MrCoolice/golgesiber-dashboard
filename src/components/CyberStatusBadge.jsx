import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, Server } from 'lucide-react';

const CyberStatusBadge = ({ linksCount = 0 }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateStr = currentTime.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const dayStr = currentTime.toLocaleDateString('tr-TR', { weekday: 'short' });
  const hostIp = window.location.hostname || '10.10.10.101';

  return (
    <div 
      className="cyber-status-badge"
      style={{
        position: 'fixed',
        top: '18px',
        right: '24px',
        zIndex: 100,
        background: 'rgba(6, 13, 31, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-cyan)',
        borderRadius: '10px',
        padding: '8px 16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(0, 229, 200, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        pointerEvents: 'default',
        userSelect: 'none'
      }}
    >
      {/* Top Row: System Status & Realtime Clock */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Pulsing Green Radar Dot */}
          <span 
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--neon-green)',
              boxShadow: '0 0 8px var(--neon-green)',
              display: 'inline-block',
              animation: 'pulse 1.8s infinite'
            }} 
          />
          <span style={{ 
            color: 'var(--neon-green)', 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '1px',
            fontFamily: 'monospace'
          }}>
            SOC AKTİF
          </span>
        </div>

        {/* Monospace Digital Clock */}
        <div style={{ 
          color: 'var(--neon-cyan)', 
          fontFamily: 'monospace', 
          fontSize: '14px', 
          fontWeight: 700, 
          letterSpacing: '1px',
          textShadow: '0 0 8px rgba(0, 229, 200, 0.4)'
        }}>
          {timeStr}
        </div>
      </div>

      {/* Bottom Row: Date, Service Count & Host IP */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        fontSize: '11px', 
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '4px',
        fontFamily: 'inherit'
      }}>
        <span>{dateStr} ({dayStr})</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
        {linksCount > 0 && (
          <>
            <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="var(--neon-cyan)" />
              {linksCount} Servis
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          </>
        )}
        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {hostIp}
        </span>
      </div>
    </div>
  );
};

export default CyberStatusBadge;
