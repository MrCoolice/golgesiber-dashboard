# Gölge Siber Dashboard 🚞

**Gölge Dashboard**, yerel ağ altyapınızı, kişisel bağlantılarınızı ve finansal verilerinizi tek bir merkezden güvenli bir şekilde yönetmenizi sağlayan, tamamen özelleştirilmiş ve modern bir yönetim platformudur.

---

## Temel Özellikler

- **Sistem Merkezi (Home):** Sık kullanılan yerel ve harici web uygulamalarına (Hızlı Linkler) kategorize edilmiş erişim. Hava durumu, RSS haber beslemeleri, sistem saati ve dinamik arama motoru widget'ları.
- **Finans Kokpiti:** Kripto piyasaları için "Korku ve Açgözlülük Endeksi (Fear & Greed)", Long/Short oranları, Döviz/Kripto dönüştürücü ve borsa anomali uyarı modülleri.
- **Gelişmiş Ağ Yönetimi:** Proxmox ve OPNsense altyapınız için detaylı VLAN ve cihaz takibi. Otomatik IP/Subnet doğrulaması, port yönetimi, servis notları ve **Otomatik Topoloji Haritası (React Flow)**.
- **Admin Paneli:** Sadece yetkili yöneticilerin erişebildiği link tanımlama, ağ cihazı yapılandırma, kullanıcı yetkilendirme ve WhatsApp üzerinden hızlı hesap bildirim araçları.

---

## Kullanılan Teknolojiler

- **Frontend:** React, Vite, Vanilla CSS (Cam efekti / Glassmorphism arayüz).
- **Backend:** Node.js, Express.js.
- **Web Sunucu & Reverse Proxy:** Nginx (Port 80 üzerinden statik dosyalar ve `/api/` proxy).
- **Veritabanı:** Güvenli, taşınabilir ve izole JSON tabanlı veri mimarisi (`server/data/` dizini).
- **Grafik ve Ağ Haritaları:** Ağ topolojisi için `@xyflow/react` kütüphanesi.
- **Süreç Yöneticisi:** PM2.

---

## Dokümantasyon Rehberleri

Projeyi yönetmek, güncellemek veya detaylarını incelemek için aşağıdaki kılavuzları inceleyebilirsiniz:

1. [Kurulum ve Güncelleme Rehberi](./docs/Kurulum_ve_Guncelleme.md)
2. [Sistem ve Güvenlik Mimarisi](./docs/Mimari_ve_Guvenlik.md)
3. [Kullanım Kılavuzu - Admin](./docs/Kullanim_Kilavuzu_Admin.md)
4. [Kullanım Kılavuzu - Kullanıcı](./docs/Kullanim_Kilavuzu_Kullanici.md)

---

*Bu dokümantasyon, yerel Proxmox LXC ortamınızla tam uyumlu olacak şekilde güncellenmiştir.*
