import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Intercept all API requests to attach token automatically
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (typeof resource === 'string' && (resource.includes('/api/') || resource.includes(':3001'))) {
    const token = localStorage.getItem('golgeToken');
    if (token) {
      config = config || {};
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
