import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Zap, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const e = {};
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.details) {
        const fe = {};
        data.details.forEach((d) => { fe[d.field] = d.message; });
        setErrors(fe);
      } else {
        toast.error(data?.error || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  return (
    <div className="public-page auth-page">
      <div className="auth-grid" />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
            <div style={{ width: 40, height: 40, background: '#27675d', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#243330' }}>FocusDesk</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#243330', margin: '0 0 0.375rem' }}>Sign in to your account</h1>
          <p style={{ color: '#65746f', fontSize: '0.875rem', margin: 0 }}>Pick up where you left off.</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="login-email" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52526e' }} />
                <input
                  id="login-email"
                  className={`input-field${errors.email ? ' error' : ''}`}
                  style={{ paddingLeft: 36 }}
                  type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" autoComplete="email"
                />
              </div>
              {errors.email && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.email}</span>}
            </div>

            <div>
              <label htmlFor="login-password" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: '0.375rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52526e' }} />
                <input
                  id="login-password"
                  className={`input-field${errors.password ? ' error' : ''}`}
                  style={{ paddingLeft: 36, paddingRight: 44 }}
                  type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Your password" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#52526e', padding: 0 }} aria-label="Toggle password">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.password}</span>}
            </div>

            <button type="submit" className="btn-brand" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.75rem', justifyContent: 'center', fontSize: '0.9375rem' }}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b6b8a', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
