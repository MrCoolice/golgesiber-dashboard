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
import { Info } from 'lucide-react';
import InfoDrawer from '../components/InfoDrawer';
import { RenderHomelabIcon, matchHomelabIcon } from '../utils/homelabIcons';

const SortableLinkCard = ({ link, backendUrl, onPingHeatmap, onOpenInfo }) => {
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="glass-panel glow-card" style={{ height: '100%', cursor: 'grab', position: 'relative', display: 'flex', flexDirection: 'column', padding: '16px' }}>
        
        {/* Info Drawer Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenInfo(link);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
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
            transition: 'all 0.2s ease',
            zIndex: 10
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
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', paddingRight: '28px' }}>
            {/* Icon Box */}
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '8px' }}>
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
                <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '18px' }}>
                  {(link.title || 'U').substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Title & Desc */}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h3 style={{ color: 'var(--text-light)', margin: '0 0 5px 0', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {link.title}
              </h3>
              {link.appdescription && (
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 8px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {link.appdescription}
                </p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--neon-cyan)', fontSize: '10px', wordBreak: 'break-all' }}>
                  {link.url}
                </span>
                {link.ip && (
                  <span style={{ color: 'var(--neon-green)', fontSize: '10px', background: 'rgba(0,255,102,0.1)', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {link.ip}
                  </span>
                )}
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
  const backendUrl = `http://${window.location.hostname}:3001`;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px threshold to differentiate from click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const token = localStorage.getItem('golgeToken');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`${backendUrl}/api/links`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => setLinks(Array.isArray(data) ? data : []))
      .catch(e => {
        console.error("Link Fetch Error:", e);
        setError(true);
      });
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

  const groupedLinks = links.reduce((acc, link) => {
    const cat = (link.category && link.category.trim() !== '') ? link.category.trim() : 'Genel Servisler';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
      <h1 style={{ color: 'var(--neon-cyan)', textShadow: '0 0 15px rgba(0,229,200,0.5)', letterSpacing: '2px', margin: '0 0 8px 0' }}>
        SİSTEM MERKEZİ
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '35px' }}>
        Arama yapmak için <b>CTRL+K</b> kullanın. Kartları sürükleyip sıralayabilir, <b>ℹ️</b> butonuna tıklayarak ağ notlarını görüntüleyebilirsiniz.
      </p>
      
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
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(groupedLinks).map(([category, catLinks]) => (
            <div key={category} style={{ marginBottom: '50px' }}>
              <h2 style={{ 
                color: 'var(--text-light)', 
                borderBottom: '1px solid rgba(0,229,200,0.3)', 
                paddingBottom: '10px', 
                marginBottom: '20px',
                display: 'inline-block',
                paddingRight: '30px'
              }}>
                {category}
              </h2>
              
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
