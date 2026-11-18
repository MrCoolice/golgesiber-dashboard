# Yönetici (Admin) Kullanım Kılavuzu

Gölge Dashboard Admin Paneline, ana sayfanın **sağ üst köşesindeki "Sistem Girişi" veya dişli çark ikonuna** tıklayıp yönetici hesabınızla giriş yaparak ulaşabilirsiniz. Sadece `admin` rolüne sahip kullanıcılar bu yönetim modüllerini görebilir ve düzenleme yapabilir.

---

## 1. Uygulama (Hızlı Link) Yönetimi

Ana sayfadaki (Sistem Merkezi) hızlı link kategorilerini ve web servislerini bu ekrandan yönetebilirsiniz:

- **Yeni Uygulama Ekleme:** Başlık, hedef URL, Kategori ve renk paleti seçin.
- **Otomatik İkon Çekme:** Hedef web adresinin ikonunu otomatik yakalamak için **"🌍 İKON ÇEK"** butonunu kullanabilirsiniz.
- **Özel Logo Yükleme:** Kendi özel logonuzu veya SVG/PNG dosyanızı **"📥 YÜKLE"** butonuyla sisteme aktarabilirsiniz.

---

## 2. Ağ Yönetimi (VLAN ve Cihaz Takibi)

Gölge Dashboard'un Proxmox ve OPNsense altyapınızla entegre çalışan en güçlü modülüdür.

### A) Yeni VLAN / Ağ Tanımlama
Sisteme cihaz eklemeden önce ilgili ağ katmanının (VLAN) tanımlanmış olması gerekir:

1. **"🌐 Yeni VLAN Ekle"** butonuna tıklayın.
2. **VLAN Adı:** Örn: `Yönetim Ağı`, `DMZ`, `IoT Cihazları`.
3. **Subnet:** Alt ağ maskesi formatında girin. Örn: `10.10.10.0/24` veya `192.168.1.0/24`.
4. VLAN ID, Ağ Geçidi (Gateway) ve IP Dağıtım Aralığını belirleyip **KAYDET** butonuna basın.

### B) Yeni Cihaz (LXC / VM / Donanım) Ekleme
1. **"🖥️ Yeni Cihaz Ekle"** butonuna tıklayın.
2. **VLAN Seçimi:** Cihazın bağlı olduğu ağı açılır listeden seçin.
3. **IP Adresi:** Cihazın statik veya DHCP IP adresini girin. *(Sistem, girilen IP adresinin seçilen VLAN subnet'ine uygunluğunu otomatik denetler; hatalı blok girişlerini engeller).*
4. **Portlar & İşletim Sistemi:** Açık olan servis portlarını (`80, 443, 22, 8006` vb.) ve işletim sistemini (`Ubuntu 24.04`, `Debian`, `Alpine`) yazın.
5. **Cihaz Notları:** Cihaza ait servis amaçlarını, kullanım yönergelerini ve teknik açıklamaları bu alana ekleyin.

---

## 3. Kullanıcı Yönetimi ve Yetkilendirme

Dashboard'a erişecek kullanıcı hesapları bu bölümden açılır ve yetkilendirilir:

- **Kullanıcı Tanımlama:** Yeni kullanıcı adı ve güvenli bir şifre belirleyin. Rol olarak `admin` veya `user` seçin.
- **Hızlı Bilgi Paylaşımı (WhatsApp):** Kullanıcı oluşturulduğunda beliren **"💬 BİLGİLERİ WHATSAPP İLE GÖNDER"** butonuna tıklayarak, yerel ağ erişim bilgilerini WhatsApp Web aracılığıyla ilgili ekip üyesine hızlıca aktarabilirsiniz.

---

## 4. Widget Market ve Sistem Ayarları

Tüm kullanıcıların ekranını etkileyen global yapılandırmalar bu menüden yönetilir:
- **Hava Durumu:** Varsayılan şehir ve bölge ayarları.
- **RSS Haber Kaynakları:** Canlı bilgi akışı sağlayan siber güvenlik, teknoloji ve haber RSS kaynaklarının eklenmesi/çıkarılması.
- Bu ayarlar kaydedildiği anda tüm kullanıcılar için otomatik olarak güncellenir.
