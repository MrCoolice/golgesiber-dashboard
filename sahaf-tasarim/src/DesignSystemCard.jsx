import React from 'react';

const DesignSystemCard = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 my-8 bg-linen border-4 border-ink rounded-lg shadow-2xl relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-bordo"></div>
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-bordo"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-bordo"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-bordo"></div>

      <div className="text-center mb-12 border-b-2 border-bordo pb-6">
        <h1 className="heading-1 mb-2 tracking-wide uppercase">Sahaf Sitesi</h1>
        <h2 className="heading-2 uppercase tracking-widest text-ink opacity-80">Tasarım Rehberi</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Sol Taraf - Renk Paleti */}
        <div className="bg-paper p-6 rounded-md shadow-inner border border-old-paper">
          <div className="text-center mb-6 relative">
            <span className="bg-linen px-4 py-1 border-y border-bordo font-cormorant text-xl font-bold uppercase tracking-widest text-bordo inline-block">
              Renk Paleti
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ColorSwatch hex="#FBF9F4" name="Kağıt Parşömeni" desc="(Ana Arka Plan)" colorClass="bg-paper" textClass="text-ink" border={true} />
            <ColorSwatch hex="#F3EFE0" name="Hafif Keten" desc="(Yan Arka Plan)" colorClass="bg-linen" textClass="text-ink" border={true} />
            <ColorSwatch hex="#2B2625" name="İsli Mürekkep" desc="(Ana Metin)" colorClass="bg-ink" textClass="text-paper" />
            <ColorSwatch hex="#722F37" name="Antik Bordo" desc="(Birincil Renk)" colorClass="bg-bordo" textClass="text-paper" />
            
            {/* Alt Satır Renkler */}
            <div className="col-span-2 grid grid-cols-3 gap-4 mt-2">
              <ColorSwatch hex="#2C4A3E" name="Orman Yeşili" desc="(İkincil Renk)" colorClass="bg-forest" textClass="text-paper" />
              <ColorSwatch hex="#D4A373" name="Kehribar" desc="(Eylem Butonu - CTA)" colorClass="bg-amber" textClass="text-ink" />
              <ColorSwatch hex="#E8E2D5" name="Eski Sayfa Sarısı" desc="(Karanlık Mod Metni)" colorClass="bg-old-paper" textClass="text-ink" border={true} />
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Tipografi */}
        <div className="space-y-8">
          <div className="text-center relative mb-4">
            <span className="bg-linen px-4 py-1 border-y border-bordo font-cormorant text-xl font-bold uppercase tracking-widest text-bordo inline-block">
              Font Tavsiyeleri
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Sütun 1: Başlıklar */}
            <div className="space-y-6">
              <div>
                <h3 className="ui-text mb-2 uppercase border-b border-old-paper pb-1 text-ink">Başlıklar İçin</h3>
                <p className="text-xs text-ink opacity-70 mb-3">(H1, Kitap Adları)</p>
                
                <div className="mb-4">
                  <div className="font-bold font-inter text-sm mb-1">Playfair Display</div>
                  <div className="font-playfair text-xl italic leading-tight">Klasik Bir Romanın Başlığı</div>
                </div>
                
                <div className="mb-4">
                  <div className="font-bold font-inter text-sm mb-1">Merriweather</div>
                  <div className="font-merriweather text-lg font-bold">Klasik Bir Romanın</div>
                </div>
                
                <div>
                  <div className="font-bold font-inter text-sm mb-1">Cormorant Garamond</div>
                  <div className="font-cormorant text-2xl font-medium">Klasik Bir Romanın</div>
                </div>
              </div>
            </div>

            {/* Sütun 2: Gövde ve Arayüz */}
            <div className="space-y-6">
              <div>
                <h3 className="ui-text mb-2 uppercase border-b border-old-paper pb-1 text-ink">Gövde & Arayüz</h3>
                <p className="text-xs text-ink opacity-70 mb-3">(Fiyatlar, Butonlar)</p>
                
                <div className="mb-4">
                  <div className="font-bold font-inter text-sm mb-1">Inter</div>
                  <p className="body-text text-sm mb-1">Açıklama Metni,</p>
                  <p className="price-tag">₺120.00</p>
                </div>
                
                <div>
                  <div className="font-bold font-inter text-sm mb-1">Plus Jakarta Sans</div>
                  <p className="ui-text mb-1">Açıklama Metni,</p>
                  <p className="font-jakarta font-bold text-lg text-bordo">₺120.00</p>
                </div>
              </div>
            </div>

            {/* Sütun 3: Alternatif Gövde */}
            <div className="space-y-6">
              <div>
                <h3 className="ui-text mb-2 uppercase border-b border-old-paper pb-1 text-ink">Alternatif Gövde</h3>
                <p className="text-xs text-ink opacity-70 mb-3">(Kitap Hissi)</p>
                
                <div>
                  <div className="font-bold font-inter text-sm mb-1">Lora</div>
                  <p className="body-alt text-sm">
                    Bu kitap, eski zamanların kokusunu sayfalarında barındırır. Her bir harfi özenle seçilmiş, ruhunuzu besleyecek bir şaheserdir.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Örnek Butonlar */}
          <div className="pt-6 border-t border-old-paper">
             <h3 className="ui-text mb-4 uppercase text-ink">Buton Örnekleri (Tailwind Bileşenleri)</h3>
             <div className="flex flex-wrap gap-4">
               <button className="btn-primary">Sepete Ekle</button>
               <button className="btn-secondary">İncele</button>
               <button className="btn-action">Hemen Al</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Renk Kutucuğu Bileşeni
const ColorSwatch = ({ hex, name, desc, colorClass, textClass, border }) => (
  <div className={`p-4 rounded-md shadow flex flex-col items-center justify-center text-center ${colorClass} ${textClass} ${border ? 'border border-gray-300' : ''} h-32 transition-transform hover:scale-105`}>
    <div className="font-jakarta font-bold text-sm mb-1">{hex}</div>
    <div className="font-inter font-semibold text-sm leading-tight">{name}</div>
    <div className="font-inter text-xs opacity-80 mt-1">{desc}</div>
  </div>
);

export default DesignSystemCard;
