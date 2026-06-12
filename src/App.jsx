import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Terminal, Hexagon, Settings, LogOut } from 'lucide-react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import './index.css';

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Terminal size={24} />, label: 'Sunucular' }
  ];

  return (
    <div style={{
      width: '80px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'rgba(6, 13, 31, 0.9)',
      borderRight: '1px solid var(--border-cyan)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      zIndex: 1000
    }}>
      <div style={{ color: 'var(--neon-cyan)', marginBottom: '40px' }}>
        <Hexagon size={32} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{
              color: isActive ? 'var(--neon-green)' : 'var(--text-muted)',
              textDecoration: 'none',
              padding: '12px',
              borderRadius: '12px',
              background: isActive ? 'rgba(0, 255, 102, 0.1)' : 'transparent',
              border: isActive ? '1px solid var(--border-green)' : '1px solid transparent',
              transition: 'all 0.3s ease'
            }} title={item.label}>
              {item.icon}
            </Link>
          )
        })}
      </div>

      <div style={{ marginTop: 'auto', marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <Link to="/admin" style={{
            color: location.pathname === '/admin' ? 'var(--neon-green)' : 'var(--text-muted)',
            padding: '12px'
        }} title="Admin Panel">
          <Settings size={24} />
        </Link>
        <div style={{ cursor: 'pointer', padding: '12px', color: 'var(--neon-red)' }} title="Çıkış Yap" onClick={handleLogout}>
          <LogOut size={24} />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [auth, setAuth] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('golgeToken');
    const userStr = localStorage.getItem('golgeUser');
    if (token && userStr) {
      try { setAuth({ token, user: JSON.parse(userStr) }); } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('golgeToken');
    localStorage.removeItem('golgeUser');
    setAuth(null);
  };

  if (!auth) {
    return <Login onLogin={(data) => setAuth({ token: data.token, user: { username: data.username, role: data.role } })} />;
  }

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar handleLogout={handleLogout} />
        <div style={{ marginLeft: '80px', flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
