import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('golgeToken', data.token);
        localStorage.setItem('golgeUser', JSON.stringify({ username: data.username, role: data.role }));
        onLogin(data);
      } else {
        setError(data.error || 'Giriş başarısız');
      }
    } catch (err) {
      setError('Sunucu bağlantı hatası');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#fff' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--neon-cyan)" style={{ margin: '0 auto 20px auto', filter: 'drop-shadow(0 0 10px var(--neon-cyan))' }} />
        <h2 style={{ color: 'var(--neon-cyan)', margin: '0 0 5px 0', letterSpacing: '2px' }}>GÖLGESİBER</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '30px', letterSpacing: '5px' }}>YATIRIM PORTALI</div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Kullanıcı Adı" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-cyan)', color: '#fff', borderRadius: '4px', outline: 'none' }}
            required
          />
          <input 
            type="password" 
            placeholder="Şifre" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-cyan)', color: '#fff', borderRadius: '4px', outline: 'none' }}
            required
          />
          {error && <div style={{ color: 'var(--neon-red)', fontSize: '12px' }}>{error}</div>}
          <button type="submit" style={{ padding: '12px', background: 'var(--neon-cyan)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            SİSTEME GİRİŞ YAP
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
