import { Link } from 'react-router-dom';
import { Zap, CheckSquare, Sparkles, GitBranch, Activity, Shield, ArrowRight, Users, Clock, BarChart3 } from 'lucide-react';

const FEATURES = [
  { icon: CheckSquare, title: 'Smart Task Management', desc: 'Create, organize, and track tasks with powerful filtering, sorting, and search capabilities.', color: '#8b5cf6' },
  { icon: Sparkles, title: 'AI Task Assistant', desc: 'Get AI-powered task descriptions, priority suggestions, and deadline recommendations.', color: '#22d3ee' },
  { icon: GitBranch, title: 'GitHub Explorer', desc: 'Browse and display public GitHub repositories with live API integration and rich metadata.', color: '#34d399' },
  { icon: Shield, title: 'JWT Authentication', desc: 'Secure registration and login with hashed passwords, JWT tokens, and protected routes.', color: '#fbbf24' },
  { icon: Activity, title: 'Performance Analytics', desc: 'Real-time cache statistics, API response metrics, and system health monitoring.', color: '#fb7185' },
  { icon: BarChart3, title: 'Productivity Dashboard', desc: 'Visual charts, completion rates, overdue alerts, and weekly productivity trends.', color: '#a3e635' },
];

const STATS = [
  { value: '13', label: 'Weeks Implemented', icon: Clock },
  { value: '16', label: 'Coursera Modules', icon: CheckSquare },
  { value: 'Full', label: 'Stack Integration', icon: Zap },
  { value: 'CHARUSAT', label: 'University Project', icon: Users },
];

const LandingPage = () => {
  return (
    <div className="public-page marketing-page">
      {/* Top Bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5ebe7',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 34, height: 34, background: '#27675d', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#243330' }}>FocusDesk</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/login" className="btn-outline" style={{ fontSize: '0.875rem' }}>Log In</Link>
            <Link to="/register" className="btn-brand" style={{ fontSize: '0.875rem' }}>Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#edf5f2', border: '1px solid #dce8e2', borderRadius: 20, padding: '6px 14px', marginBottom: '2rem' }}>
          <Sparkles size={14} style={{ color: '#27675d' }} />
          <span style={{ fontSize: '0.8rem', color: '#27675d', fontWeight: 500 }}>AWDF PROJECT · ITUE301 · CHARUSAT</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          <span className="gradient-text">FocusDesk</span>
          <br />
          <span style={{ color: '#243330' }}>A calmer way to get work done</span>
        </h1>

        <p style={{ fontSize: '1.125rem', color: '#65746f', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Keep your tasks, projects, and priorities in one clear workspace. Plan the day, see what matters, and keep moving.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-brand" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-outline" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', maxWidth: 700, margin: '4rem auto 0', flexWrap: 'wrap' }}>
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="glass-card" style={{ padding: '1.25rem 0.75rem', textAlign: 'center' }}>
              <Icon size={18} style={{ color: '#8b5cf6', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e2f0', lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6b6b8a', marginTop: '0.25rem', lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid background decoration */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(rgba(39, 103, 93, 0.045) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#e2e2f0', marginBottom: '0.75rem' }}>
            Everything you need, fully integrated
          </h2>
          <p style={{ color: '#6b6b8a', fontSize: '0.9375rem' }}>
            Each feature maps directly to a week of the AWDF curriculum
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e2f0', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: '#6b6b8a', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div className="glass-card" style={{ borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e2f0', marginBottom: '0.5rem' }}>Full-Stack Tech Stack</h2>
          <p style={{ color: '#6b6b8a', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Built with production-grade technologies</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {['React', 'Vite', 'React Router', 'Tailwind CSS', 'Node.js', 'Express', 'In-memory data', 'JWT', 'bcrypt', 'node-cache', 'EventEmitter', 'Docker', 'GitHub Actions', 'Gemini AI', 'Vitest', 'Jest', 'Supertest'].map((tech) => (
              <span key={tech} style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500 }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#e2e2f0', marginBottom: '1rem' }}>Ready to explore?</h2>
        <p style={{ color: '#6b6b8a', marginBottom: '2rem' }}>Create an account and see all 13 weeks in action.</p>
        <Link to="/register" className="btn-brand" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }}>
          Get Started Free <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(139, 92, 246, 0.1)', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#3d3d5c', fontSize: '0.8rem' }}>
          FocusDesk · AWDF Project · ITUE301 · Aryan Tada · B.Tech IT · CHARUSAT University
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
