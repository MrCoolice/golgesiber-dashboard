import React from 'react';

// High-quality, clean SVG icons for top homelab and infrastructure services
export const HOMELAB_ICONS = {
  proxmox: {
    name: 'Proxmox VE',
    keywords: ['proxmox', 'pve', 'qemu', 'lxc'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#e57000' }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(229, 112, 0, 0.2)" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  },
  opnsense: {
    name: 'OPNsense',
    keywords: ['opnsense', 'firewall', 'router', 'gateway'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#d94f00' }}>
        <circle cx="12" cy="12" r="10" stroke="#d94f00" fill="rgba(217, 79, 0, 0.15)" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" />
        <circle cx="12" cy="12" r="4" fill="#d94f00" />
      </svg>
    )
  },
  pfsense: {
    name: 'pfSense',
    keywords: ['pfsense', 'netgate'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#2078bb' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(32, 120, 187, 0.2)" stroke="#2078bb" />
        <path d="M9 12l2 2 4-4" stroke="#00ff66" strokeWidth="2" />
      </svg>
    )
  },
  docker: {
    name: 'Docker',
    keywords: ['docker', 'container', 'compose'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#0db7ed' }}>
        <path d="M4 14h16c0 4-4 6-8 6s-8-2-8-6z" fill="rgba(13, 183, 237, 0.2)" />
        <rect x="3" y="10" width="3" height="3" fill="#0db7ed" />
        <rect x="7" y="10" width="3" height="3" fill="#0db7ed" />
        <rect x="11" y="10" width="3" height="3" fill="#0db7ed" />
        <rect x="7" y="6" width="3" height="3" fill="#0db7ed" />
        <rect x="11" y="6" width="3" height="3" fill="#0db7ed" />
      </svg>
    )
  },
  portainer: {
    name: 'Portainer',
    keywords: ['portainer'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#13bef9' }}>
        <rect x="2" y="3" width="9" height="18" rx="2" fill="rgba(19, 190, 249, 0.2)" stroke="#13bef9" />
        <rect x="13" y="3" width="9" height="9" rx="2" fill="rgba(19, 190, 249, 0.4)" stroke="#13bef9" />
        <rect x="13" y="14" width="9" height="7" rx="2" stroke="#13bef9" />
      </svg>
    )
  },
  nextcloud: {
    name: 'Nextcloud',
    keywords: ['nextcloud', 'cloud', 'drive', 'owncloud'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#0082c9' }}>
        <circle cx="12" cy="12" r="5" fill="rgba(0, 130, 201, 0.3)" stroke="#0082c9" strokeWidth="2" />
        <circle cx="5" cy="12" r="3" fill="#0082c9" />
        <circle cx="19" cy="12" r="3" fill="#0082c9" />
      </svg>
    )
  },
  truenas: {
    name: 'TrueNAS',
    keywords: ['truenas', 'freenas', 'nas', 'zfs', 'storage'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#00a3e0' }}>
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="rgba(0, 163, 224, 0.2)" stroke="#00a3e0" />
        <line x1="12" y1="2" x2="12" y2="22" stroke="#00a3e0" />
        <line x1="3" y1="12" x2="21" y2="12" stroke="#00a3e0" />
      </svg>
    )
  },
  pihole: {
    name: 'Pi-hole',
    keywords: ['pihole', 'pi-hole', 'dns', 'adblock'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#cc2127' }}>
        <circle cx="12" cy="12" r="9" stroke="#cc2127" fill="rgba(204, 33, 39, 0.2)" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#cc2127" strokeWidth="2.5" />
      </svg>
    )
  },
  adguard: {
    name: 'AdGuard Home',
    keywords: ['adguard', 'agh', 'dns'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#66b22e' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(102, 178, 46, 0.2)" stroke="#66b22e" />
        <path d="M9 12l2 2 4-4" stroke="#66b22e" strokeWidth="2.5" />
      </svg>
    )
  },
  homeassistant: {
    name: 'Home Assistant',
    keywords: ['homeassistant', 'home-assistant', 'hass', 'iot', 'smart'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#03a9f4' }}>
        <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" fill="rgba(3, 169, 244, 0.2)" stroke="#03a9f4" />
        <circle cx="12" cy="13" r="3" fill="#03a9f4" />
      </svg>
    )
  },
  grafana: {
    name: 'Grafana',
    keywords: ['grafana', 'metrics', 'monitoring', 'dashboard'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#f46800' }}>
        <circle cx="12" cy="12" r="9" stroke="#f46800" fill="rgba(244, 104, 0, 0.2)" />
        <path d="M8 14s2-3 4-3 4 3 4 3" stroke="#f46800" strokeWidth="2" />
        <circle cx="12" cy="9" r="2" fill="#f46800" />
      </svg>
    )
  },
  uptime_kuma: {
    name: 'Uptime Kuma',
    keywords: ['kuma', 'uptime', 'status'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#5cd85a' }}>
        <circle cx="12" cy="12" r="9" stroke="#5cd85a" fill="rgba(92, 216, 90, 0.2)" />
        <path d="M12 6v6l4 2" stroke="#5cd85a" strokeWidth="2" />
      </svg>
    )
  },
  wireguard: {
    name: 'WireGuard',
    keywords: ['wireguard', 'vpn', 'tunnel'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#88171a' }}>
        <circle cx="12" cy="12" r="9" stroke="#ff3b30" fill="rgba(255, 59, 48, 0.2)" />
        <path d="M12 7v10M8 12h8" stroke="#ff3b30" strokeWidth="2.5" />
      </svg>
    )
  },
  tailscale: {
    name: 'Tailscale',
    keywords: ['tailscale', 'mesh', 'vpn'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#4b5563' }}>
        <circle cx="6" cy="6" r="3" fill="#00e5c8" />
        <circle cx="18" cy="6" r="3" fill="#00e5c8" />
        <circle cx="12" cy="12" r="3" fill="#00e5c8" />
        <circle cx="6" cy="18" r="3" fill="#00e5c8" />
        <circle cx="18" cy="18" r="3" fill="#00e5c8" />
      </svg>
    )
  },
  vaultwarden: {
    name: 'Vaultwarden / Bitwarden',
    keywords: ['vaultwarden', 'bitwarden', 'passwords', 'vault'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#175ddc' }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="rgba(23, 93, 220, 0.2)" stroke="#175ddc" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#175ddc" strokeWidth="2" />
      </svg>
    )
  },
  nginx: {
    name: 'Nginx / NPM',
    keywords: ['nginx', 'proxy', 'npm', 'webserver'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#009639' }}>
        <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2" fill="rgba(0, 150, 57, 0.2)" stroke="#009639" />
        <path d="M8 7v10l8-10v10" stroke="#009639" strokeWidth="2" />
      </svg>
    )
  },
  terminal: {
    name: 'SSH / Terminal',
    keywords: ['ssh', 'terminal', 'shell', 'bash', 'console', 'cli'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#00ff66' }}>
        <rect x="2" y="3" width="20" height="18" rx="3" fill="rgba(0, 255, 102, 0.15)" stroke="#00ff66" />
        <polyline points="6 9 10 12 6 15" stroke="#00ff66" strokeWidth="2" />
        <line x1="12" y1="15" x2="18" y2="15" stroke="#00ff66" strokeWidth="2" />
      </svg>
    )
  },
  jellyfin: {
    name: 'Jellyfin / Media',
    keywords: ['jellyfin', 'plex', 'media', 'stream', 'video'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#aa5cc3' }}>
        <circle cx="12" cy="12" r="9" fill="rgba(170, 92, 195, 0.2)" stroke="#aa5cc3" />
        <polygon points="10 8 16 12 10 16 10 8" fill="#aa5cc3" />
      </svg>
    )
  },
  database: {
    name: 'Database',
    keywords: ['database', 'db', 'mysql', 'postgres', 'mariadb', 'redis', 'mongo'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#336791' }}>
        <ellipse cx="12" cy="5" rx="9" ry="3" fill="rgba(51, 103, 145, 0.2)" stroke="#336791" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="#336791" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="#336791" />
      </svg>
    )
  },
  cloudflare: {
    name: 'Cloudflare',
    keywords: ['cloudflare', 'warp', 'tunnel', 'argo', 'dns'],
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: '#f38020' }}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="rgba(243, 128, 32, 0.2)" stroke="#f38020" />
      </svg>
    )
  }
};

// Automatic matching helper: Checks title and URL to find the best match
export const matchHomelabIcon = (text = '') => {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  for (const [key, iconObj] of Object.entries(HOMELAB_ICONS)) {
    if (iconObj.keywords.some(k => lower.includes(k))) {
      return key;
    }
  }
  return null;
};

// Render helper component
export const RenderHomelabIcon = ({ iconKey, style = {} }) => {
  const icon = HOMELAB_ICONS[iconKey];
  if (!icon) return null;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', ...style }}>
      {icon.svg}
    </div>
  );
};
