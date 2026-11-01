import { useState } from 'react';
import { Mail, GitBranch, Link2, Send, CheckCircle } from 'lucide-react';

const PortfolioContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    // Simulate form submission (no backend email integration in this project)
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setSubmitting(false);
  };

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const CONTACTS = [
    { icon: Mail, label: 'Email', value: 'aryantada@charusat.edu.in', href: 'mailto:aryantada@charusat.edu.in', color: '#8b5cf6' },
    { icon: GitBranch, label: 'GitHub', value: 'github.com/ayu2k06', href: 'https://github.com/ayu2k06', color: '#e2e2f0' },
    { icon: Link2, label: 'LinkedIn', value: 'linkedin.com/in/aryan-tada', href: 'https://linkedin.com/in/aryan-tada', color: '#22d3ee' },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e2f0', margin: '0 0 0.5rem' }}>Get in Touch</h1>
        <p style={{ color: '#6b6b8a', margin: 0 }}>Interested in collaborating or have a question? Feel free to reach out.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Contact Info */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e2f0', marginBottom: '1.25rem' }}>Contact Information</h2>
          {CONTACTS.map(({ icon: Icon, label, value, href, color }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', marginBottom: '0.75rem', background: 'rgba(26,26,39,0.6)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)'; e.currentTarget.style.background = 'rgba(26,26,39,0.6)'; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#52526e', fontWeight: 500, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '0.875rem', color: '#e2e2f0', fontWeight: 500 }}>{value}</div>
              </div>
            </a>
          ))}

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.375rem' }}>Aryan Tada</div>
            <div style={{ fontSize: '0.8rem', color: '#6b6b8a', lineHeight: 1.6 }}>
              B.Tech Information Technology<br />
              Charotar University of Science and Technology<br />
              Faculty of Technology and Engineering<br />
              Anand, Gujarat, India
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle size={28} style={{ color: '#34d399' }} />
              </div>
              <h3 style={{ color: '#e2e2f0', marginBottom: '0.5rem' }}>Form Validated</h3>
              <p style={{ color: '#6b6b8a', fontSize: '0.875rem' }}>Your message passed client-side validation. This demo does not deliver email or store the message.</p>
              <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <label htmlFor="contact-name" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Name *</label>
                  <input id="contact-name" className={`input-field${errors.name ? ' error' : ''}`} value={form.name} onChange={set('name')} placeholder="Aryan Tada" />
                  {errors.name && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{errors.name}</span>}
                </div>
                <div>
                  <label htmlFor="contact-email" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Email *</label>
                  <input id="contact-email" type="email" className={`input-field${errors.email ? ' error' : ''}`} value={form.email} onChange={set('email')} placeholder="you@example.com" />
                  {errors.email && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{errors.email}</span>}
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Subject *</label>
                <input id="contact-subject" className={`input-field${errors.subject ? ' error' : ''}`} value={form.subject} onChange={set('subject')} placeholder="Project collaboration, question..." />
                {errors.subject && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{errors.subject}</span>}
              </div>

              <div>
                <label htmlFor="contact-message" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Message *</label>
                <textarea id="contact-message" className={`input-field${errors.message ? ' error' : ''}`} value={form.message} onChange={set('message')} rows={5} placeholder="Tell me about your project or question..." style={{ resize: 'vertical' }} />
                {errors.message && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{errors.message}</span>}
              </div>

              <button type="submit" className="btn-brand" disabled={submitting} style={{ justifyContent: 'center', padding: '0.75rem' }}>
                {submitting ? 'Validating...' : <><Send size={15} /> Validate Message</>}
              </button>

              <p style={{ fontSize: '0.72rem', color: '#3d3d5c', textAlign: 'center', margin: 0 }}>
                Note: This form demonstrates client-side validation and form state management. Email delivery requires a backend email service (not implemented in this project scope).
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioContactPage;
