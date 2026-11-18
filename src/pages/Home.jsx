import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Info, Star, ExternalLink, Activity } from 'lucide-react';
import InfoDrawer from '../components/InfoDrawer';
import { RenderHomelabIcon, matchHomelabIcon } from '../utils/homelabIcons';

const SortableLinkCard = ({ 
  link, 
  backendUrl, 
  onPingHeatmap, 
  onOpenInfo, 
  isPinned, 
  onTogglePin,
  matomoStats 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: 'relative',
    opacity: isDragging ? 0.8 : 1,
  };

  const href = (link.url && !link.url.startsWith('http')) ? `http://${link.url}` : link.url;
  
  // Icon Resolution: 1. Manual Homelab Icon -> 2. Uploaded / Fetched URL -> 3. Auto Matched Homelab -> 4. Letter Initials
  const isHomelab = link.icon && link.icon.startsWith('homelab:');
  const homelabKey = isHomelab ? link.icon.replace('homelab:', '') : null;
  const autoMatchedKey = (!link.icon || link.icon.trim() === '') ? matchHomelabIcon(`${link.title} ${link.url}`) : null;

  // Determine LAN vs WAN
  const testStr = `${link.url || ''} ${link.ip || ''}`.toLowerCase();
  const isLan = testStr.includes('10.') || testStr.includes('192.168.') || testStr.includes('172.') || testStr.includes('localhost') || testStr.includes('.local');

  // Dynamic Brand-Colored Border & Glow
  const hasCustomColour = link.colour && link.colour.startsWith('#') && link.colour.toLowerCase() !== '#161b1f' && link.colour.toLowerCase() !== '#161b22';
  const accentColour = hasCustomColour ? link.colour : 'var(--neon-cyan)';
  const borderStyle = `1px solid ${hasCustomColour ? `${accentColour}40` : 'var(--border-cyan)'}`;
  const defaultShadow = `0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 15px ${accentColour}0a`;
  const hoverShadow = `0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px ${accentColour}45, inset 0 0 20px ${accentColour}12`;

  const isMatomoCard = link.title && link.title.toLowerCase().includes('matomo');

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div 
        className="glass-panel glow-card" 
        style={{ 
          height: '100%', 
          cursor: 'grab', 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '16px',
          border: borderStyle,
          boxShadow: defaultShadow,
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = accentColour;
          e.currentTarget.style.boxShadow = hoverShadow;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.border = borderStyle;
          e.currentTarget.style.boxShadow = defaultShadow;
        }}
      >
        {/* Subtle Top Accent Glow Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '20px',
          right: '20px',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${accentColour}, transparent)`,
          opacity: 0.85
        }} />

        {/* Action Buttons: Star (Pin) & Info Drawer */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', zIndex: 10 }}>
          {/* Star Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTogglePin(link.id);
            }}
            style={{
              background: isPinned ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isPinned ? '#FBBF24' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '6px',
              color: isPinned ? '#FBBF24' : 'var(--text-muted)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isPinned ? 'Sık Kullanılanlardan Kaldır' : 'Sık Kullanılanlara Ekle'}
          >
            <Star size={14} fill={isPinned ? '#FBBF24' : 'none'} />
          </button>

          {/* Info Drawer Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenInfo(link);
            }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(0, 229, 200, 0.25)',
              borderRadius: '6px',
              color: 'var(--text-muted)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.color = 'var(--neon-cyan)'; 
              e.currentTarget.style.borderColor = 'var(--neon-cyan)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 229, 200, 0.3)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.color = 'var(--text-muted)'; 
              e.currentTarget.style.borderColor = 'rgba(0, 229, 200, 0.25)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Servis Notları & Ağ Bilgileri"
          >
            <Info size={15} />
          </button>
        </div>

        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => {
            if (isDragging) e.preventDefault();
            else onPingHeatmap(link.id);
          }}
        >
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', paddingRight: '68px' }}>
            {/* Icon Box */}
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.05)', 
              border: `1px solid ${hasCustomColour ? `${accentColour}50` : 'rgba(255,255,255,0.1)'}`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0, 
              padding: '8px' 
            }}>
              {isHomelab ? (
                <RenderHomelabIcon iconKey={homelabKey} />
              ) : link.icon ? (
                <img 
                  src={link.icon.startsWith('http') ? link.icon : `${backendUrl}${link.icon.startsWith('/') ? '' : '/'}${link.icon}`} 
                  alt="" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  onError={(e) => { 
                    if (e.target.dataset.failed) return;
                    e.target.dataset.failed = true;
                    e.target.style.display = 'none'; 
                  }} 
                />
              ) : autoMatchedKey ? (
                <RenderHomelabIcon iconKey={autoMatchedKey} />
              ) : (
                <span style={{ color: accentColour, fontWeight: 'bold', fontSize: '18px' }}>
                  {(link.title || 'U').substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Title & Desc */}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <h3 style={{ color: 'var(--text-light)', margin: 0, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {link.title}
                </h3>
              </div>
              
              {link.appdescription && (
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 8px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {link.appdescription}
                </p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {/* LAN vs WAN Badge */}
                <span style={{
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  border: `1px solid ${isLan ? 'rgba(0, 255, 102, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`,
                  background: isLan ? 'rgba(0, 255, 102, 0.12)' : 'rgba(168, 85, 247, 0.15)',
                  color: isLan ? 'var(--neon-green)' : '#C084FC',
                }}>
                  {isLan ? 'LAN' : 'WAN ↗'}
                </span>

                {link.ip && (
                  <span style={{ color: 'var(--neon-green)', fontSize: '10px', background: 'rgba(0,255,102,0.1)', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {link.ip}
                  </span>
                )}

                {/* Matomo Daily Visitor Counter Badge (Multi-Site Support) */}
                {(() => {
                  if (!matomoStats || !matomoStats.configured) return null;
                  const title = (link.title || '').toLowerCase();
                  const url = (link.url || '').toLowerCase();

                  let count = null;
                  let label = 'Ziyaret';

                  if (title.includes('matomo')) {
                    count = matomoStats.total;
                    label = 'Toplam Ziyaret';
                  } else if (url.includes('golgesiber.com') || title.includes('golgesiber')) {
                    count = matomoStats.sites?.['4'];
                  } else if (url.includes('golgekitabevi.com') || title.includes('kitabevi')) {
                    count = matomoStats.sites?.['2'];
                  } else if (url.includes('dalaman') || title.includes('dalaman') || title.includes('casa turka')) {
                    count = matomoStats.sites?.['5'];
                  }

                  if (count === null || typeof count === 'undefined') return null;

                  return (
                    <span 
                      title={`Bugünkü tekil ziyaretçi sayısı (Matomo Analitik)`}
                      style={{
                        color: '#E0AAFF',
                        fontSize: '10px',
                        background: 'rgba(147, 51, 234, 0.2)',
                        border: '1px solid rgba(147, 51, 234, 0.45)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Activity size={10} color="#C084FC" />
                      {count} {label} (Bugün)
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </a>

      </div>
    </div>
  );
};

const Home = () => {
  const [links, setLinks] = useState([]);
  const [error, setError] = useState(false);
  const [selectedInfoLink, setSelectedInfoLink] = useState(null);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [matomoStats, setMatomoStats] = useState(null);
  const backendUrl = `http://${window.location.hostname}:3001`;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const token = localStorage.getItem('golgeToken');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Fetch Links
    fetch(`${backendUrl}/api/links`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => setLinks(Array.isArray(data) ? data : []))
      .catch(e => {
        console.error("Link Fetch Error:", e);
        setError(true);
      });

    // Fetch Preferences (Pinned links)
    fetch(`${backendUrl}/api/preferences`, { headers: authHeaders })
      .then(r => r.json())
      .then(prefs => {
        if (prefs && Array.isArray(prefs.pinnedIds)) {
          setPinnedIds(prefs.pinnedIds);
        }
      })
      .catch(() => {});

    // Fetch Matomo daily visits if configured
    fetch(`${backendUrl}/api/matomo-stats`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        if (data && data.configured) {
          setMatomoStats(data);
        }
      })
      .catch(() => {});
  }, [backendUrl]);

  const pingHeatmap = (id) => {
    const token = localStorage.getItem('golgeToken');
    fetch(`${backendUrl}/api/heatmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    }).catch(console.error);
  };

  const handleTogglePin = (id) => {
    const token = localStorage.getItem('golgeToken');
    setPinnedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      // Save to preferences
      fetch(`${backendUrl}/api/preferences`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(r => r.json())
        .then(currentPrefs => {
          fetch(`${backendUrl}/api/preferences`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...(currentPrefs || {}), pinnedIds: next })
          }).catch(console.error);
        })
        .catch(() => {});

      return next;
    });
  };

  const handleOpenAllInGroup = (catLinks) => {
    let blocked = false;
    catLinks.forEach((link, idx) => {
      const targetUrl = (link.url && !link.url.startsWith('http')) ? `http://${link.url}` : link.url;
      try {
        const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!win && idx > 0) blocked = true;
      } catch (e) {
        blocked = true;
      }
      pingHeatmap(link.id);
    });

    if (blocked) {
      alert("Tarayıcınız birden fazla sekme açılmasını engelledi. Lütfen adres çubuğunun en sağındaki 'Pop-up engellendi' 🚫 simgesine tıklayıp '10.10.10.101 için pop-up'lara her zaman izin ver' seçeneğini işaretleyin.");
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newLinks = arrayMove(items, oldIndex, newIndex);
        
        // Save order to backend
        const token = localStorage.getItem('golgeToken');
        fetch(`${backendUrl}/api/links`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newLinks)
        }).catch(console.error);

        return newLinks;
      });
    }
  };

  const pinnedLinks = links.filter(l => pinnedIds.includes(l.id));

  const groupedLinks = links.reduce((acc, link) => {
    const cat = (link.category && link.category.trim() !== '') ? link.category.trim() : 'Genel Servisler';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '35px', paddingRight: '280px' }}>
        <h1 style={{ color: 'var(--neon-cyan)', textShadow: '0 0 15px rgba(0,229,200,0.5)', letterSpacing: '2px', margin: '0 0 8px 0' }}>
          SİSTEM MERKEZİ
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
          Arama yapmak için <b>CTRL+K</b> kullanın. Kartları sürükleyip sıralayabilir, sol menüden <b>IPAM</b> ve <b>Hızlı Notlar</b>'a ulaşabilirsiniz.
        </p>
      </div>
      
      {error && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.1)', color: 'var(--neon-red)', border: '1px solid var(--neon-red)', borderRadius: '8px', marginBottom: '25px' }}>
          Backend servisi ile bağlantı kurulamadı. Lütfen sunucunun çalıştığından emin olun.
        </div>
      )}

      {/* Info Drawer */}
      <InfoDrawer 
        isOpen={!!selectedInfoLink} 
        onClose={() => setSelectedInfoLink(null)} 
        link={selectedInfoLink} 
        backendUrl={backendUrl} 
      />

      <div style={{ paddingBottom: '120px' }}>
        
        {/* ⭐ SIK KULLANILANLAR (PINNED FAVORITES) SECTION */}
        {pinnedLinks.length > 0 && (
          <div style={{ 
            marginBottom: '45px', 
            background: 'rgba(251, 191, 36, 0.03)', 
            border: '1px solid rgba(251, 191, 36, 0.2)', 
            borderRadius: '16px', 
            padding: '20px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star size={20} color="#FBBF24" fill="#FBBF24" />
                <h2 style={{ margin: 0, color: '#FDE68A', fontSize: '1.15rem', letterSpacing: '1px' }}>
                  SIK KULLANILANLAR
                </h2>
                <span style={{ fontSize: '11px', color: '#FBBF24', background: 'rgba(251, 191, 36, 0.12)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  {pinnedLinks.length} Servis
                </span>
              </div>

              <button
                onClick={() => handleOpenAllInGroup(pinnedLinks)}
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  color: '#FDE68A',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={12} />
                Tümünü Aç ({pinnedLinks.length})
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {pinnedLinks.map(link => (
                <SortableLinkCard 
                  key={'pin-' + link.id} 
                  link={link} 
                  backendUrl={backendUrl} 
                  onPingHeatmap={pingHeatmap} 
                  onOpenInfo={(item) => setSelectedInfoLink(item)}
                  isPinned={true}
                  onTogglePin={handleTogglePin}
                  matomoStats={matomoStats}
                />
              ))}
            </div>
          </div>
        )}

        {/* MAIN CATEGORIES */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(groupedLinks).map(([category, catLinks]) => (
            <div key={category} style={{ marginBottom: '50px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <h2 style={{ 
                  color: 'var(--text-light)', 
                  borderBottom: '1px solid rgba(0,229,200,0.3)', 
                  paddingBottom: '8px', 
                  margin: 0,
                  display: 'inline-block',
                  paddingRight: '20px'
                }}>
                  {category}
                </h2>

                {/* ↗️ İki Tıklamalı Çoklu Açılış Butonu */}
                <button
                  onClick={() => handleOpenAllInGroup(catLinks)}
                  style={{
                    background: 'rgba(0, 229, 200, 0.08)',
                    border: '1px solid rgba(0, 229, 200, 0.25)',
                    color: 'var(--neon-cyan)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0, 229, 200, 0.16)';
                    e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0, 229, 200, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(0, 229, 200, 0.25)';
                  }}
                  title="Bu kategorideki tüm servisleri yeni sekmelerde aç"
                >
                  <ExternalLink size={12} />
                  Hepsini Aç ({catLinks.length})
                </button>
              </div>
              
              <SortableContext 
                items={catLinks.map(l => l.id)}
                strategy={rectSortingStrategy}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {catLinks.map((link) => (
                    <SortableLinkCard 
                      key={link.id} 
                      link={link} 
                      backendUrl={backendUrl} 
                      onPingHeatmap={pingHeatmap} 
                      onOpenInfo={(item) => setSelectedInfoLink(item)}
                      isPinned={pinnedIds.includes(link.id)}
                      onTogglePin={handleTogglePin}
                      matomoStats={matomoStats}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </DndContext>
      </div>
    </div>
  );
};

export default Home;
