# Kurulum ve Güncelleme Rehberi

Gölge Dashboard, yerel ağda (Local LAN) Proxmox LXC (Linux Container - Ubuntu 24.04 LTS) üzerinde çalışacak şekilde optimize edilmiştir. Sistem, React (Vite) ile derlenmiş statik dosyaları Nginx üzerinden sunarken, arka plandaki Node.js API servisini (Port 3001) Nginx Reverse Proxy ile tek bir port (Port 80) altında birleştirir.

---

## 1. Sistem Mimarisi ve Port Dağılımı

- **Sunucu IP:** `10.10.10.101` (Varsayılan Yerel Ağ IP'si)
- **Frontend & API Girişi (Nginx):** `http://10.10.10.101:80`
- **Backend API (Node.js/Express):** `127.0.0.1:3001` (Sadece yerel hosttan dinler, dışarıya Nginx `/api/` rotasıyla aktarılır)
- **Proje Dizin Yolu:** `/root/golgesiber-dashboard`

---

## 2. Nginx Reverse Proxy Yapılandırması

Nginx, hem derlenmiş frontend dosyalarını sunar hem de `/api/` isteklerini arkada çalışan Node.js API'sine iletir. Böylece tarayıcıda CORS sorunu yaşanmaz ve dışarıdan 3001 portunu açmaya gerek kalmaz.

`/etc/nginx/sites-available/default` (veya `/etc/nginx/sites-available/golge-dashboard`) dosyasını şu şekilde yapılandırın:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/html;
    index index.html;

    # Yerel Ağ İzinleri (Local LAN Koruması)
    allow 10.10.10.0/24;
    allow 192.168.0.0/16;
    allow 127.0.0.1;
    deny all;

    # Frontend (React SPA Yönlendirmesi)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy (Port 3001'i /api altına bağlar)
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ayarları kontrol edip Nginx'i yeniden başlatın:
```bash
nginx -t && systemctl restart nginx
```

---

## 3. Canlıda Güncelleme Alma (Yeni Kodları Çekme ve Dağıtma)

LXC içinde (`root@golgesiber-dashboard`) projeyi en güncel sürüme getirmek ve derlemek için aşağıdaki komut zincirini çalıştırın:

```bash
cd /root/golgesiber-dashboard

# Varsa kilitli yerel değişiklikleri temizle ve en son kodu al
git checkout package-lock.json
git pull origin main

# Frontend bağımlılıklarını kur ve derle
npm install
npm run build

# Derlenen frontend dosyalarını Nginx dizinine aktar
cp -r /root/golgesiber-dashboard/dist/* /var/www/html/

# Backend bağımlılıklarını güncelle ve servisi yeniden başlat
cd /root/golgesiber-dashboard/server
npm install
pm2 restart golge-admin || pm2 start server.js --name "golge-admin"

# Nginx servisini tazele
systemctl restart nginx
```

---

## 4. Servis Durumu Kontrolü

Yapılan işlemlerin ardından servislerin sağlıklı çalıştığını doğrulamak için:

```bash
# PM2 backend durumunu izleme
pm2 status

# Backend loglarını canlı izleme
pm2 logs golge-admin --lines 50

# Nginx durumunu kontrol etme
systemctl status nginx
```
