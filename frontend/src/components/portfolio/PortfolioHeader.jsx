// Portfolio Header Component — Week 1 reusable component
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

const PortfolioHeader = ({ name = 'Aryan Tada', navLinks }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = navLinks || [
    { to: '/portfolio', label: 'Home' },
    { to: '/portfolio/projects', label: 'Projects' },
    { to: '/portfolio/contact', label: 'Contact' },
  ];

  return (
    <header style={{
      background: 'rgba(17, 17, 24, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
        {/* Logo */}
        <Link to="/portfolio" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e2f0' }}>{name}</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: location.pathname === l.to ? '#a78bfa' : '#9ca3af',
                background: location.pathname === l.to ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
          aria-label="Toggle menu"
          className="mobile-menu-btn"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div style={{ padding: '0.5rem 1.5rem 1rem', borderTop: '1px solid rgba(139, 92, 246, 0.1)' }}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '0.625rem 0', color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default PortfolioHeader;
