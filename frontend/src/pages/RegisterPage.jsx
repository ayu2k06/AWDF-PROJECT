import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Loader2, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome to FocusDesk.');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.details) {
        const fe = {};
        data.details.forEach((d) => { fe[d.field] = d.message; });
        setErrors(fe);
      } else {
        toast.error(data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  return (
    <div className="public-page auth-page">
      <div className="auth-grid" />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
            <div style={{ width: 40, height: 40, background: '#27675d', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#243330' }}>FocusDesk</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#243330', margin: '0 0 0.375rem' }}>Create your account</h1>
          <p style={{ color: '#65746f', fontSize: '0.875rem', margin: 0 }}>Set up your workspace in a few steps.</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Name */}
            <div>
              <label htmlFor="reg-name" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52526e' }} />
                <input
                  id="reg-name"
                  className={`input-field${errors.name ? ' error' : ''}`}
                  style={{ paddingLeft: 36 }}
                  type="text" value={form.name} onChange={set('name')}
                  placeholder="Aryan Tada" autoComplete="name"
                />
              </div>
              {errors.name && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.name}</span>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52526e' }} />
                <input
                  id="reg-email"
                  className={`input-field${errors.email ? ' error' : ''}`}
                  style={{ paddingLeft: 36 }}
                  type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" autoComplete="email"
                />
              </div>
              {errors.email && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52526e' }} />
                <input
                  id="reg-password"
                  className={`input-field${errors.password ? ' error' : ''}`}
                  style={{ paddingLeft: 36, paddingRight: 44 }}
                  type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="At least 6 characters" autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#52526e', padding: 0 }} aria-label="Toggle password">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.password}</span>}
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="reg-confirm" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52526e' }} />
                <input
                  id="reg-confirm"
                  className={`input-field${errors.confirm ? ' error' : ''}`}
                  style={{ paddingLeft: 36 }}
                  type={showPw ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')}
                  placeholder="Repeat password" autoComplete="new-password"
                />
              </div>
              {errors.confirm && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.confirm}</span>}
            </div>

            <button type="submit" className="btn-brand" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.75rem', justifyContent: 'center', fontSize: '0.9375rem' }}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b6b8a', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
