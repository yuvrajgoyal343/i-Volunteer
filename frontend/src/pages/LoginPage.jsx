// LoginPage.jsx — User login with real backend auth
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Please enter a valid email address.';
    if (!form.password || form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setApiError('');
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      setSuccess('Signed in successfully! Entering website…');
      setTimeout(() => navigate('/'), 700);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left brand panel */}
      <div className="login-brand-panel">
        <div className="login-brand-content">
          <Link to="/" className="site-logo" style={{ color: 'var(--color-white)', marginBottom: 'var(--space-12)', display: 'inline-flex' }}>
            <div className="logo-icon" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'var(--color-white)' }}>iV</div>
            <span>iVolunteer</span>
          </Link>
          <h1 className="login-brand-heading">Every act of giving creates a ripple of change.</h1>
          <p className="login-brand-subtext">Join donors and volunteers making a real difference in communities across Chandigarh Tricity & Punjab.</p>
          <div className="login-brand-stats">
            {[['2,800+', 'Donations Delivered'], ['12', 'Verified Organisations'], ['1,400+', 'Active Volunteers']].map(([n, l]) => (
              <div className="login-stat" key={l}>
                <span className="login-stat-number">{n}</span>
                <span className="login-stat-label">{l}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 'var(--space-4)' }}>* Impact metrics across Chandigarh, Mohali, Panchkula & Punjab</p>
        </div>
        <div className="login-brand-decor">
          <div className="decor-circle decor-circle-1"></div>
          <div className="decor-circle decor-circle-2"></div>
          <div className="decor-circle decor-circle-3"></div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-mobile-logo">
            <Link to="/" className="site-logo">
              <div className="logo-icon">iV</div>
              <span>iVolunteer</span>
            </Link>
          </div>

          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to manage your donations and volunteering activity.</p>
          </div>

          <div style={{
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-primary-50, #eff6ff)',
            border: '1px solid var(--color-primary-200, #bfdbfe)',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div>
                <strong style={{ color: 'var(--color-primary-800, #1e40af)' }}>💡 Demo Account:</strong>
                <div style={{ color: 'var(--color-neutral-600, #4b5563)', fontSize: '0.8rem', marginTop: '2px' }}>
                  <code>demo@ivolunteer.org</code> / <code>password123</code>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm({ email: 'demo@ivolunteer.org', password: 'password123' });
                  setErrors({});
                }}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-primary-600, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Auto-fill
              </button>
            </div>
          </div>

          {success && <div className="form-success visible" role="alert">{success}</div>}
          {apiError && <div className="form-error" style={{ display: 'block', marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--color-error-bg, #fef2f2)', borderRadius: 'var(--radius-md)', color: 'var(--color-error, #dc2626)', border: '1px solid var(--color-error-border, #fecaca)' }}>{apiError}</div>}

          <form id="login-form" noValidate onSubmit={handleSubmit}>
            {/* Email */}
            <div className={`form-group${errors.email ? ' has-error' : ''}`}>
              <label htmlFor="login-email">Email Address <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  type="email" id="login-email"
                  className="form-input form-input-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={`form-group${errors.password ? ' has-error' : ''}`}>
              <div className="label-row">
                <label htmlFor="login-password">Password <span className="required">*</span></label>
                <a
                  href="mailto:support@ivolunteer.org?subject=Password%20Reset%20Assistance"
                  className="forgot-link"
                  title="Password reset is not available in demo mode. Click to contact support."
                >
                  Forgot password?
                </a>
              </div>
              <div className="input-icon-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type={showPass ? 'text' : 'password'} id="login-password"
                  className="form-input form-input-icon"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
                  autoComplete="current-password"
                />
                <button type="button" className="password-toggle" aria-label="Toggle password" onClick={() => setShowPass(s => !s)}>
                  {showPass
                    ? <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Remember me */}
            <div className="form-group">
              <label className="checkbox-item">
                <input type="checkbox" id="login-remember" name="remember" />
                Keep me signed in
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-submit-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="login-footer-text">
            Do not have an account? <Link to="/signup" className="login-link">Create one</Link>
          </p>
          <p className="login-back-link">
            <Link to="/">
              <svg viewBox="0 0 24 24" width="14" height="14"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
