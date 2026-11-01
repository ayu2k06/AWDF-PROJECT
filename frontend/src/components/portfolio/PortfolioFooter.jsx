// Portfolio Footer Component — Week 1 reusable component
import { GitBranch, Link2, Mail, Heart } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const PortfolioFooter = ({ name, email, github, linkedin }) => {
  return (
    <footer style={{
      borderTop: '1px solid rgba(139, 92, 246, 0.1)',
      padding: '2rem 0',
      marginTop: '4rem',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: '#e2e2f0', fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.25rem' }}>{name}</p>
            <p style={{ color: '#6b6b8a', fontSize: '0.8rem', margin: 0 }}>
              B.Tech IT · CHARUSAT University · AWDF Project 2026
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {github && (
              <a href={github} target="_blank" rel="noreferrer" aria-label="GitHub" style={{ color: '#6b6b8a', transition: 'color 0.2s' }}>
                <GitBranch size={18} />
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" style={{ color: '#6b6b8a', transition: 'color 0.2s' }}>
                <Link2 size={18} />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} aria-label="Email" style={{ color: '#6b6b8a', transition: 'color 0.2s' }}>
                <Mail size={18} />
              </a>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(139, 92, 246, 0.08)', paddingTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <p style={{ color: '#3d3d5c', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            © {CURRENT_YEAR} {name} · Built with <Heart size={12} style={{ color: '#8b5cf6' }} /> using React, Node.js & Express
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PortfolioFooter;
