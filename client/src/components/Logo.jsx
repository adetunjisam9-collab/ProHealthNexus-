const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: { box: '32px', radius: '8px', icon: '13px', name: '15px', tag: '7px', gap: '8px' },
    md: { box: '38px', radius: '10px', icon: '15px', name: '17px', tag: '8px', gap: '10px' },
    lg: { box: '42px', radius: '11px', icon: '17px', name: '18px', tag: '8px', gap: '10px' },
  };

  const s = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      <div style={{
        width: s.box, height: s.box, borderRadius: s.radius,
        background: '#1e3a5f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <i className="fa-solid fa-staff-snake" style={{ color: 'white', fontSize: s.icon }}></i>
      </div>
      <div>
        <div style={{ fontWeight: '700', fontSize: s.name, lineHeight: 1.2 }}>
          <span style={{ color: '#1e3a5f' }}>ProHealth </span>
          <span style={{ color: '#2563eb' }}>Nexus</span>
        </div>
        <div style={{ fontSize: s.tag, color: '#9ca3af', letterSpacing: '1.5px', marginTop: '1px' }}>
          YOUR HEALTH, OUR PRIORITY
        </div>
      </div>
    </div>
  );
};

export default Logo;