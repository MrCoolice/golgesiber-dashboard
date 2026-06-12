import React, { useState, useEffect } from 'react';

const Home = () => {
  const [links, setLinks] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [error, setError] = useState(false);
  const apiUrl = `http://${window.location.hostname}:3001/api/links`;
  const backendUrl = `http://${window.location.hostname}:3001`;

  useEffect(() => {
    const token = localStorage.getItem('golgeToken');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(apiUrl, { headers: authHeaders })
      .then(r => r.json())
      .then(data => setLinks(data))
      .catch(e => {
        console.error("Link Fetch Error:", e);
        setError(true);
      });

    fetch(`${backendUrl}/api/preferences`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => setPreferences(data || {}))
      .catch(console.error);
  }, []);

  const groupedLinks = links.reduce((acc, link) => {
    const cat = (link.category && link.category.trim() !== '') ? link.category.trim() : 'Genel Servisler';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--neon-cyan)', textShadow: '0 0 15px rgba(0,229,200,0.5)', letterSpacing: '2px' }}>
        SİSTEM MERKEZİ
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Merkezi sunucu kısayollarınız ve web servisleriniz.</p>
      
      {error && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.1)', color: 'var(--neon-red)', border: '1px solid var(--neon-red)', borderRadius: '8px', marginTop: '20px' }}>
          Backend (3001) bağlantısı kurulamadı. Sunucunun çalıştığından emin olun.
        </div>
      )}



      <div style={{ paddingBottom: '120px' }}>
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {catLinks.map((link) => {
                  const href = (link.url && !link.url.startsWith('http')) ? `http://${link.url}` : link.url;
                  return (
                      <a key={link.id} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <div className="glass-panel glow-card" style={{ height: '100%', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                              {link.icon ? (
                                  <img src={`${backendUrl}${link.icon}`} alt="icon" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
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
                  )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'fixed', top: '20px', right: '30px', zIndex: 10 }}>
      </div>
    </div>
  );
};

export default Home;
