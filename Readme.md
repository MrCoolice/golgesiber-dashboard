# Gölge Siber Dashboard 🚞

**Gölge Dashboard**, yerel ağınızdaki tüm sunucu, servis ve uygulamalarınızı tek bir merkezden güvenli bir şekilde yönetmenizi sağlayan, modern ve cam efektli (Glassmorphism) yönetim platformudur.

---

## 🚀 Temel Özellikler

- **Sistem Merkezi (Home):** Sık kullanılan yerel ve harici web servislerine (Proxmox, OPNsense, Portainer, NAS vb.) kategorize edilmiş hızlı erişim. Sürükle-bırak ile kartları yeniden sıralama imkanı.
- **Hızlı Arama (Spotlight / CTRL+K):** Klavyeden `CTRL+K` ile anında açılan, tüm servisler ve linkler arasında akıllı arama paneli.
- **Kullanım Isı Haritası (Heatmap Analytics):** Günlük, haftalık ve aylık bazda en sık kullandığınız servislerin tıklama ve erişim istatistikleri.
- **Admin Paneli:** Kategori yönetimi, uygulama ekleme/düzenleme, otomatik logo/ikon çekme, yerel dosya yükleme, kullanıcı yetkilendirme ve tek tıkla WhatsApp erişim paylaşımı.
- **Yedekleme ve Geri Yükleme (Export / Import):** Tüm sistem kısayollarını, kategorilerini ve kullanıcı tercihlerini tek bir JSON dosyasıyla yedekleme ve geri yükleme.

---

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React, Vite, Framer Motion, @dnd-kit (Sürükle-Bırak), Vanilla CSS.
- **Backend:** Node.js, Express.js.
- **Web Sunucu & Proxy:** Nginx (Port 80 üzerinden statik dosyalar ve `/api/` proxy yönlendirmesi).
- **Veri Mimarisi:** Taşınabilir ve hafif JSON tabanlı veri saklama (`server/data/` dizini).
- **Süreç Yöneticisi:** PM2.

---

## 📚 Dokümantasyon Rehberleri

Projeyi yönetmek ve detaylarını incelemek için aşağıdaki kılavuzları inceleyebilirsiniz:

1. [Kurulum ve Güncelleme Rehberi](./docs/Kurulum_ve_Guncelleme.md)
2. [Sistem ve Güvenlik Mimarisi](./docs/Mimari_ve_Guvenlik.md)
3. [Kullanım Kılavuzu - Admin](./docs/Kullanim_Kilavuzu_Admin.md)
4. [Kullanım Kılavuzu - Kullanıcı](./docs/Kullanim_Kilavuzu_Kullanici.md)

---

*Bu proje yerel ağ (LAN) güvenliği ve Proxmox LXC ortamıyla tam uyumludur.*
