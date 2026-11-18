import React from 'react';

const DynamicBackground = ({ preferences = {} }) => {
  if (preferences.dynamicBackground === false) {
    return null;
  }

  return (
    <div 
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        backgroundColor: '#060d1f',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {/* Radial ambient cyber glows */}
      <div 
        style={{
          position: 'absolute',
          top: '-15%',
          left: '20%',
          width: '55vw',
          height: '55vw',
          maxWidth: '700px',
          maxHeight: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 229, 200, 0.08) 0%, rgba(6, 13, 31, 0) 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 8s ease-in-out infinite alternate'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: '50vw',
          height: '50vw',
          maxWidth: '650px',
          maxHeight: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 255, 102, 0.06) 0%, rgba(6, 13, 31, 0) 70%)',
          filter: 'blur(70px)',
          animation: 'pulse 10s ease-in-out infinite alternate-reverse'
        }}
      />

      {/* Cyber Grid Pattern */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 229, 200, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 229, 200, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.6
        }}
      />

      {/* Vignette Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(6, 13, 31, 0.95) 100%)'
        }}
      />
    </div>
  );
};

export default DynamicBackground;
