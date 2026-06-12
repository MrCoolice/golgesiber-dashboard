import React, { useState, useEffect } from 'react';

const PortfolioRadar = () => {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [rates, setRates] = useState({ USD: 32, EUR: 35, TRY: 1 });

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const fetchMarket = async () => {
      try {
        const apiUrl = `http://${window.location.hostname}:3001/api/finance/radar`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Backend error");
        const data = await res.json();
        
        // Alarm Notifications
        data.forEach(asset => {
          if (asset.status === '🟢 SAT' || asset.status === '🔴 STOP') {
            const cacheKey = `alert_${asset.code}_${asset.status}`;
            const lastAlert = localStorage.getItem(cacheKey);
            const now = Date.now();
            if (!lastAlert || (now - parseInt(lastAlert) > 24 * 60 * 60 * 1000)) {
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`Finans Alarmı: ${asset.displayName}`, {
                  body: `${asset.code} varlığınız ${asset.status} hedefine ulaştı! Net Tutar: ${asset.totalProfitAmount.toFixed(2)} ${asset.currency}`
                });
                localStorage.setItem(cacheKey, now.toString());
              }
            }
          }
        });

        setAssets(data);
        setError(false);
      } catch (e) {
        console.error("Finance API Error:", e);
        setError(true);
      }
    };

    const fetchRates = async () => {
      try {
        const res = await fetch('https://finans.truncgil.com/v3/today.json');
        const data = await res.json();
        const usdRate = parseFloat(data['USD']?.Selling?.replace(',', '.') || 32);
        const eurRate = parseFloat(data['EUR']?.Selling?.replace(',', '.') || 35);
        setRates({ USD: usdRate, EUR: eurRate, TRY: 1 });
      } catch (e) {
        console.error("Rates error", e);
      }
    };
    
    fetchMarket();
    fetchRates();
    const interval = setInterval(() => { fetchMarket(); fetchRates(); }, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderHistCard = (label, pct) => (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-cyan)', padding: '10px', borderRadius: '5px', flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px' }}>{label}</div>
      {pct !== null && pct !== undefined ? (
        <div style={{ fontWeight: 'bold', fontSize: '14px', color: pct >= 0 ? 'var(--neon-green)' : 'var(--neon-red)' }}>
          {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>-</div>
      )}
    </div>
  );

  let globalCurrentValue = 0;
  let globalProfit = 0;

  assets.forEach(asset => {
    const assetCurrency = asset.currency || (asset.code.includes('USD') ? 'USD' : 'TRY');
    let valInTRY = asset.currentValue || 0;
    let profInTRY = asset.totalProfitAmount || 0;
    
    if (assetCurrency === 'USD') {
      valInTRY *= rates.USD;
      profInTRY *= rates.USD;
    } else if (assetCurrency === 'EUR') {
      valInTRY *= rates.EUR;
      profInTRY *= rates.EUR;
    }
    
    globalCurrentValue += valInTRY;
    globalProfit += profInTRY;
  });

  const renderCurrencyBox = (cur, label) => {
    const divider = cur === 'TRY' ? 1 : (cur === 'USD' ? rates.USD : rates.EUR);
    const val = globalCurrentValue / divider;
    const prof = globalProfit / divider;
    
    return (
      <div style={{ flex: 1, minWidth: '150px', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '10px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Para Birimi: <strong style={{color:'var(--neon-cyan)'}}>{label}</strong></div>
        <div className="font-mono">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toplam Varlık: {val.toFixed(2)}</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: prof >= 0 ? 'var(--neon-green)' : 'var(--neon-red)' }}>
            Net K/Z: {prof > 0 ? '+' : ''}{prof.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ overflowX: 'auto' }}>
      <h4 style={{ color: 'var(--neon-green)', margin: '0 0 15px 0', textShadow: '0 0 10px var(--neon-green)' }}>◆ PORTFÖY RADARI</h4>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-cyan)' }}>
        <div style={{ width: '100%', fontSize: '11px', color: 'var(--neon-yellow)', letterSpacing: '1px', marginBottom: '5px' }}>KÜRESEL SERVET ÖZETİ</div>
        <div style={{ display: 'flex', width: '100%', gap: '15px', overflowX: 'auto' }}>
            {renderCurrencyBox('TRY', 'TRY (₺)')}
            {renderCurrencyBox('USD', 'USD ($)')}
            {renderCurrencyBox('EUR', 'EUR (€)')}
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>Detaylı geçmiş veri analizini görmek için varlıkların üzerine tıklayın.</div>
      {error ? (
        <div style={{ color: 'var(--neon-red)' }}>Backend API Bağlantı Hatası! (Portföy Sunucusuna Ulaşılamıyor)</div>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-cyan)' }}>
              <th style={{ paddingBottom: '10px' }}>Varlık</th>
              <th style={{ paddingBottom: '10px' }}>Adet</th>
              <th style={{ paddingBottom: '10px' }}>Anlık / Maliyet</th>
              <th style={{ paddingBottom: '10px' }}>Toplam K/Z</th>
              <th style={{ paddingBottom: '10px' }}>Net Tutar</th>
              <th style={{ paddingBottom: '10px' }}>Durum</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {assets.map((asset, idx) => (
              <React.Fragment key={idx}>
                <tr 
                  onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                  style={{ 
                    borderBottom: expandedRow === idx ? 'none' : '1px solid rgba(255,255,255,0.05)', 
                    cursor: 'pointer',
                    background: expandedRow === idx ? 'rgba(0,255,102,0.05)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  className="hover-highlight"
                >
                  <td style={{ padding: '12px 0' }}>
                      <div style={{ fontWeight: 'bold' }}>{asset.displayName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{asset.code}</div>
                  </td>
                  <td>{asset.totalQuantity || 0}</td>
                  <td>
                    <div>{asset.livePrice ? asset.livePrice.toFixed(2) : '-'} <span style={{fontSize:'10px', color:'var(--text-muted)'}}>{asset.currency}</span></div>
                    <div style={{fontSize:'11px', color:'var(--text-muted)'}}>Ort: {asset.buyPrice > 0 ? asset.buyPrice.toFixed(2) : '-'}</div>
                  </td>
                  <td style={{ color: asset.totalPct >= 0 ? 'var(--neon-green)' : 'var(--neon-red)', fontWeight: 'bold' }}>
                    {asset.buyPrice > 0 ? `${asset.totalPct >= 0 ? '+' : ''}${asset.totalPct.toFixed(2)}%` : '-'}
                    <div style={{fontSize:'11px', color:'var(--text-muted)', fontWeight:'normal'}}>Günlük: {asset.livePrice > 0 ? `${asset.dayPct >= 0 ? '+' : ''}${asset.dayPct.toFixed(2)}%` : '-'}</div>
                  </td>
                  <td>
                    <div style={{ color: asset.totalProfitAmount >= 0 ? 'var(--neon-green)' : 'var(--neon-red)', fontWeight: 'bold' }}>
                      {asset.totalProfitAmount > 0 ? '+' : ''}{asset.totalProfitAmount ? asset.totalProfitAmount.toFixed(2) : '0.00'} <span style={{fontSize:'10px'}}>{asset.currency}</span>
                    </div>
                    <div style={{fontSize:'11px', color:'var(--text-muted)'}}>AnaPara: {asset.totalInvestment ? asset.totalInvestment.toFixed(2) : '0.00'}</div>
                  </td>
                  <td style={{ 
                      color: asset.status === '🟢 SAT' ? 'var(--neon-green)' : (asset.status === '🔴 STOP' ? 'var(--neon-red)' : 'var(--text-muted)'),
                      fontWeight: asset.status !== '- BEKLE' ? 'bold' : 'normal'
                  }}>
                    <span className={asset.status !== '- BEKLE' ? 'animate-pulse' : ''} style={{ textShadow: asset.status !== '- BEKLE' ? `0 0 10px ${asset.status === '🟢 SAT' ? 'var(--neon-green)' : 'var(--neon-red)'}` : 'none' }}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
                {expandedRow === idx && asset.historical && (
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,255,102,0.02)' }}>
                    <td colSpan="6" style={{ padding: '0 0 15px 0' }}>
                      <div style={{ display: 'flex', gap: '10px', padding: '0 10px', marginTop: '-5px' }}>
                        {renderHistCard('1 Haftalık', asset.historical.w1)}
                        {renderHistCard('1 Aylık', asset.historical.m1)}
                        {renderHistCard('3 Aylık', asset.historical.m3)}
                        {renderHistCard('6 Aylık', asset.historical.m6)}
                        {renderHistCard('1 Yıllık', asset.historical.y1)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {assets.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--neon-yellow)' }}>Henüz varlık eklenmedi. Admin panelinden portföyünüzü oluşturun.</td></tr>
            )}
          </tbody>
        </table>
      )}
      <style>{`
        .hover-highlight:hover { background: rgba(0, 229, 200, 0.05) !important; }
      `}</style>
    </div>
  );
};

export default PortfolioRadar;
