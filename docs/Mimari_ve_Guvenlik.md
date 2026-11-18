# Mimari ve Güvenlik Ayarları

Gölge Dashboard, yerel ağınızda (Local LAN) yüksek hız, düşük kaynak tüketimi ve tam izolasyon sağlamak üzere tasarlanmış modern bir web mimarisine sahiptir. Sistem, birbirinden bağımsız çalışan iki ana bileşen ve bunları tek portta birleştiren bir Nginx katmanından oluşur.

---

## 1. Mimari Yapı

### A) Frontend (Kullanıcı Arayüzü)
- **Teknoloji:** React.js, Vite ve Vanilla CSS (Cam efekti / Glassmorphism arayüz).
- **Konum:** Kodlar `src/` klasöründe yer alır. `npm run build` komutu ile statik HTML, JS ve CSS varlıklarına dönüştürülüp `dist/` klasörüne derlenir.
- **Sunucu Dağıtımı:** Derlenen statik dosyalar `/var/www/html/` dizinine kopyalanır ve **Nginx** üzerinden Port 80 ile hızlıca sunulur.

### B) Backend (API Servisi)
- **Teknoloji:** Node.js ve Express.js.
- **Konum:** Kodlar `server/server.js` dosyasındadır. Arka planda yalnızca `127.0.0.1:3001` adresini dinler (Dışarıya doğrudan açılmaz).
- **Süreç Yönetimi:** Node.js servisi arka planda `PM2` ile çalıştırılır (`golge-admin`). Çökme durumunda otomatik olarak ayağa kalkar.
- **Veri Saklama Mantığı:** Sistem harici ve ağır bir SQL veritabanı gerektirmez. Bütün veriler (Kullanıcılar, Ağ Cihazları, Linkler, Sistem Ayarları) `server/data/` klasöründeki izole JSON dosyalarında saklanır. Bu yapı, LXC konteynerleri arasında yedekleme ve taşımayı son derece pratik hale getirir.

### C) Nginx Reverse Proxy (Birleştirici Katman)
- Frontend ve Backend API aynı kök altında birleştirilir.
- Kullanıcı tarayıcısı tüm istekleri tek IP ve tek port üzerinden (`http://10.10.10.101/`) yapar.
- Normal web trafiği React SPA'ya, `/api/` ile başlayan istekler ise arka plandaki Node.js servisine aktarılır.
- Bu yapı sayesinde tarayıcı tarafında CORS (Cross-Origin Resource Sharing) bloklamaları tamamen ortadan kalkar.

---

## 2. Güvenlik ve Erişim Kontrolü

### Yerel Ağ Sınırlandırması (Local Subnet İzolasyonu)
Dashboard şu aşamada yalnızca yerel ağ kullanımına açıktır. Dış dünyadan veya yetkisiz VLAN'lardan gelebilecek istekler Nginx seviyesinde engellenir.

`/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html;

    # Sadece tanımlı yerel alt ağlara ve VPN'e izin verilir:
    allow 10.10.10.0/24;  # Yönetim / Dashboard Ağı
    allow 192.168.0.0/16; # Yerel Ev / Ofis Ağları
    allow 127.0.0.1;      # Yerel loopback
    deny all;             # Diğer tüm istekleri engelle
}
```

### Kimlik Doğrulama (Authentication & JWT)
- **Token Tabanlı Erişim:** Kullanıcı oturumları endüstri standardı **JWT (JSON Web Token)** ile yönetilir.
- **Admin Rol Koruması:** Admin Paneli bileşenleri ve API uç noktaları sadece `role: 'admin'` değerine sahip geçerli token taşıyan isteklere yanıt verir. Yetkisiz istekler doğrudan `401 Unauthorized` veya `403 Forbidden` ile reddedilir.
- **Parola Güvenliği:** Kullanıcı şifreleri veritabanı dosyasına düz metin olarak kaydedilmez; `bcrypt` algoritması ile tek yönlü özetlenerek (hash) saklanır.

### Operasyonel Bilgi Güvenliği (Cihaz Notları Politikası)
- Ağ Yönetimi modülündeki "Cihaz Notları" alanı; sunucu IP'leri, açık portlar, servis açıklamaları ve operasyonel yönergeler için tasarlanmıştır.
- Kurumsal güvenlik standardı gereği, kritik ana root şifrelerinin bu notlara düz metin olarak yazılması yerine merkezi bir parola yöneticisinde (Vaultwarden/KeePass vb.) tutulması önerilir.

---

## 3. Veri Yedekleme ve Kurtarma (Backup)

Tüm konfigürasyon, kullanıcılar ve cihaz bilgileri `server/data/` dizini altındaki dosyalarda tutulduğundan, felaket kurtarma için yalnızca bu dizinin yedeğini almak yeterlidir:

```bash
# Hızlı Manuel Yedekleme:
tar -czvf /root/golge_data_backup_$(date +%F).tar.gz /root/golgesiber-dashboard/server/data/
```
