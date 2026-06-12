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
  const [heatmap, setHeatmap] = useState({});
  
  const [appForm, setAppForm] = useState({ title: '', url: '', colour: '#161b1f', appdescription: '', category: '', icon: '' });
  const [appEditId, setAppEditId] = useState(null);
  const [fetchingIcon, setFetchingIcon] = useState(false);
  const fileInputRef = useRef(null);

  const [tagForm, setTagForm] = useState({ title: '', colour: '#161b22' });
  const [tagEditId, setTagEditId] = useState(null);

  const apiUrl = `http://${window.location.hostname}:3001/api`;
  const backendUrl = `http://${window.location.hostname}:3001`;

  useEffect(() => {
    fetch(`${apiUrl}/links`).then(r => r.json()).then(setLinks).catch(e => console.error(e));
    fetch(`${apiUrl}/tags`).then(r => r.json()).then(setTags).catch(e => console.error(e));
    
    try {
      const token = localStorage.getItem('golgeToken');
      if (token) {
        fetch(`${apiUrl}/heatmap`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.json()).then(setHeatmap).catch(e => console.error(e));
      }
      
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
        <button onClick={() => setActiveTab('heatmap')} style={{ ...tabStyle, background: activeTab === 'heatmap' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'heatmap' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>🔥 ISI HARİTASI</button>
        <button onClick={() => setActiveTab('system')} style={{ ...tabStyle, background: activeTab === 'system' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'system' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>⚙️ SİSTEM</button>
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
                  <img 
                    src={appForm.icon.startsWith('http') ? appForm.icon : `${backendUrl}${appForm.icon.startsWith('/') ? '' : '/'}${appForm.icon}`} 
                    alt="icon" 
                    style={{ width: '32px', height: '32px', borderRadius: '5px' }} 
                    onError={(e) => { 
                      if (e.target.dataset.failed) return;
                      e.target.dataset.failed = true;
                      e.target.style.display = 'none'; 
                    }}
                  />
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
                    <img 
                      src={link.icon.startsWith('http') ? link.icon : `${backendUrl}${link.icon.startsWith('/') ? '' : '/'}${link.icon}`} 
                      alt="" 
                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)' }} 
                      onError={(e) => { 
                        if (e.target.dataset.failed) return;
                        e.target.dataset.failed = true;
                        e.target.style.display = 'none'; 
                      }}
                    />
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

      {activeTab === 'heatmap' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ color: 'var(--text-light)', borderBottom: '1px solid rgba(0,229,200,0.3)', paddingBottom: '10px', marginBottom: '10px' }}>
            🔥 Kullanım İstatistikleri
          </h2>
          {heatmap.startDate && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              ⏳ {new Date(heatmap.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinden itibaren kaydediliyor.
            </p>
          )}
          <div style={{ display: 'grid', gap: '10px' }}>
            {(!heatmap.clicks || Object.keys(heatmap.clicks).length === 0) ? (
              <p style={{ color: 'var(--text-muted)' }}>Henüz tıklama verisi yok.</p>
            ) : (
              Object.entries(heatmap.clicks).sort((a,b) => b[1] - a[1]).map(([linkId, count]) => {
                const link = links.find(l => l.id === linkId);
                const title = link ? link.title : 'Silinmiş Servis';
                const total = Object.values(heatmap.clicks).reduce((acc, c) => acc + c, 0);
                const pct = ((count / total) * 100).toFixed(1);
                
                return (
                  <div key={linkId} style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--neon-cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>{title}</span>
                      <span style={{ color: 'var(--neon-green)' }}>{count} Tıklama (%{pct})</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))' }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ color: 'var(--text-light)', borderBottom: '1px solid rgba(0,229,200,0.3)', paddingBottom: '10px', marginBottom: '20px' }}>
            💾 Yedekleme ve Geri Yükleme
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Sistemdeki tüm kısayollarınızı, etiketlerinizi ve ayarlarınızı tek bir JSON dosyası olarak bilgisayarınıza indirebilir veya yükleyebilirsiniz.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => {
                const token = localStorage.getItem('golgeToken');
                fetch(`${apiUrl}/export`, { headers: { 'Authorization': `Bearer ${token}` } })
                  .then(r => r.json())
                  .then(data => {
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `golge_backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }).catch(e => alert("Yedekleme başarısız oldu."));
              }} 
              style={{...btnStyle, padding: '15px 30px', fontSize: '16px', background: 'rgba(0,229,200,0.1)'}}
            >
              📥 SİSTEMİ YEDEKLE (EXPORT)
            </button>
            <input 
              type="file" 
              id="importInput" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('Tüm mevcut verileriniz silinip yedeğiniz yüklenecektir. Emin misiniz?')) {
                      const token = localStorage.getItem('golgeToken');
                      fetch(`${apiUrl}/import`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(data)
                      }).then(r => r.json()).then(res => {
                        if (res.success) {
                          alert("Yedek başarıyla yüklendi! Sayfa yenileniyor...");
                          window.location.reload();
                        } else {
                          alert("Hata oluştu.");
                        }
                      });
                    }
                  } catch (e) {
                    alert("Geçersiz yedek dosyası!");
                  }
                };
                reader.readAsText(file);
              }}
            />
            <button 
              onClick={() => document.getElementById('importInput').click()} 
              style={{...btnStyle, padding: '15px 30px', fontSize: '16px', borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}}
            >
              📤 YEDEK YÜKLE (IMPORT)
            </button>
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
