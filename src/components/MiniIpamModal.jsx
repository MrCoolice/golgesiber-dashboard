import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Search, ExternalLink, Copy, Check, Server, ChevronDown, ChevronUp, Shield, Hash } from 'lucide-react';
import { RenderHomelabIcon } from '../utils/homelabIcons';

const SUBNETS = [
  { id: 'vlan10', name: 'VLAN 10 - MGMT', desc: 'Yönetim, İzleme & Yedekleme', cidr: '10.10.10.0/24', prefix: '10.10.10.', color: '#00E5FF' },
  { id: 'vlan20', name: 'VLAN 20 - WEB', desc: 'Web Siteleri & Dışarı Açık DMZ Servisleri', cidr: '10.20.20.0/24', prefix: '10.20.20.', color: '#22C55E' },
  { id: 'vlan30', name: 'VLAN 30 - CLOUD', desc: 'Bulut Depolama, Dosya & Web Analitik', cidr: '10.30.30.0/24', prefix: '10.30.30.', color: '#3B82F6' },
  { id: 'vlan40', name: 'VLAN 40 - SEC', desc: 'Ağ Güvenliği, Reklam & Tehdit DNS (AdGuard)', cidr: '10.40.40.0/24', prefix: '10.40.40.', color: '#A855F7' },
  { id: 'vlan50', name: 'VLAN 50 - CORE', desc: 'OPNsense Çekirdek Güvenlik Duvarı & Yönlendirici', cidr: '10.50.50.0/24', prefix: '10.50.50.', color: '#EF4444' },
  { id: 'lan', name: 'LAN - FİZİKSEL', desc: 'Ev / Fiziksel Modem Ağı', cidr: '192.168.1.0/24', prefix: '192.168.1.', color: '#F59E0B' }
];

