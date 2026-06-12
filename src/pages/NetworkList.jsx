import React, { useState, useEffect } from 'react';
import NetworkTopology from '../components/NetworkTopology';

const NetworkList = () => {
  const [networks, setNetworks] = useState([]);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'topology'
  const [selectedNote, setSelectedNote] = useState(null); // Modal state for notes
  
  const apiUrl = `http://${window.location.hostname}:3001/api/networks`;

  useEffect(() => {
    const token = localStorage.getItem('golgeToken');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(apiUrl, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setNetworks(data);
        else setNetworks([]);
      })
      .catch(e => {
        console.error("Network Fetch Error:", e);
        setError(true);
      });
  }, [apiUrl]);

  // Gruplama
  const vlans = networks.filter(n => n.type === 'vlan');
  const devices = networks.filter(n => n.type !== 'vlan');

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: 'var(--neon-cyan)', textShadow: '0 0 15px rgba(0,229,200,0.5)', letterSpacing: '2px', margin: 0 }}>
            AĞ VE SUNUCU YÖNETİMİ
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 0 0' }}>Proxmox ve OPNsense üzerindeki ağ yapıları ve sanal makineleriniz.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('list')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'list' ? 'var(--neon-cyan)' : 'transparent', color: activeTab === 'list' ? '#000' : 'var(--text-light)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📋 Liste Görünümü
          </button>
          <button 
            onClick={() => setActiveTab('topology')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'topology' ? 'var(--neon-cyan)' : 'transparent', color: activeTab === 'topology' ? '#000' : 'var(--text-light)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🗺️ Topoloji Haritası
          </button>
        </div>
      </div>
      
      {error && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.1)', color: 'var(--neon-red)', border: '1px solid var(--neon-red)', borderRadius: '8px', marginTop: '20px', marginBottom: '30px' }}>
          Backend (3001) bağlantısı kurulamadı. Sunucunun çalıştığından emin olun.
        </div>
      )}

      {networks.length === 0 && !error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-cyan)', borderRadius: '12px' }}>
          Henüz hiç ağ veya sunucu eklenmemiş. Admin panelinden ekleyebilirsiniz.
        </div>
      )}

      {activeTab === 'topology' && networks.length > 0 && (
        <div className="glass-panel" style={{ padding: '10px' }}>
          <NetworkTopology networks={networks} />
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          {vlans.map(vlan => {
            const vlanDevices = devices.filter(d => d.vlan === vlan.name);
            return (
              <div key={vlan.id} className="glass-panel glow-card" style={{ marginBottom: '30px', borderLeft: `4px solid ${vlan.status === 'online' ? '#25D366' : 'var(--neon-red)'}`, padding: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid rgba(0,229,200,0.2)', paddingBottom: '15px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '40px' }}>🌐</div>
                  <div>
                    <h2 style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>VLAN: {vlan.name}</h2>
                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {vlan.vlan && <span style={{ color: 'var(--neon-cyan)' }}>VLAN Tag: {vlan.vlan}</span>}
                      {vlan.subnet && <span style={{ color: '#ffcc00' }}>Subnet: {vlan.subnet}</span>}
                      {vlan.ip && <span style={{ color: 'var(--neon-green)' }}>Gateway: {vlan.ip}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {vlanDevices.length === 0 ? (
                     <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px' }}>Bu ağa bağlı cihaz bulunamadı.</div>
                  ) : (
                    vlanDevices.map(dev => (
                      <div key={dev.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                        {/* Status Indicator */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: dev.status === 'online' ? '#25D366' : dev.status === 'warning' ? '#ffcc00' : 'var(--neon-red)' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '24px', opacity: 0.8 }}>
                              {dev.type === 'qemu' ? '🖥️' : dev.type === 'node' ? '🖧' : '📦'}
                            </div>
                            <div>
                              <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-light)', fontSize: '16px' }}>{dev.name}</h3>
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '12px', textTransform: 'uppercase' }}>
                                  {dev.type}
                                </span>
                                {dev.os && (
                                  <span style={{ fontSize: '10px', background: 'rgba(0,229,200,0.1)', color: 'var(--neon-cyan)', padding: '2px 6px', borderRadius: '12px' }}>
                                    {dev.os}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>IP Adresi:</span>
                            <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>{dev.ip || 'Bilinmiyor'}</span>
                          </div>
                          {dev.ports && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Portlar:</span>
                              <span style={{ color: '#ffcc00' }}>{dev.ports}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            {dev.notes && (
                              <button onClick={() => setSelectedNote({ name: dev.name, notes: dev.notes })} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-light)', borderRadius: '5px', cursor: 'pointer' }}>
                                📝 Notu Oku
                              </button>
                            )}
                            <button style={{ flex: 1, padding: '8px', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', color: '#25D366', borderRadius: '5px', cursor: 'pointer' }}>▶ Başlat</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* VLAN'sız / Bağımsız Cihazlar */}
          {devices.filter(d => !d.vlan || d.vlan === '').length > 0 && (
             <div className="glass-panel" style={{ padding: '25px', opacity: 0.8 }}>
               <h2 style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>
                 Bağımsız Cihazlar (VLAN Atanmamış)
               </h2>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                 {/* ... aynı cihaz render mantığı ... */}
                 {devices.filter(d => !d.vlan || d.vlan === '').map(dev => (
                    <div key={dev.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: dev.status === 'online' ? '#25D366' : dev.status === 'warning' ? '#ffcc00' : 'var(--neon-red)' }}></div>
                        <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-light)', fontSize: '16px' }}>{dev.name}</h3>
                        <div style={{ color: 'var(--neon-green)', fontWeight: 'bold', fontSize: '13px' }}>IP: {dev.ip}</div>
                    </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      )}

      {/* Notlar Modalı */}
      {selectedNote && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', padding: '30px', position: 'relative' }}>
            <button onClick={() => setSelectedNote(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--neon-red)', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            <h2 style={{ color: 'var(--neon-cyan)', marginTop: 0 }}>📝 {selectedNote.name} Notları</h2>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px', color: 'var(--text-light)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {selectedNote.notes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkList;
