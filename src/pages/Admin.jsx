import React, { useState, useEffect, useRef } from 'react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('apps');
  
  const [links, setLinks] = useState([]);
  const [tags, setTags] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '' });
  const [userEditOldUsername, setUserEditOldUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastShared, setLastShared] = useState(null);
  const [preferences, setPreferences] = useState({});
  
  const [appForm, setAppForm] = useState({ title: '', url: '', colour: '#161b1f', appdescription: '', category: '', icon: '' });
  const [appEditId, setAppEditId] = useState(null);
  const [fetchingIcon, setFetchingIcon] = useState(false);
  const fileInputRef = useRef(null);

  const [tagForm, setTagForm] = useState({ title: '', colour: '#161b22' });
  const [tagEditId, setTagEditId] = useState(null);

  const [networks, setNetworks] = useState([]);
  const [networkForm, setNetworkForm] = useState({ name: '', type: 'lxc', ip: '', vlan: '', status: 'online', subnet: '', subnetRange: '', ports: '', notes: '', os: '' });
  const [networkEditId, setNetworkEditId] = useState(null);
  const [networkFormMode, setNetworkFormMode] = useState('device'); // 'device' or 'vlan'

  const apiUrl = `http://${window.location.hostname}:3001/api`;
  const backendUrl = `http://${window.location.hostname}:3001`;

  useEffect(() => {
    fetch(`${apiUrl}/links`).then(r => r.json()).then(setLinks).catch(e => console.error(e));
    fetch(`${apiUrl}/tags`).then(r => r.json()).then(setTags).catch(e => console.error(e));
    
    // Auth required for networks
    fetch(`${apiUrl}/networks`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('golgeToken')}` }
    }).then(r => r.json()).then(setNetworks).catch(e => console.error(e));
    
    // Preferences
    fetch(`${apiUrl}/preferences`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('golgeToken')}` }
    }).then(r => r.json()).then(setPreferences).catch(e => console.error(e));
    
    try {
      const userStr = localStorage.getItem('golgeUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          setIsAdmin(true);
          fetchUsers();
        }
      }
    } catch(e) {}
  }, []);

  const fetchUsers = () => {
    fetch(`${apiUrl}/users`).then(r => r.json()).then(data => {
      if(Array.isArray(data)) setUsersList(data);
    }).catch(e => console.error(e));
  };

  const saveLinks = (newLinks) => {
    fetch(`${apiUrl}/links`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLinks) })
      .then(() => setLinks(newLinks)).catch(e => alert('Hata: ' + e));
  };
  const saveTags = (newTags) => {
    fetch(`${apiUrl}/tags`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTags) })
      .then(() => setTags(newTags)).catch(e => alert('Hata: ' + e));
  };
  const saveNetworks = (newNetworks) => {
    fetch(`${apiUrl}/networks`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('golgeToken')}` }, body: JSON.stringify(newNetworks) })
      .then(() => setNetworks(newNetworks)).catch(e => alert('Hata: ' + e));
  };

  // --- ICON HANDLERS ---
  const handleFetchIcon = () => {
    const searchUrl = window.prompt("İkonunu çekmek istediğiniz sitenin adresini yazın (Örn: adguard.com):", appForm.url || "");
    if (!searchUrl) return;

    setFetchingIcon(true);
    fetch(`${apiUrl}/fetch-icon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: searchUrl })
    })
    .then(r => r.json())
    .then(data => {
      if (data.url) setAppForm({...appForm, icon: data.url});
      else alert(data.error || "İkon bulunamadı.");
    })
    .catch(() => alert("Sunucuya bağlanılamadı."))
    .finally(() => setFetchingIcon(false));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('icon', file);
    
    fetch(`${apiUrl}/upload`, { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        if(data.url) setAppForm({...appForm, icon: data.url});
      })
      .catch(() => alert("Dosya yükleme başarısız."));
  };

  // --- APP HANDLERS ---
  const handleAppSubmit = () => {
    if (!appForm.title || !appForm.url) return;
    if (appEditId) {
      saveLinks(links.map(l => l.id === appEditId ? { ...appForm, id: appEditId } : l));
      setAppEditId(null);
    } else {
      saveLinks([...links, { ...appForm, id: Date.now().toString() }]);
    }
    setAppForm({ title: '', url: '', colour: '#161b1f', appdescription: '', category: '', icon: '' });
  };
  const handleAppDelete = (id) => saveLinks(links.filter(l => l.id !== id));
  const handleAppEdit = (link) => {
    setAppForm({ title: link.title || '', url: link.url || '', colour: link.colour || '#161b1f', appdescription: link.appdescription || '', category: link.category || '', icon: link.icon || '' });
    setAppEditId(link.id);
  };

  // --- TAG HANDLERS ---
  const handleTagSubmit = () => {
    if (!tagForm.title) return;
    if (tagEditId) {
      saveTags(tags.map(t => t.id === tagEditId ? { ...tagForm, id: tagEditId } : t));
      setTagEditId(null);
    } else {
      saveTags([...tags, { ...tagForm, id: Date.now().toString() }]);
    }
    setTagForm({ title: '', colour: '#161b22' });
  };
  const handleTagDelete = (id) => saveTags(tags.filter(t => t.id !== id));
  const handleTagEdit = (tag) => {
    setTagForm({ title: tag.title || '', colour: tag.colour || '#161b22' });
    setTagEditId(tag.id);
  };

  // --- NETWORK HANDLERS ---
  const handleNetworkSubmit = () => {
    if (!networkForm.name) return;

    if (networkFormMode === 'device' && networkForm.vlan && networkForm.ip) {
      const parentVlan = networks.find(n => n.name === networkForm.vlan && n.type === 'vlan');
      if (parentVlan && parentVlan.subnet) {
        // Basic check if IP starts with the first 3 octets of subnet
        const parts = parentVlan.subnet.split('.');
        if (parts.length === 4) {
          const subnetPrefix = parts[0] + '.' + parts[1] + '.' + parts[2] + '.';
          if (!networkForm.ip.startsWith(subnetPrefix)) {
            alert(`Hata: Girdiğiniz IP adresi (${networkForm.ip}), seçili VLAN'ın subnet'i (${parentVlan.subnet}) ile uyuşmuyor!`);
            return;
          }
        }
      }
    }

    if (networkEditId) {
      saveNetworks(networks.map(n => n.id === networkEditId ? { ...networkForm, id: networkEditId } : n));
      setNetworkEditId(null);
    } else {
      saveNetworks([...networks, { ...networkForm, id: Date.now().toString() }]);
    }
    setNetworkForm({ name: '', type: networkFormMode === 'vlan' ? 'vlan' : 'lxc', ip: '', vlan: '', status: 'online', subnet: '', subnetRange: '', ports: '', notes: '', os: '' });
  };
  const handleNetworkDelete = (id) => saveNetworks(networks.filter(n => n.id !== id));
  const handleNetworkEdit = (net) => {
    setNetworkFormMode(net.type === 'vlan' ? 'vlan' : 'device');
    setNetworkForm({ name: net.name || '', type: net.type || (net.type === 'vlan' ? 'vlan' : 'lxc'), ip: net.ip || '', vlan: net.vlan || '', status: net.status || 'online', subnet: net.subnet || '', subnetRange: net.subnetRange || '', ports: net.ports || '', notes: net.notes || '', os: net.os || '' });
    setNetworkEditId(net.id);
  };

  // --- USER HANDLERS ---
  const handleUserSubmit = () => {
    if (!newUserForm.username) return;
    
    if (userEditOldUsername) {
      fetch(`${apiUrl}/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldUsername: userEditOldUsername, newUsername: newUserForm.username, newPassword: newUserForm.password })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          if (newUserForm.password) {
            setLastShared({ username: newUserForm.username, password: newUserForm.password });
          }
          alert('Kullanıcı güncellendi!');
          setUserEditOldUsername(null);
          setNewUserForm({ username: '', password: '' });
          fetchUsers();
        } else {
          alert(data.error || 'Hata');
        }
      })
      .catch(e => alert('Hata: ' + e));
    } else {
      if (!newUserForm.password) return;
      fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: newUserForm.username, newPassword: newUserForm.password })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLastShared({ username: newUserForm.username, password: newUserForm.password });
          alert('Kullanıcı oluşturuldu!');
          setNewUserForm({ username: '', password: '' });
          fetchUsers();
        } else {
          alert(data.error || 'Hata');
        }
      })
      .catch(e => alert('Hata: ' + e));
    }
  };

  const handleUserDelete = (username) => {
    if(confirm(`${username} kullanıcısını silmek istediğinize emin misiniz?`)) {
      fetch(`${apiUrl}/users/${username}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
          if(data.success) fetchUsers();
          else alert(data.error);
        });
    }
  };

  const handlePrefToggle = (widgetKey) => {
    const newPrefs = { ...preferences, [widgetKey]: preferences[widgetKey] === undefined ? false : !preferences[widgetKey] };
    setPreferences(newPrefs);
    fetch(`${apiUrl}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('golgeToken')}` },
      body: JSON.stringify(newPrefs)
    });
  };

  const handleCitySave = (e) => {
    const newPrefs = { ...preferences, weatherCity: e.target.value };
    setPreferences(newPrefs);
    fetch(`${apiUrl}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('golgeToken')}` },
      body: JSON.stringify(newPrefs)
    }).catch(e => alert('Ayarlar kaydedilemedi: ' + e));
  };

  const handleRssSave = (e) => {
    const urls = e.target.value.split('\n').map(u => u.trim()).filter(u => u !== '');
    const newPrefs = { ...preferences, rssUrls: urls };
    setPreferences(newPrefs);
    fetch(`${apiUrl}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('golgeToken')}` },
      body: JSON.stringify(newPrefs)
    }).catch(e => alert('Ayarlar kaydedilemedi: ' + e));
  };

  const handleUserEdit = (u) => {
    setUserEditOldUsername(u.username);
    setNewUserForm({ username: u.username, password: '' });
  };

  const sendWhatsApp = (u, p) => {
    const text = `GölgeSiber Yatırım Portalı'na hoş geldin! 🚀\n\nGiriş Adresi: http://${window.location.host}\nKullanıcı Adı: ${u}\nŞifre: ${p}\n\nGiriş yapıp kendi portföyünü oluşturmaya başlayabilirsin!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };


  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <h1 style={{ color: 'var(--neon-cyan)', textShadow: '0 0 15px rgba(0,229,200,0.5)', letterSpacing: '2px' }}>
        ⚙️ SİSTEM YÖNETİMİ
      </h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('tags')} style={{ ...tabStyle, background: activeTab === 'tags' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'tags' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>🏷️ KATEGORİLER</button>
        <button onClick={() => setActiveTab('apps')} style={{ ...tabStyle, background: activeTab === 'apps' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'apps' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>💻 UYGULAMALAR</button>
        <button onClick={() => setActiveTab('networks')} style={{ ...tabStyle, background: activeTab === 'networks' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'networks' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>🌐 AĞ YÖNETİMİ</button>
        <button onClick={() => setActiveTab('widgets')} style={{ ...tabStyle, background: activeTab === 'widgets' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'widgets' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>🧩 WİDGET MARKET</button>
        {isAdmin && <button onClick={() => setActiveTab('users')} style={{ ...tabStyle, background: activeTab === 'users' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'users' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>👥 KULLANICILAR</button>}
      </div>

      {activeTab === 'tags' && (
        <div>
          <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input placeholder="Kategori Adı (Örn: ☁️ Bulut)" value={tagForm.title} onChange={e => setTagForm({...tagForm, title: e.target.value})} style={{...inputStyle, flex: 1}} />
            <input type="color" value={tagForm.colour} onChange={e => setTagForm({...tagForm, colour: e.target.value})} style={{...inputStyle, padding: '0', width: '50px', height: '40px'}} title="Etiket Rengi" />
            <button onClick={handleTagSubmit} style={btnStyle} className="hover-pulse">{tagEditId ? '💾 GÜNCELLE' : '➕ EKLE'}</button>
            {tagEditId && <button onClick={() => { setTagEditId(null); setTagForm({ title: '', colour: '#161b22' }); }} style={{...btnStyle, color: 'var(--text-muted)'}}>İPTAL</button>}
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {tags.map(tag => (
              <div key={tag.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderLeft: `5px solid ${tag.colour !== '#161b22' ? tag.colour : 'var(--neon-cyan)'}` }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-light)', fontSize: '18px' }}>{tag.title}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleTagEdit(tag)} style={{...btnStyle, borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)'}}>✏️ DÜZENLE</button>
                    <button onClick={() => handleTagDelete(tag.id)} style={{...btnStyle, borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}}>🗑️ SİL</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'apps' && (
        <div>
          <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input placeholder="Başlık (Örn: AdGuard)" value={appForm.title} onChange={e => setAppForm({...appForm, title: e.target.value})} style={{...inputStyle, flex: 1}} />
              <input placeholder="URL (http://...)" value={appForm.url} onChange={e => setAppForm({...appForm, url: e.target.value})} style={{...inputStyle, flex: 2}} />
              <select value={appForm.category} onChange={e => setAppForm({...appForm, category: e.target.value})} style={{...inputStyle, flex: 1, cursor: 'pointer'}}>
                  <option value="">-- Kategori --</option>
                  {tags.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
              </select>
              <input type="color" value={appForm.colour} onChange={e => setAppForm({...appForm, colour: e.target.value})} style={{...inputStyle, padding: '0', width: '50px', height: '40px'}} title="Renk" />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: '5px', border: '1px solid var(--border-cyan)' }}>
                {appForm.icon ? (
                  <img src={`${backendUrl}${appForm.icon}`} alt="icon" style={{ width: '32px', height: '32px', borderRadius: '5px' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', background: 'var(--border-cyan)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>İKON</div>
                )}
                
                <button onClick={handleFetchIcon} disabled={fetchingIcon} style={{...btnStyle, padding: '5px 10px', fontSize: '12px'}} title="URL'den otomatik logoyu bul ve indir">
                  {fetchingIcon ? '⏳ BULUNUYOR...' : '🔍 LOGOYU BUL'}
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>veya</span>
                
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} style={{...btnStyle, padding: '5px 10px', fontSize: '12px', borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}} title="Bilgisayardan dosya seç">
                  📁 DOSYA YÜKLE
                </button>
              </div>

              <input placeholder="Kısa Açıklama" value={appForm.appdescription} onChange={e => setAppForm({...appForm, appdescription: e.target.value})} style={{...inputStyle, flex: 1}} />
              
              <button onClick={handleAppSubmit} style={{...btnStyle, marginLeft: 'auto'}} className="hover-pulse">{appEditId ? '💾 GÜNCELLE' : '➕ EKLE'}</button>
              {appEditId && <button onClick={() => { setAppEditId(null); setAppForm({ title: '', url: '', colour: '#161b1f', appdescription: '', category: '', icon: '' }); }} style={{...btnStyle, color: 'var(--text-muted)', borderColor: 'var(--text-muted)'}}>İPTAL</button>}
            </div>

          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {links.map(link => (
              <div key={link.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderLeft: `5px solid ${link.colour !== '#161b1f' ? link.colour : 'var(--neon-cyan)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {link.icon ? (
                    <img src={`${backendUrl}${link.icon}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: link.colour !== '#161b1f' ? link.colour : 'rgba(0,229,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontWeight: 'bold' }}>
                      {link.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-light)', fontSize: '18px' }}>
                      {link.title} 
                      {link.category && <span style={{ marginLeft: '10px', fontSize: '10px', background: 'rgba(0,229,200,0.2)', color: 'var(--neon-cyan)', padding: '3px 8px', borderRadius: '12px' }}>{link.category}</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--neon-green)', marginTop: '5px' }}>{link.url}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleAppEdit(link)} style={{...btnStyle, borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)'}}>✏️ DÜZENLE</button>
                    <button onClick={() => handleAppDelete(link.id)} style={{...btnStyle, borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}}>🗑️ SİL</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'networks' && (
        <div>
          <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button onClick={() => { setNetworkFormMode('device'); setNetworkForm({...networkForm, type: 'lxc'}); }} style={{ ...btnStyle, flex: 1, borderColor: networkFormMode === 'device' ? 'var(--neon-cyan)' : 'transparent', color: networkFormMode === 'device' ? 'var(--neon-cyan)' : 'var(--text-light)', background: networkFormMode === 'device' ? 'rgba(0,229,200,0.1)' : 'transparent' }}>
                🖥️ Yeni Cihaz Ekle
              </button>
              <button onClick={() => { setNetworkFormMode('vlan'); setNetworkForm({...networkForm, type: 'vlan'}); }} style={{ ...btnStyle, flex: 1, borderColor: networkFormMode === 'vlan' ? '#25D366' : 'transparent', color: networkFormMode === 'vlan' ? '#25D366' : 'var(--text-light)', background: networkFormMode === 'vlan' ? 'rgba(37,211,102,0.1)' : 'transparent' }}>
                🌐 Yeni VLAN Ekle
              </button>
            </div>

            {networkFormMode === 'vlan' ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input placeholder="VLAN Adı (Örn: Yönetim Ağı)" value={networkForm.name} onChange={e => setNetworkForm({...networkForm, name: e.target.value})} style={{...inputStyle, flex: 2}} />
                <input placeholder="Subnet (Örn: 10.10.10.0/24)" value={networkForm.subnet} onChange={e => setNetworkForm({...networkForm, subnet: e.target.value})} style={{...inputStyle, flex: 1}} />
                <input placeholder="IP Range (Örn: 10.10.10.10-100)" value={networkForm.subnetRange} onChange={e => setNetworkForm({...networkForm, subnetRange: e.target.value})} style={{...inputStyle, flex: 1}} />
                <input placeholder="VLAN ID (Örn: 100)" value={networkForm.vlan} onChange={e => setNetworkForm({...networkForm, vlan: e.target.value})} style={{...inputStyle, flex: 1}} />
                <input placeholder="Gateway IP" value={networkForm.ip} onChange={e => setNetworkForm({...networkForm, ip: e.target.value})} style={{...inputStyle, flex: 1}} />
                <select value={networkForm.status} onChange={e => setNetworkForm({...networkForm, status: e.target.value})} style={{...inputStyle, flex: 1, cursor: 'pointer'}}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="warning">Uyarı</option>
                </select>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input placeholder="Cihaz Adı (Örn: OpnSense / 101)" value={networkForm.name} onChange={e => setNetworkForm({...networkForm, name: e.target.value})} style={{...inputStyle, flex: 2}} />
                  <select value={networkForm.type} onChange={e => setNetworkForm({...networkForm, type: e.target.value})} style={{...inputStyle, flex: 1, cursor: 'pointer'}}>
                    <option value="lxc">LXC Container</option>
                    <option value="qemu">QEMU VM</option>
                    <option value="node">Proxmox Node</option>
                  </select>
                  <select value={networkForm.vlan} onChange={e => setNetworkForm({...networkForm, vlan: e.target.value})} style={{...inputStyle, flex: 2, cursor: 'pointer'}}>
                    <option value="">-- VLAN Seçin --</option>
                    {networks.filter(n => n.type === 'vlan').map(v => (
                      <option key={v.id} value={v.name}>{v.name} ({v.subnet})</option>
                    ))}
                  </select>
                  <input placeholder="IP Adresi (Örn: 192.168.1.5)" value={networkForm.ip} onChange={e => setNetworkForm({...networkForm, ip: e.target.value})} style={{...inputStyle, flex: 1}} />
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input placeholder="OS (Örn: Ubuntu, Windows)" value={networkForm.os} onChange={e => setNetworkForm({...networkForm, os: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <input placeholder="Portlar (Örn: 80, 443)" value={networkForm.ports} onChange={e => setNetworkForm({...networkForm, ports: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <select value={networkForm.status} onChange={e => setNetworkForm({...networkForm, status: e.target.value})} style={{...inputStyle, flex: 1, cursor: 'pointer'}}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="warning">Uyarı</option>
                  </select>
                </div>
                <textarea placeholder="Notlar..." value={networkForm.notes} onChange={e => setNetworkForm({...networkForm, notes: e.target.value})} style={{...inputStyle, width: '100%', minHeight: '60px'}} />
              </>
            )}

            <div style={{ width: '100%', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={handleNetworkSubmit} style={{...btnStyle, minWidth: '120px'}} className="hover-pulse">{networkEditId ? '💾 GÜNCELLE' : '➕ EKLE'}</button>
              {networkEditId && <button onClick={() => { setNetworkEditId(null); setNetworkForm({ name: '', type: 'lxc', ip: '', vlan: '', status: 'online', subnet: '', subnetRange: '', ports: '', notes: '', os: '' }); }} style={{...btnStyle, color: 'var(--text-muted)', borderColor: 'var(--text-muted)'}}>İPTAL</button>}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {networks.map(net => (
              <div key={net.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderLeft: `5px solid ${net.status === 'online' ? '#25D366' : net.status === 'warning' ? '#ffcc00' : 'var(--neon-red)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0,229,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-cyan)', fontSize: '20px' }}>
                    {net.type === 'vlan' ? '🌐' : net.type === 'qemu' ? '🖥️' : net.type === 'node' ? '🖧' : '📦'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-light)', fontSize: '18px' }}>
                      {net.name}
                      <span style={{ marginLeft: '10px', fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>{net.type}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '5px' }}>
                      {net.ip && <span style={{ marginRight: '10px', color: 'var(--neon-green)' }}>IP: {net.ip}</span>}
                      {net.vlan && <span style={{ color: 'var(--neon-cyan)' }}>VLAN/Tag: {net.vlan}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleNetworkEdit(net)} style={{...btnStyle, borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)'}}>✏️ DÜZENLE</button>
                    <button onClick={() => handleNetworkDelete(net.id)} style={{...btnStyle, borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}}>🗑️ SİL</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && isAdmin && (
        <div>
          <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input placeholder="Kullanıcı Adı" value={newUserForm.username} onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} style={{...inputStyle, flex: 1}} />
                <input placeholder={userEditOldUsername ? "Yeni Şifre (Değişmeyecekse boş bırakın)" : "Şifre Belirleyin"} value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} style={{...inputStyle, flex: 1}} />
                <button onClick={handleUserSubmit} style={btnStyle} className="hover-pulse">
                {userEditOldUsername ? '💾 GÜNCELLE' : '➕ KULLANICI OLUŞTUR'}
                </button>
                {userEditOldUsername && <button onClick={() => { setUserEditOldUsername(null); setNewUserForm({ username: '', password: '' }); }} style={{...btnStyle, color: 'var(--text-muted)'}}>İPTAL</button>}
            </div>
            {lastShared && (
                <div style={{ padding: '10px', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong style={{ color: '#25D366' }}>Tebrikler!</strong> İşlem başarılı.
                        <span style={{ marginLeft: '10px', color: 'var(--text-light)' }}>({lastShared.username} / {lastShared.password})</span>
                    </div>
                    <button onClick={() => sendWhatsApp(lastShared.username, lastShared.password)} style={{...btnStyle, borderColor: '#25D366', color: '#25D366'}}>
                        💬 BİLGİLERİ WHATSAPP İLE GÖNDER
                    </button>
                </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {usersList.map((u, i) => (
              <div key={i} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderLeft: `5px solid ${u.role === 'admin' ? 'var(--neon-red)' : 'var(--neon-cyan)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-light)', fontSize: '18px' }}>👤 {u.username}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px' }}>
                      Rol: {u.role === 'admin' ? 'Süper Admin' : 'Kullanıcı'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => sendWhatsApp(u.username, 'Mevcut Şifreniz (Güvenlik gereği gizlenmiştir)')} style={{...btnStyle, borderColor: '#25D366', color: '#25D366', padding: '5px 10px', fontSize: '12px'}}>💬 WHATSAPP</button>
                    <button onClick={() => handleUserEdit(u)} style={{...btnStyle, borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', padding: '5px 10px', fontSize: '12px'}}>✏️ DÜZENLE</button>
                    {u.role !== 'admin' && (
                        <button onClick={() => handleUserDelete(u.username)} style={{...btnStyle, borderColor: 'var(--neon-red)', color: 'var(--neon-red)', padding: '5px 10px', fontSize: '12px'}}>🗑️ SİL</button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'widgets' && (
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Dashboard ana sayfanızda görünmesini istediğiniz modülleri açıp kapatabilirsiniz.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              { key: 'ipo', icon: '🏛️', name: 'Halka Arz Takvimi', desc: 'Borsa İstanbul yaklaşan halka arzlar' },
              { key: 'whales', icon: '🐋', name: 'Kripto Balina Radarı', desc: 'Büyük para transferi alarmları' },
              { key: 'sentiment', icon: '🤖', name: 'Yapay Zeka Piyasa Analizi', desc: 'Korku/Açgözlülük ve AI Tiyoları' },
              { key: 'osint', icon: '🕵️‍♂️', name: 'Siber OSINT Monitörü', desc: 'Dark web ve marka sızıntı takibi' },
              { key: 'rss', icon: '📰', name: 'RSS Güvenlik Bülteni', desc: 'Güncel siber güvenlik haberleri' },
              { key: 'deface', icon: '🛡️', name: 'Deface & SSL Koruması', desc: 'Sitelerin SSL ve durum denetimi' },
              { key: 'weather', icon: '🌤️', name: 'Hava Durumu', desc: 'Canlı hava durumu ve sıcaklık' }
            ].map(w => {
              const isActive = preferences[w.key] !== false;
              return (
              <div key={w.key} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', borderLeft: `5px solid ${isActive ? '#25D366' : 'var(--border-cyan)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{w.icon}</span>
                  <strong style={{ color: 'var(--text-light)', fontSize: '18px' }}>{w.name}</strong>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, flex: 1 }}>{w.desc}</p>
                {w.key === 'weather' && (
                  <input 
                    type="text" 
                    placeholder="Şehir (Örn: Istanbul)"
                    defaultValue={preferences.weatherCity || ''}
                    onBlur={handleCitySave}
                    style={{ ...inputStyle, padding: '8px', fontSize: '12px' }}
                  />
                )}
                {w.key === 'rss' && (
                  <textarea 
                    placeholder="RSS URL'leri (Her satıra bir tane)"
                    defaultValue={preferences.rssUrls ? preferences.rssUrls.join('\n') : ''}
                    onBlur={handleRssSave}
                    style={{ ...inputStyle, padding: '8px', fontSize: '12px', minHeight: '60px', resize: 'vertical' }}
                  />
                )}
                <button 
                  onClick={() => handlePrefToggle(w.key)}
                  style={{ ...btnStyle, borderColor: isActive ? '#25D366' : 'var(--neon-cyan)', color: isActive ? '#25D366' : 'var(--neon-cyan)' }}
                >
                  {isActive ? '✅ AKTİF (Kapat)' : '➕ PASİF (Aç)'}
                </button>
              </div>
            )})}
          </div>
        </div>
      )}

    </div>
  );
};

const tabStyle = { color: 'var(--text-light)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s', border: '1px solid transparent' };
const inputStyle = { background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-cyan)', color: 'var(--text-light)', padding: '10px', borderRadius: '5px', outline: 'none' };
const btnStyle = { background: 'transparent', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' };

export default Admin;
