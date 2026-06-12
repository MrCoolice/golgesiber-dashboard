import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Terminal, Hexagon, Settings, LogOut } from 'lucide-react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import SpotlightSearch from './components/SpotlightSearch';
import DynamicBackground from './components/DynamicBackground';
import HackerQuotes from './components/HackerQuotes';
import './index.css';
import './index.css';

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Terminal size={24} />, label: 'Sunucular' }
  ];

  return (
    <div className="sidebar" style={{
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
      <div className="sidebar-logo" style={{ color: 'var(--neon-cyan)', marginBottom: '40px' }}>
        <Hexagon size={32} />
      </div>
      
      <div className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
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

      <div className="sidebar-bottom" style={{ marginTop: 'auto', marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
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
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [preferences, setPreferences] = useState({ theme: 'dark', dynamicBackground: true, hackerQuotes: true });
  
  function handleLogout() {
    localStorage.removeItem('golgeToken');
    localStorage.removeItem('golgeUser');
    setAuth(null);
  }

  useEffect(() => {
    const token = localStorage.getItem('golgeToken');
    const userStr = localStorage.getItem('golgeUser');
    if (token && userStr) {
      try { 
        setAuth({ token, user: JSON.parse(userStr) }); 
        const backendUrl = `http://${window.location.hostname}:3001`;
        
        // Fetch preferences and links for global components
        fetch(`${backendUrl}/api/preferences`, { headers: { 'Authorization': `Bearer ${token}` }})
          .then(res => {
            if (!res.ok) throw new Error('Token geçersiz');
            return res.json();
          })
          .then(data => {
            if (data && !data.error) setPreferences(prev => ({ ...prev, ...data }));
          }).catch(() => { handleLogout(); });
          
        fetch(`${backendUrl}/api/links`, { headers: { 'Authorization': `Bearer ${token}` }})
          .then(res => {
            if (!res.ok) throw new Error('Token geçersiz');
            return res.json();
          })
          .then(data => {
            if (Array.isArray(data)) setLinks(data);
          }).catch(() => { handleLogout(); });
          
      } catch (e) {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // CTRL+K or CMD+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!auth) {
    return <Login onLogin={(data) => setAuth({ token: data.token, user: { username: data.username, role: data.role } })} />;
  }

  return (
    <Router>
      <DynamicBackground preferences={preferences} />
      <HackerQuotes preferences={preferences} />
      <SpotlightSearch 
        isOpen={isSpotlightOpen} 
        onClose={() => setIsSpotlightOpen(false)} 
        links={links} 
        theme={preferences.theme} 
      />
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Sidebar handleLogout={handleLogout} />
        <div className="main-content" style={{ marginLeft: '80px', flex: 1, padding: '20px' }}>
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
