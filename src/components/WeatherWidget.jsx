import React, { useState, useEffect } from 'react';

const WeatherWidget = ({ city }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiKey = "9ed070477bcbe8f7043bc1151d3dab14"; 
    const queryCity = city || "Istanbul";
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${queryCity}&appid=${apiKey}&units=metric&lang=tr`)
      .then(r => r.json())
      .then(res => {
        if (res.cod === 200) {
          setData({
            temp: Math.round(res.main.temp),
            city: res.name,
            desc: res.weather[0].description,
            icon: res.weather[0].icon
          });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [city]);

  if (error) {
    return <div className="glass-panel" style={{ borderColor: 'var(--neon-red)' }}>Hava Durumu API Hatası</div>;
  }

  if (!data) return <div className="glass-panel">Hava Durumu Yükleniyor...</div>;

  return (
    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '300px' }}>
      <img 
        src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} 
        alt="weather"
        style={{ width: '60px', filter: 'drop-shadow(0 0 8px var(--neon-cyan))' }} 
      />
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--neon-green)', textShadow: '0 0 10px var(--neon-green)' }}>
          {data.temp}°C
        </div>
        <div style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.city}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)' }}>[SYS: {data.desc}]</div>
      </div>
    </div>
  );
};

export default WeatherWidget;
