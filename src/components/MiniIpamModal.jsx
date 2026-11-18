import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Search, ExternalLink, Copy, Check, Server, Shield, Layers } from 'lucide-react';
import { RenderHomelabIcon } from '../utils/homelabIcons';

const SUBNETS = [
  { id: 'vlan10', name: 'VLAN 10 - MGMT (Yönetim & İzleme)', cidr: '10.10.10.0/24', prefix: '10.10.10.', color: '#00E5FF' },
  { id: 'vlan20', name: 'VLAN 20 - WEB (Web & Dış Servisler)', cidr: '10.20.20.0/24', prefix: '10.20.20.', color: '#22C55E' },
  { id: 'vlan30', name: 'VLAN 30 - CLOUD (Bulut & Veri)', cidr: '10.30.30.0/24', prefix: '10.30.30.', color: '#3B82F6' },
  { id: 'vlan40', name: 'VLAN 40 - SEC (Güvenlik & DNS)', cidr: '10.40.40.0/24', prefix: '10.40.40.', color: '#A855F7' },
  { id: 'vlan50', name: 'VLAN 50 - CORE (OPNsense Güvenlik Duvarı)', cidr: '10.50.50.0/24', prefix: '10.50.50.', color: '#EF4444' },
  { id: 'lan', name: 'LAN - FİZİKSEL (Ev & Ana Ağ)', cidr: '192.168.1.0/24', prefix: '192.168.1.', color: '#F59E0B' }
];

const MiniIpamModal = ({ isOpen, onClose, links = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubnet, setSelectedSubnet] = useState('all');
  const [copiedIp, setCopiedIp] = useState(null);

  const handleCopy = (ip) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1800);
  };

  // Group services by subnet
  const subnetData = useMemo(() => {
    const data = SUBNETS.map(sub => {
      const assigned = links.filter(l => l.ip && l.ip.startsWith(sub.prefix)).sort((a, b) => {
        const lastA = parseInt(a.ip.split('.').pop(), 10) || 0;
        const lastB = parseInt(b.ip.split('.').pop(), 10) || 0;
        return lastA - lastB;
      });
      return {
        ...sub,
        assigned,
        count: assigned.length
      };
    });

    // Also collect unassigned or other IPs
    const allKnownPrefixes = SUBNETS.map(s => s.prefix);
    const others = links.filter(l => l.ip && !allKnownPrefixes.some(p => l.ip.startsWith(p)));
    if (others.length > 0) {
      data.push({
        id: 'others',
        name: 'DİĞER / HARİCİ IP ADRESLERİ',
        cidr: 'Custom',
        prefix: '',
        color: '#94A3B8',
        assigned: others,
        count: others.length
      });
    }

    return data;
  }, [links]);

  const filteredSubnets = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return subnetData.map(sub => {
      if (selectedSubnet !== 'all' && sub.id !== selectedSubnet) return null;
      
      const filteredLinks = sub.assigned.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.ip && item.ip.toLowerCase().includes(term)) ||
        (item.port && item.port.toString().includes(term)) ||
        (item.category && item.category.toLowerCase().includes(term))
      );

      if (term && filteredLinks.length === 0) return null;

      return {
        ...sub,
        assigned: term ? filteredLinks : sub.assigned
      };
    }).filter(Boolean);
  }, [subnetData, searchTerm, selectedSubnet]);

  const totalAssignedCount = useMemo(() => {
    return links.filter(l => l.ip && l.ip.trim() !== '').length;
  }, [links]);

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
          zIndex: 9500,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            backgroundColor: 'rgba(6, 13, 31, 0.98)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 229, 200, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(0, 229, 200, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 229, 200, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(0, 229, 200, 0.1)',
                border: '1px solid var(--neon-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Network size={22} color="var(--neon-cyan)" />
              </div>
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-light)', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  SUBNET IP ADRES DEFTERİ (MİNİ IPAM)
                  <span style={{ fontSize: '11px', color: 'var(--neon-green)', background: 'rgba(0,255,102,0.1)', border: '1px solid var(--neon-green)', padding: '2px 8px', borderRadius: '12px' }}>
                    {totalAssignedCount} IP Kayıtlı
                  </span>
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Tüm Sanal Makine (VM) ve Konteynerlerin (LXC) VLAN bazlı güncel IP haritası
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px'
              }}
              title="Kapat"
            >
              <X size={22} />
            </button>
          </div>

          {/* Search & Subnet Filter Tabs */}
          <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="IP, makine adı veya port ara (Örn: 10.20., 81, Dalaman)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(0, 229, 200, 0.25)',
                  borderRadius: '8px',
                  color: 'var(--text-light)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Subnet Quick Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedSubnet('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: selectedSubnet === 'all' ? 'rgba(0, 229, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedSubnet === 'all' ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)'}`,
                  color: selectedSubnet === 'all' ? 'var(--neon-cyan)' : 'var(--text-muted)'
                }}
              >
                TÜMÜ ({totalAssignedCount})
              </button>
              {SUBNETS.map(s => {
                const count = links.filter(l => l.ip && l.ip.startsWith(s.prefix)).length;
                const isSel = selectedSubnet === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubnet(s.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: isSel ? `${s.color}25` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSel ? s.color : 'rgba(255,255,255,0.1)'}`,
                      color: isSel ? s.color : 'var(--text-muted)'
                    }}
                  >
                    {s.cidr.split('/')[0]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subnet Tables Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredSubnets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Aradığınız kriterlere uygun IP veya servis bulunamadı.
              </div>
            ) : (
              filteredSubnets.map(sub => (
                <div 
                  key={sub.id} 
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: `1px solid ${sub.color}35`,
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subnet Header Bar */}
                  <div style={{
                    padding: '12px 18px',
                    background: `linear-gradient(90deg, ${sub.color}15, transparent)`,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: sub.color, boxShadow: `0 0 8px ${sub.color}` }} />
                      <span style={{ color: 'var(--text-light)', fontWeight: 'bold', fontSize: '13px' }}>
                        {sub.name}
                      </span>
                      <span style={{ fontFamily: 'monospace', color: sub.color, fontSize: '12px', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px' }}>
                        {sub.cidr}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      <b>{sub.assigned.length}</b> atanmış IP
                    </div>
                  </div>

                  {/* IP Items Table / Grid */}
                  {sub.assigned.length === 0 ? (
                    <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                      Bu subnet için tanımlı bir servis kaydı bulunmuyor.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '10px', padding: '14px' }}>
                      {sub.assigned.map(item => {
                        const isCopied = copiedIp === item.ip;
                        const isHomelab = item.icon && item.icon.startsWith('homelab:');
                        const homelabKey = isHomelab ? item.icon.replace('homelab:', '') : null;
                        const targetUrl = (item.url && !item.url.startsWith('http')) ? `http://${item.url}` : item.url;

                        return (
                          <div
                            key={item.id}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = sub.color;
                              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {isHomelab ? (
                                  <RenderHomelabIcon iconKey={homelabKey} size={16} />
                                ) : (
                                  <Server size={14} color={sub.color} />
                                )}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
                                  <span style={{ color: sub.color, fontWeight: 'bold' }}>{item.ip}</span>
                                  {item.port && <span style={{ color: 'var(--text-muted)' }}>:{item.port}</span>}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => handleCopy(item.ip)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: isCopied ? 'var(--neon-green)' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                                title="IP'yi Kopyala"
                              >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                              {targetUrl && (
                                <a
                                  href={targetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center' }}
                                  title="Yeni Sekmede Aç"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

export default MiniIpamModal;
