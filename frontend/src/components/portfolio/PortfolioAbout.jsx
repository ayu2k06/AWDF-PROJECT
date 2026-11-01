// Portfolio About Component — Week 1 reusable component
const PortfolioAbout = ({ name, role, bio, university, year, avatar }) => {
  return (
    <section id="about" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{
          width: 140, height: 140, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', fontWeight: 700, color: 'white',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
          border: '3px solid rgba(139, 92, 246, 0.4)',
        }}>
          {avatar || name?.[0] || 'A'}
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {university}
            </span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e2f0', margin: '0 0 0.25rem' }}>{name}</h2>
          <p style={{ color: '#a78bfa', fontWeight: 500, fontSize: '1rem', marginBottom: '1rem' }}>{role}</p>
          <p style={{ color: '#9ca3af', lineHeight: 1.7, fontSize: '0.9375rem', maxWidth: 520 }}>{bio}</p>
          {year && (
            <div style={{ marginTop: '1rem' }}>
              <span style={{
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                color: '#a78bfa', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
              }}>
                {year}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PortfolioAbout;