const MiniIpamModal = ({ isOpen, onClose, links = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubnet, setSelectedSubnet] = useState('all');
  const [copiedIp, setCopiedIp] = useState(null);
  const [collapsedSubnets, setCollapsedSubnets] = useState({});

  const handleCopy = (ip) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1800);
  };

  const toggleCollapse = (id) => {
    setCollapsedSubnets(prev => ({ ...prev, [id]: !prev[id] }));
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

    // Collect other/custom IPs
    const allKnownPrefixes = SUBNETS.map(s => s.prefix);
    const others = links.filter(l => l.ip && !allKnownPrefixes.some(p => l.ip.startsWith(p)));
    if (others.length > 0) {
      data.push({
        id: 'others',
        name: 'DİĞER / HARİCİ',
        desc: 'Farklı IP aralıkları veya dinamik adresler',
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
          padding: '24px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '1240px',
            height: '88vh',
            backgroundColor: 'rgba(6, 13, 31, 0.98)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '16px',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 229, 200, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '22px 30px',
            borderBottom: '1px solid rgba(0, 229, 200, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 229, 200, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(0, 229, 200, 0.12)',
                border: '1px solid var(--neon-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Network size={24} color="var(--neon-cyan)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ margin: 0, color: 'var(--text-light)', fontSize: '1.35rem', fontWeight: 'bold' }}>
                    SUBNET IP ADRES DEFTERİ (MİNİ IPAM)
                  </h2>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--neon-green)', background: 'rgba(0,255,102,0.12)', border: '1px solid var(--neon-green)', padding: '2px 10px', borderRadius: '12px' }}>
                    {totalAssignedCount} IP Atanmış
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Proxmox homelab veri merkezinizdeki tüm VM ve LXC'lerin VLAN bazlı statik IP dağılımı
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--neon-red)'; e.currentTarget.style.borderColor = 'var(--neon-red)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              title="Kapat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search & Subnet Filter Tabs */}
          <div style={{ padding: '16px 30px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="IP, makine adı, port veya VLAN ara (Örn: 10.20., 81, PBS, OPNsense)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(0, 229, 200, 0.25)',
                  borderRadius: '8px',
                  color: 'var(--text-light)',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--neon-cyan)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0, 229, 200, 0.25)'}
              />
            </div>

            {/* Subnet Quick Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedSubnet('all')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: selectedSubnet === 'all' ? 'rgba(0, 229, 200, 0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedSubnet === 'all' ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)'}`,
                  color: selectedSubnet === 'all' ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                TÜM VLAN'LAR ({totalAssignedCount})
              </button>
              {SUBNETS.map(s => {
                const count = links.filter(l => l.ip && l.ip.startsWith(s.prefix)).length;
                const isSel = selectedSubnet === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubnet(s.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: isSel ? `${s.color}25` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSel ? s.color : 'rgba(255,255,255,0.1)'}`,
                      color: isSel ? s.color : 'var(--text-muted)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {s.name.split(' - ')[0]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subnet Lists Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredSubnets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                Aradığınız kriterlere uygun IP veya makine bulunamadı.
              </div>
            ) : (
              filteredSubnets.map(sub => {
                const isCollapsed = collapsedSubnets[sub.id];

                return (
                  <div 
                    key={sub.id} 
                    style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: `1px solid ${sub.color}35`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    {/* Subnet Header Bar (Clickable to Collapse/Expand) */}
                    <div 
                      onClick={() => toggleCollapse(sub.id)}
                      style={{
                        padding: '14px 20px',
                        background: `linear-gradient(90deg, ${sub.color}18, rgba(0,0,0,0.3))`,
                        borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: sub.color, boxShadow: `0 0 10px ${sub.color}` }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--text-light)', fontWeight: 'bold', fontSize: '14px' }}>
                              {sub.name}
                            </span>
                            <span style={{ fontFamily: 'monospace', color: sub.color, fontSize: '12px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${sub.color}40` }}>
                              {sub.cidr}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {sub.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-light)', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px' }}>
                          <b>{sub.assigned.length}</b> Atanmış IP
                        </span>
                        {isCollapsed ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronUp size={18} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Subnet Table Content */}
                    {!isCollapsed && (
                      <div style={{ padding: '16px 20px' }}>
                        {sub.assigned.length === 0 ? (
                          <div style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                            Bu subnet için henüz bir servis kaydı atanmamış.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {sub.assigned.map(item => {
                              const isCopied = copiedIp === item.ip;
                              const isHomelab = item.icon && item.icon.startsWith('homelab:');
                              const homelabKey = isHomelab ? item.icon.replace('homelab:', '') : null;
                              const targetUrl = (item.url && !item.url.startsWith('http')) ? `http://${item.url}` : item.url;

                              return (
                                <div
                                  key={item.id}
                                  style={{
                                    background: 'rgba(255,255,255,0.025)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = sub.color;
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                                  }}
                                >
                                  {/* Left: Service Info & Icon */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                      width: '36px', 
                                      height: '36px', 
                                      borderRadius: '8px', 
                                      background: 'rgba(0,0,0,0.5)', 
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      flexShrink: 0,
                                      padding: '6px'
                                    }}>
                                      {isHomelab ? (
                                        <RenderHomelabIcon iconKey={homelabKey} size={20} />
                                      ) : item.icon ? (
                                        <img 
                                          src={item.icon.startsWith('http') ? item.icon : `http://${window.location.hostname}:3001${item.icon.startsWith('/') ? '' : '/'}${item.icon}`}
                                          alt=""
                                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                          onError={e => { e.target.style.display = 'none'; }}
                                        />
                                      ) : (
                                        <Server size={18} color={sub.color} />
                                      )}
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: 'bold' }}>
                                          {item.title}
                                        </span>
                                        {item.category && (
                                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                                            {item.category}
                                          </span>
                                        )}
                                      </div>
                                      {item.appdescription && (
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {item.appdescription}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Middle: Prominent IP & Port Badges */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                    <div style={{
                                      fontFamily: 'monospace',
                                      fontSize: '13px',
                                      fontWeight: 'bold',
                                      color: sub.color,
                                      background: 'rgba(0,0,0,0.5)',
                                      border: `1px solid ${sub.color}45`,
                                      padding: '4px 12px',
                                      borderRadius: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}>
                                      <span>{item.ip}</span>
                                    </div>

                                    {item.port && (
                                      <div style={{
                                        fontFamily: 'monospace',
                                        fontSize: '12px',
                                        color: 'var(--text-light)',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '4px 8px',
                                        borderRadius: '6px'
                                      }}>
                                        :{item.port}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Copy & Visit Actions */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <button
                                      onClick={() => handleCopy(item.ip)}
                                      style={{
                                        background: isCopied ? 'rgba(0,255,102,0.15)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${isCopied ? 'var(--neon-green)' : 'rgba(255,255,255,0.12)'}`,
                                        color: isCopied ? 'var(--neon-green)' : 'var(--text-muted)',
                                        borderRadius: '6px',
                                        padding: '6px 10px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        transition: 'all 0.2s ease'
                                      }}
                                      title="IP Adresini Kopyala"
                                    >
                                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                      <span>{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                                    </button>

                                    {targetUrl && (
                                      <a
                                        href={targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          background: 'rgba(0, 229, 200, 0.08)',
                                          border: '1px solid rgba(0, 229, 200, 0.25)',
                                          color: 'var(--neon-cyan)',
                                          borderRadius: '6px',
                                          padding: '6px 10px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          textDecoration: 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          transition: 'all 0.2s ease'
                                        }}
                                        title="Yeni Sekmede Aç"
                                      >
                                        <ExternalLink size={14} />
                                        <span>Aç</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
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

export default MiniIpamModal;
