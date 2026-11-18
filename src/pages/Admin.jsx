import React, { useState, useEffect, useRef } from 'react';
import { HOMELAB_ICONS, RenderHomelabIcon, matchHomelabIcon } from '../utils/homelabIcons';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('apps');
  
  const [links, setLinks] = useState([]);
  const [tags, setTags] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'user' });
  const [userEditOldUsername, setUserEditOldUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastShared, setLastShared] = useState(null);
  const [heatmap, setHeatmap] = useState({});
  const [heatmapFilter, setHeatmapFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  
  const [appForm, setAppForm] = useState({ 
    title: '', 
    url: '', 
    colour: '#161b1f', 
    appdescription: '', 
    category: '', 
    icon: '',
    ip: '',
    port: '',
    notes: ''
  });
  const [appEditId, setAppEditId] = useState(null);
  const [fetchingIcon, setFetchingIcon] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const fileInputRef = useRef(null);

  const [tagForm, setTagForm] = useState({ title: '', colour: '#161b22' });
  const [tagEditId, setTagEditId] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

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

    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const fetchUsers = () => {
    fetch(`${apiUrl}/users`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsersList(data);
    }).catch(e => console.error(e));
  };

  const saveLinks = (newLinks) => {
    fetch(`${apiUrl}/links`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(newLinks) 
    })
      .then(() => {
        setLinks(newLinks);
        showToast('Uygulama listesi kaydedildi.', 'success');
      })
      .catch(e => showToast('Kaydedilemedi: ' + e.message, 'error'));
  };

  const saveTags = (newTags) => {
    fetch(`${apiUrl}/tags`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(newTags) 
    })
      .then(() => {
        setTags(newTags);
        showToast('Kategoriler güncellendi.', 'success');
      })
      .catch(e => showToast('Kaydedilemedi: ' + e.message, 'error'));
  };

  // Auto-detect Homelab icon when typing title or URL if no icon is explicitly set
  const handleTitleChange = (val) => {
    const nextForm = { ...appForm, title: val };
    if (!appForm.icon || appForm.icon.startsWith('homelab:')) {
      const matched = matchHomelabIcon(val + ' ' + appForm.url);
      if (matched) nextForm.icon = `homelab:${matched}`;
    }
    setAppForm(nextForm);
  };

  const handleUrlChange = (val) => {
    const nextForm = { ...appForm, url: val };
    if (!appForm.icon || appForm.icon.startsWith('homelab:')) {
      const matched = matchHomelabIcon(appForm.title + ' ' + val);
      if (matched) nextForm.icon = `homelab:${matched}`;
    }
    setAppForm(nextForm);
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
      if (data.url) {
        setAppForm({...appForm, icon: data.url});
        showToast('İkon başarıyla çekildi.', 'success');
      } else {
        showToast(data.error || "İkon bulunamadı.", 'error');
      }
    })
    .catch(() => showToast("Sunucuya bağlanılamadı.", 'error'))
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
        if (data.url) {
          setAppForm({...appForm, icon: data.url});
          showToast('Özel logo başarıyla yüklendi.', 'success');
        }
      })
      .catch(() => showToast("Dosya yükleme başarısız.", 'error'));
  };

  // --- APP HANDLERS ---
  const handleAppSubmit = () => {
    if (!appForm.title || !appForm.url) {
      showToast('Başlık ve URL alanları zorunludur.', 'error');
      return;
    }
    if (appEditId) {
      saveLinks(links.map(l => l.id === appEditId ? { ...appForm, id: appEditId } : l));
      setAppEditId(null);
    } else {
      saveLinks([...links, { ...appForm, id: Date.now().toString() }]);
    }
    setAppForm({ 
      title: '', 
      url: '', 
      colour: '#161b1f', 
      appdescription: '', 
      category: '', 
      icon: '',
      ip: '',
      port: '',
      notes: ''
    });
  };

  const handleAppDelete = (id) => {
    const target = links.find(l => l.id === id);
    const title = target ? target.title : 'Bu uygulamayı';
    if (window.confirm(`"${title}" servisini silmek istediğinize emin misiniz?`)) {
      saveLinks(links.filter(l => l.id !== id));
      showToast(`"${title}" silindi.`, 'info');
    }
  };

  const handleAppEdit = (link) => {
    setAppForm({ 
      title: link.title || '', 
      url: link.url || '', 
      colour: link.colour || '#161b1f', 
      appdescription: link.appdescription || '', 
      category: link.category || '', 
      icon: link.icon || '',
      ip: link.ip || '',
      port: link.port || '',
      notes: link.notes || ''
    });
    setAppEditId(link.id);
  };

  // --- TAG HANDLERS ---
  const handleTagSubmit = () => {
    if (!tagForm.title) {
      showToast('Kategori adı zorunludur.', 'error');
      return;
    }
    if (tagEditId) {
      saveTags(tags.map(t => t.id === tagEditId ? { ...tagForm, id: tagEditId } : t));
      setTagEditId(null);
    } else {
      saveTags([...tags, { ...tagForm, id: Date.now().toString() }]);
    }
    setTagForm({ title: '', colour: '#161b22' });
  };

  const handleTagDelete = (id) => {
    const target = tags.find(t => t.id === id);
    const title = target ? target.title : 'Bu kategoriyi';
    if (window.confirm(`"${title}" kategorisini silmek istediğinize emin misiniz?`)) {
      saveTags(tags.filter(t => t.id !== id));
      showToast(`"${title}" kategorisi silindi.`, 'info');
    }
  };

  const handleTagEdit = (tag) => {
    setTagForm({ title: tag.title || '', colour: tag.colour || '#161b22' });
    setTagEditId(tag.id);
  };

  // --- USER HANDLERS ---
  const handleUserSubmit = () => {
    if (!newUserForm.username) {
      showToast('Kullanıcı adı gerekli.', 'error');
      return;
    }
    
    if (userEditOldUsername) {
      fetch(`${apiUrl}/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldUsername: userEditOldUsername, 
          newUsername: newUserForm.username, 
          newPassword: newUserForm.password, 
          role: newUserForm.role 
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          if (newUserForm.password) {
            setLastShared({ username: newUserForm.username, password: newUserForm.password });
          }
          showToast('Kullanıcı başarıyla güncellendi!', 'success');
          setUserEditOldUsername(null);
          setNewUserForm({ username: '', password: '', role: 'user' });
          fetchUsers();
        } else {
          showToast(data.error || 'İşlem başarısız.', 'error');
        }
      })
      .catch(e => showToast('Hata: ' + e.message, 'error'));
    } else {
      if (!newUserForm.password) {
        showToast('Şifre belirlemelisiniz.', 'error');
        return;
      }
      fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newUsername: newUserForm.username, 
          newPassword: newUserForm.password, 
          role: newUserForm.role 
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLastShared({ username: newUserForm.username, password: newUserForm.password });
          showToast('Kullanıcı hesabı oluşturuldu!', 'success');
          setNewUserForm({ username: '', password: '', role: 'user' });
          fetchUsers();
        } else {
          showToast(data.error || 'İşlem başarısız.', 'error');
        }
      })
      .catch(e => showToast('Hata: ' + e.message, 'error'));
    }
  };

  const handleUserDelete = (username) => {
    if (window.confirm(`${username} kullanıcısını silmek istediğinize emin misiniz?`)) {
      fetch(`${apiUrl}/users/${username}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            fetchUsers();
            showToast(`${username} hesabı silindi.`, 'info');
          } else {
            showToast(data.error || 'Silinemedi.', 'error');
          }
        })
        .catch(e => showToast('Hata: ' + e.message, 'error'));
    }
  };

  const handleUserEdit = (u) => {
    setUserEditOldUsername(u.username);
    setNewUserForm({ username: u.username, password: '', role: u.role || 'user' });
  };

  const sendWhatsApp = (u, p) => {
    const text = `Gölge Dashboard erişim bilgileriniz: 🚀\n\nAdres: http://${window.location.host}\nKullanıcı: ${u}\nŞifre: ${p}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isFormHomelab = appForm.icon && appForm.icon.startsWith('homelab:');
  const formHomelabKey = isFormHomelab ? appForm.icon.replace('homelab:', '') : null;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', position: 'relative' }}>
      
      {/* Toast Notification Banner */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 9999,
            padding: '12px 24px',
            borderRadius: '8px',
            background: toast.type === 'error' ? 'rgba(255, 68, 68, 0.95)' : (toast.type === 'info' ? 'rgba(0, 229, 200, 0.95)' : 'rgba(0, 255, 102, 0.95)'),
            color: '#000',
            fontWeight: 'bold',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <span>{toast.type === 'error' ? '⚠️' : (toast.type === 'info' ? 'ℹ️' : '✅')}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Homelab Icon Picker Modal */}
      {showIconPicker && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10000,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowIconPicker(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '80vh',
              background: '#0a1329',
              border: '1px solid var(--border-cyan)',
              borderRadius: '12px',
              padding: '24px',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '1.2rem' }}>⚡ Dahili Homelab İkon Kütüphanesi</h3>
              <button 
                onClick={() => setShowIconPicker(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {Object.entries(HOMELAB_ICONS).map(([key, item]) => (
                <div 
                  key={key}
                  onClick={() => {
                    setAppForm({ ...appForm, icon: `homelab:${key}` });
                    setShowIconPicker(false);
                    showToast(`"${item.name}" ikonu seçildi.`, 'success');
                  }}
                  style={{
                    background: appForm.icon === `homelab:${key}` ? 'rgba(0, 229, 200, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: appForm.icon === `homelab:${key}` ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="hover-pulse"
                >
                  <div style={{ width: '36px', height: '36px' }}>
                    {item.svg}
                  </div>
                  <span style={{ color: 'var(--text-light)', fontSize: '12px', textAlign: 'center', fontWeight: 500 }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h1 style={{ color: 'var(--neon-cyan)', textShadow: '0 0 15px rgba(0,229,200,0.5)', letterSpacing: '2px' }}>
        ⚙️ SİSTEM YÖNETİMİ
      </h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('apps')} style={{ ...tabStyle, background: activeTab === 'apps' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'apps' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>💻 UYGULAMALAR</button>
        <button onClick={() => setActiveTab('tags')} style={{ ...tabStyle, background: activeTab === 'tags' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'tags' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>🏷️ KATEGORİLER</button>
        <button onClick={() => setActiveTab('heatmap')} style={{ ...tabStyle, background: activeTab === 'heatmap' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'heatmap' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>🔥 ISI HARİTASI</button>
        <button onClick={() => setActiveTab('system')} style={{ ...tabStyle, background: activeTab === 'system' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'system' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>⚙️ SİSTEM</button>
        {isAdmin && <button onClick={() => setActiveTab('users')} style={{ ...tabStyle, background: activeTab === 'users' ? 'rgba(0,229,200,0.2)' : 'transparent', borderColor: activeTab === 'users' ? 'var(--neon-cyan)' : 'var(--border-cyan)' }}>👥 KULLANICILAR</button>}
      </div>

      {activeTab === 'apps' && (
        <div>
          <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Row 1: Title, URL, Category, Color */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                placeholder="Başlık (Örn: Proxmox VE)" 
                value={appForm.title} 
                onChange={e => handleTitleChange(e.target.value)} 
                style={{...inputStyle, flex: 1, minWidth: '180px'}} 
              />
              <input 
                placeholder="Web URL (http://...)" 
                value={appForm.url} 
                onChange={e => handleUrlChange(e.target.value)} 
                style={{...inputStyle, flex: 2, minWidth: '220px'}} 
              />
              <select 
                value={appForm.category} 
                onChange={e => setAppForm({...appForm, category: e.target.value})} 
                style={{...inputStyle, flex: 1, cursor: 'pointer', minWidth: '150px'}}
              >
                  <option value="">-- Kategori Seç --</option>
                  {tags.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
              </select>
              <input 
                type="color" 
                value={appForm.colour} 
                onChange={e => setAppForm({...appForm, colour: e.target.value})} 
                style={{...inputStyle, padding: '0', width: '50px', height: '40px', cursor: 'pointer'}} 
                title="Vurgu Rengi" 
              />
            </div>

            {/* Row 2: IP, Port, Short Description */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                placeholder="Yerel IP Adresi (Örn: 10.10.10.50)" 
                value={appForm.ip} 
                onChange={e => setAppForm({...appForm, ip: e.target.value})} 
                style={{...inputStyle, flex: 1, minWidth: '160px'}} 
              />
              <input 
                placeholder="Servis / SSH Portu (Örn: 8006, 22)" 
                value={appForm.port} 
                onChange={e => setAppForm({...appForm, port: e.target.value})} 
                style={{...inputStyle, width: '180px'}} 
              />
              <input 
                placeholder="Kısa Açıklama (Kart üzerinde görünür)" 
                value={appForm.appdescription} 
                onChange={e => setAppForm({...appForm, appdescription: e.target.value})} 
                style={{...inputStyle, flex: 2, minWidth: '220px'}} 
              />
            </div>

            {/* Row 3: Icon Selector & Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border-cyan)' }}>
                {isFormHomelab ? (
                  <div style={{ width: '32px', height: '32px' }}>
                    <RenderHomelabIcon iconKey={formHomelabKey} />
                  </div>
                ) : appForm.icon ? (
                  <img 
                    src={appForm.icon.startsWith('http') ? appForm.icon : `${backendUrl}${appForm.icon.startsWith('/') ? '' : '/'}${appForm.icon}`} 
                    alt="icon" 
                    style={{ width: '32px', height: '32px', borderRadius: '5px', objectFit: 'contain' }} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: '32px', height: '32px', background: 'var(--border-cyan)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>İKON</div>
                )}
                
                <button 
                  type="button"
                  onClick={() => setShowIconPicker(true)} 
                  style={{...btnStyle, padding: '5px 12px', fontSize: '12px', background: 'rgba(0,229,200,0.1)'}} 
                  title="Dahili SVG kütüphanesinden seç"
                >
                  ⚡ DAHİLİ İKON SEÇ
                </button>

                <button 
                  type="button"
                  onClick={handleFetchIcon} 
                  disabled={fetchingIcon} 
                  style={{...btnStyle, padding: '5px 10px', fontSize: '12px'}} 
                  title="URL'den otomatik logoyu bul ve indir"
                >
                  {fetchingIcon ? '⏳ BULUNUYOR...' : '🔍 LOGO BUL'}
                </button>
                
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()} 
                  style={{...btnStyle, padding: '5px 10px', fontSize: '12px', borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}} 
                  title="Bilgisayardan dosya seç"
                >
                  📁 DOSYA YÜKLE
                </button>
              </div>

              {appForm.icon && (
                <button 
                  type="button"
                  onClick={() => setAppForm({...appForm, icon: ''})} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--neon-red)', fontSize: '11px', cursor: 'pointer' }}
                >
                  İkonu Sıfırla ✕
                </button>
              )}
            </div>

            {/* Row 4: Detailed Operational Notes */}
            <div>
              <textarea 
                placeholder="Servis Notları & Komutlar (Info Drawer çekmecesinde görünür. Örn: Giriş bilgileri, SSH komutları, konfigürasyon ipuçları...)"
                value={appForm.notes}
                onChange={e => setAppForm({...appForm, notes: e.target.value})}
                rows={3}
                style={{
                  ...inputStyle,
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: '1.5'
                }}
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {appEditId && (
                <button 
                  type="button"
                  onClick={() => { 
                    setAppEditId(null); 
                    setAppForm({ title: '', url: '', colour: '#161b1f', appdescription: '', category: '', icon: '', ip: '', port: '', notes: '' }); 
                  }} 
                  style={{...btnStyle, color: 'var(--text-muted)', borderColor: 'var(--text-muted)'}}
                >
                  İPTAL
                </button>
              )}
              <button onClick={handleAppSubmit} style={btnStyle} className="hover-pulse">
                {appEditId ? '💾 DEĞİŞİKLİKLERİ GÜNCELLE' : '➕ YENİ UYGULAMA EKLE'}
              </button>
            </div>

          </div>

          {/* Links List */}
          <div style={{ display: 'grid', gap: '10px' }}>
            {links.map(link => {
              const isHomelab = link.icon && link.icon.startsWith('homelab:');
              const homelabKey = isHomelab ? link.icon.replace('homelab:', '') : null;
              const autoKey = (!link.icon || link.icon.trim() === '') ? matchHomelabIcon(`${link.title} ${link.url}`) : null;

              return (
                <div key={link.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderLeft: `5px solid ${link.colour !== '#161b1f' ? link.colour : 'var(--neon-cyan)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                      {isHomelab ? (
                        <RenderHomelabIcon iconKey={homelabKey} />
                      ) : link.icon ? (
                        <img 
                          src={link.icon.startsWith('http') ? link.icon : `${backendUrl}${link.icon.startsWith('/') ? '' : '/'}${link.icon}`} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : autoKey ? (
                        <RenderHomelabIcon iconKey={autoKey} />
                      ) : (
                        <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                          {(link.title || 'U').substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-light)', fontSize: '18px' }}>
                        {link.title} 
                        {link.category && <span style={{ marginLeft: '10px', fontSize: '10px', background: 'rgba(0,229,200,0.2)', color: 'var(--neon-cyan)', padding: '3px 8px', borderRadius: '12px' }}>{link.category}</span>}
                        {link.ip && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--neon-green)', background: 'rgba(0,255,102,0.1)', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>IP: {link.ip}</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--neon-green)', marginTop: '4px' }}>{link.url}</div>
                      {link.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontStyle: 'italic' }}>📝 Not mevcut</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleAppEdit(link)} style={{...btnStyle, borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)'}}>✏️ DÜZENLE</button>
                      <button onClick={() => handleAppDelete(link.id)} style={{...btnStyle, borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}}>🗑️ SİL</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'tags' && (
        <div>
          <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input placeholder="Kategori Adı (Örn: ☁️ Bulut Servisleri)" value={tagForm.title} onChange={e => setTagForm({...tagForm, title: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '220px'}} />
            <input type="color" value={tagForm.colour} onChange={e => setTagForm({...tagForm, colour: e.target.value})} style={{...inputStyle, padding: '0', width: '50px', height: '40px', cursor: 'pointer'}} title="Kategori Rengi" />
            <button onClick={handleTagSubmit} style={btnStyle} className="hover-pulse">{tagEditId ? '💾 GÜNCELLE' : '➕ EKLE'}</button>
            {tagEditId && <button onClick={() => { setTagEditId(null); setTagForm({ title: '', colour: '#161b22' }); }} style={{...btnStyle, color: 'var(--text-muted)'}}>İPTAL</button>}
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {tags.map(tag => (
              <div key={tag.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderLeft: `5px solid ${tag.colour !== '#161b22' ? tag.colour : 'var(--neon-cyan)'}` }}>
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

      {activeTab === 'users' && isAdmin && (
        <div>
          <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input placeholder="Kullanıcı Adı" value={newUserForm.username} onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '150px'}} />
                <input placeholder={userEditOldUsername ? "Yeni Şifre (Değişmeyecekse boş)" : "Şifre Belirleyin"} value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} style={{...inputStyle, flex: 1, minWidth: '150px'}} />
                <select value={newUserForm.role || 'user'} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})} style={{...inputStyle, flex: 1, cursor: 'pointer', minWidth: '180px'}}>
                  <option value="user">Standart Kullanıcı</option>
                  <option value="admin">Sistem Yöneticisi (Admin)</option>
                </select>
                <button onClick={handleUserSubmit} style={btnStyle} className="hover-pulse">
                {userEditOldUsername ? '💾 GÜNCELLE' : '➕ KULLANICI OLUŞTUR'}
                </button>
                {userEditOldUsername && <button onClick={() => { setUserEditOldUsername(null); setNewUserForm({ username: '', password: '', role: 'user' }); }} style={{...btnStyle, color: 'var(--text-muted)'}}>İPTAL</button>}
            </div>
            {lastShared && (
                <div style={{ padding: '10px', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <strong style={{ color: '#25D366' }}>Hesap Hazır:</strong>
                        <span style={{ marginLeft: '10px', color: 'var(--text-light)' }}>{lastShared.username} / {lastShared.password}</span>
                    </div>
                    <button onClick={() => sendWhatsApp(lastShared.username, lastShared.password)} style={{...btnStyle, borderColor: '#25D366', color: '#25D366'}}>
                        💬 BİLGİLERİ WHATSAPP İLE GÖNDER
                    </button>
                </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {usersList.map((u, i) => (
              <div key={i} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderLeft: `5px solid ${u.role === 'admin' ? 'var(--neon-red)' : 'var(--neon-cyan)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-light)', fontSize: '18px' }}>👤 {u.username}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px' }}>
                      Rol: {u.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => sendWhatsApp(u.username, '(Güvenlik gereği gizlenmiştir)')} style={{...btnStyle, borderColor: '#25D366', color: '#25D366', padding: '5px 10px', fontSize: '12px'}}>💬 WHATSAPP</button>
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

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => setHeatmapFilter('all')} style={{ ...btnStyle, background: heatmapFilter === 'all' ? 'rgba(0,229,200,0.2)' : 'transparent' }}>TÜM ZAMANLAR</button>
            <button onClick={() => setHeatmapFilter('today')} style={{ ...btnStyle, background: heatmapFilter === 'today' ? 'rgba(0,229,200,0.2)' : 'transparent' }}>BUGÜN</button>
            <button onClick={() => setHeatmapFilter('week')} style={{ ...btnStyle, background: heatmapFilter === 'week' ? 'rgba(0,229,200,0.2)' : 'transparent' }}>BU HAFTA</button>
            <button onClick={() => setHeatmapFilter('month')} style={{ ...btnStyle, background: heatmapFilter === 'month' ? 'rgba(0,229,200,0.2)' : 'transparent' }}>BU AY</button>
            <button onClick={() => setHeatmapFilter('custom')} style={{ ...btnStyle, background: heatmapFilter === 'custom' ? 'rgba(0,229,200,0.2)' : 'transparent' }}>ÖZEL TARİH</button>
          </div>
          
          {heatmapFilter === 'custom' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="date" value={customDateRange.start} onChange={e => setCustomDateRange({...customDateRange, start: e.target.value})} style={inputStyle} />
              <input type="date" value={customDateRange.end} onChange={e => setCustomDateRange({...customDateRange, end: e.target.value})} style={inputStyle} />
            </div>
          )}

          <div style={{ display: 'grid', gap: '10px' }}>
            {(() => {
              let filteredClicks = {};
              if (heatmap.history) {
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                
                const getStartOfWeek = () => {
                  const d = new Date();
                  const day = d.getDay() || 7; 
                  d.setDate(d.getDate() - day + 1);
                  return d.toISOString().split('T')[0];
                };
                
                const getStartOfMonth = () => {
                  return todayStr.substring(0, 8) + '01';
                };

                for (const [appId, dates] of Object.entries(heatmap.history)) {
                  let sum = 0;
                  for (const [date, count] of Object.entries(dates)) {
                    let include = false;
                    if (heatmapFilter === 'all') include = true;
                    else if (heatmapFilter === 'today' && date === todayStr) include = true;
                    else if (heatmapFilter === 'week' && date >= getStartOfWeek() && date <= todayStr) include = true;
                    else if (heatmapFilter === 'month' && date >= getStartOfMonth() && date <= todayStr) include = true;
                    else if (heatmapFilter === 'custom' && customDateRange.start && customDateRange.end && date >= customDateRange.start && date <= customDateRange.end) include = true;
                    
                    if (include) sum += count;
                  }
                  if (sum > 0) filteredClicks[appId] = sum;
                }
              }

              if (Object.keys(filteredClicks).length === 0) {
                return <p style={{ color: 'var(--text-muted)' }}>Bu tarih aralığında veri bulunamadı.</p>;
              }

              return Object.entries(filteredClicks).sort((a,b) => b[1] - a[1]).map(([linkId, count]) => {
                const link = links.find(l => l.id === linkId);
                const title = link ? link.title : 'Silinmiş Servis';
                const total = Object.values(filteredClicks).reduce((acc, c) => acc + c, 0);
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
              });
            })()}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ color: 'var(--text-light)', borderBottom: '1px solid rgba(0,229,200,0.3)', paddingBottom: '10px', marginBottom: '20px' }}>
            💾 Yedekleme ve Geri Yükleme
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Sistemdeki tüm kısayollarınızı, kategorilerinizi ve tercihlerinizi tek bir JSON dosyası olarak indirebilir veya geri yükleyebilirsiniz.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
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
                    showToast('Yedek başarıyla indirildi.', 'success');
                  }).catch(e => showToast("Yedekleme başarısız: " + e.message, 'error'));
              }} 
              style={{...btnStyle, padding: '12px 24px', fontSize: '15px', background: 'rgba(0,229,200,0.1)'}}
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
                    if (window.confirm('Mevcut ayarlar ve linkler silinip bu yedek yüklenecektir. Onaylıyor musunuz?')) {
                      const token = localStorage.getItem('golgeToken');
                      fetch(`${apiUrl}/import`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(data)
                      }).then(r => r.json()).then(res => {
                        if (res.success) {
                          showToast("Yedek yüklendi! Yenileniyor...", 'success');
                          setTimeout(() => window.location.reload(), 1000);
                        } else {
                          showToast("Yükleme başarısız.", 'error');
                        }
                      });
                    }
                  } catch (e) {
                    showToast("Geçersiz JSON dosyası!", 'error');
                  }
                };
                reader.readAsText(file);
              }}
            />
            <button 
              onClick={() => document.getElementById('importInput').click()} 
              style={{...btnStyle, padding: '12px 24px', fontSize: '15px', borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}}
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
