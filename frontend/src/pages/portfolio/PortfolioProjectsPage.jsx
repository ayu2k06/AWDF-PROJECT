import { ExternalLink, GitBranch } from 'lucide-react';

const PROJECTS = [
  {
    id: 1,
    title: 'FocusDesk',
    description: 'AI-powered task management platform — full-stack project for AWDF ITUE301. Features React, Node.js, Express, JWT auth, Docker, GitHub Actions CI/CD, and Gemini AI integration.',
    tags: ['React', 'Node.js', 'Express', 'JWT', 'Docker', 'AI'],
    color: '#8b5cf6',
    link: 'https://github.com/ayu2k06/AWDF-PROJECT',
    featured: true,
    status: 'In Progress',
  },
  {
    id: 2,
    title: 'Student Grade Predictor (SGP)',
    description: 'A machine learning web application that predicts student academic performance using concept dependency graphs (DAGs) and weak topic analysis. Built with React frontend and Python backend.',
    tags: ['React', 'Python', 'Machine Learning', 'Graph Algorithms'],
    color: '#22d3ee',
    link: 'https://github.com/ayu2k06',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Portfolio Website',
    description: 'This developer portfolio built with React, featuring a dark graphite design system, reusable components (Header, About, Skills, Footer), and responsive layouts.',
    tags: ['React', 'CSS', 'Responsive Design'],
    color: '#34d399',
    link: 'https://github.com/ayu2k06',
    status: 'Complete',
  },
];

const STATUS_COLORS = { 'In Progress': '#fbbf24', 'Active': '#34d399', 'Complete': '#a78bfa' };

const PortfolioProjectsPage = () => {
  return (
    <div className="animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e2f0', margin: '0 0 0.5rem' }}>Projects</h1>
        <p style={{ color: '#6b6b8a', margin: 0 }}>Selected work demonstrating full-stack development skills</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {PROJECTS.map((p) => (
          <div
            key={p.id}
            className="glass-card"
            style={{ padding: '1.75rem', borderLeft: p.featured ? `3px solid ${p.color}` : undefined }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e2e2f0', margin: 0 }}>{p.title}</h2>
                {p.featured && (
                  <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', padding: '2px 9px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600 }}>
                    ⭐ Featured
                  </span>
                )}
                <span style={{ background: `${STATUS_COLORS[p.status]}15`, color: STATUS_COLORS[p.status], border: `1px solid ${STATUS_COLORS[p.status]}30`, padding: '2px 9px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600 }}>
                  {p.status}
                </span>
              </div>
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#a78bfa', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>
                  <GitBranch size={14} /> View on GitHub <ExternalLink size={12} />
                </a>
              )}
            </div>

            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 1rem' }}>{p.description}</p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {p.tags.map((tag) => (
                <span key={tag} style={{ background: `${p.color}12`, border: `1px solid ${p.color}28`, color: '#9ca3af', padding: '3px 10px', borderRadius: 5, fontSize: '0.75rem', fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioProjectsPage;
