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

const SortableLinkCard = ({ link, backendUrl, onPingHeatmap }) => {
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <a 
        href={href} 
        target={link.openInNewTab ? "_blank" : "_self"} 
        rel="noopener noreferrer" 
        style={{ textDecoration: 'none' }}
        onClick={(e) => {
          if (isDragging) e.preventDefault();
          else onPingHeatmap(link.id);
        }}
      >
        <div className="glass-panel glow-card" style={{ height: '100%', cursor: 'grab', display: 'flex', flexDirection: 'column', padding: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            {link.icon ? (
                <img src={link.icon.startsWith('/') ? link.icon : `${backendUrl}/icons/${link.icon}`} alt="icon" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} 
                onError={(e) => { e.target.src = '/icons/default.svg'; }} />
            ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: link.colour !== '#161b1f' ? link.colour : 'rgba(0,229,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>
                    {link.title.substring(0, 2).toUpperCase()}
                </div>
            )}
            <div style={{ overflow: 'hidden' }}>
                <h3 style={{ color: 'var(--text-light)', margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.title}</h3>
                {link.appdescription && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 10px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {link.appdescription}
                    </p>
                )}
                <div style={{ color: 'var(--neon-cyan)', fontSize: '10px', wordBreak: 'break-all' }}>{link.url}</div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

const Home = () => {
  const [links, setLinks] = useState([]);
  const [error, setError] = useState(false);
  const backendUrl = `http://${window.location.hostname}:3001`;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag threshold to differentiate from click
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
      .then(data => setLinks(data))
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
        
        // Save to backend
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
      <h1 style={{ color: 'var(--neon-cyan)', textShadow: '0 0 15px rgba(0,229,200,0.5)', letterSpacing: '2px' }}>
        SİSTEM MERKEZİ
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
        Arama yapmak için <b>CTRL+K</b> kullanın. Kartları sürükleyip sıralayabilirsiniz.
      </p>
      
      {error && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.1)', color: 'var(--neon-red)', border: '1px solid var(--neon-red)', borderRadius: '8px', marginTop: '20px' }}>
          Backend (3001) bağlantısı kurulamadı. Sunucunun çalıştığından emin olun.
        </div>
      )}

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {catLinks.map((link) => (
                    <SortableLinkCard 
                      key={link.id} 
                      link={link} 
                      backendUrl={backendUrl} 
                      onPingHeatmap={pingHeatmap} 
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
