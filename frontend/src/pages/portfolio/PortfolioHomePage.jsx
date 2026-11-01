import PortfolioAbout from '../../components/portfolio/PortfolioAbout';
import PortfolioSkills from '../../components/portfolio/PortfolioSkills';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const STUDENT = {
  name: 'Aryan Tada',
  role: 'Full-Stack Developer & B.Tech IT Student',
  bio: 'I am a B.Tech Information Technology student at CHARUSAT University, passionate about building thoughtful web applications, exploring machine learning, and creating elegant user experiences. This portfolio features FocusDesk, a full-stack productivity app built for the AWDF curriculum.',
  university: 'CHARUSAT University · Faculty of Technology & Engineering',
  year: 'B.Tech IT · Semester 5 · 2024–2025',
};

const HIGHLIGHTS = [
  { label: 'Full-Stack App', desc: 'React + Node.js + Express', color: '#8b5cf6' },
  { label: 'AI Integration', desc: 'Gemini API with fallback', color: '#22d3ee' },
  { label: 'DevOps', desc: 'Docker + GitHub Actions', color: '#34d399' },
  { label: 'Security', desc: 'JWT + bcrypt auth', color: '#fbbf24' },
];

const PortfolioHomePage = () => {
  return (
    <div className="animate-fade-in">
      <PortfolioAbout {...STUDENT} />

      {/* Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem', marginBottom: '3rem' }}>
        {HIGHLIGHTS.map(({ label, desc, color }) => (
          <div key={label} className="glass-card" style={{ padding: '1rem', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontWeight: 600, color: '#e2e2f0', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b6b8a' }}>{desc}</div>
          </div>
        ))}
      </div>

      <PortfolioSkills />

      {/* CTA */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/portfolio/projects" className="btn-brand">
          View Projects <ArrowRight size={16} />
        </Link>
        <Link to="/portfolio/contact" className="btn-outline">
          Get in Touch
        </Link>
        <a href="https://github.com/ayu2k06" target="_blank" rel="noreferrer" className="btn-outline">
          GitHub <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default PortfolioHomePage;
