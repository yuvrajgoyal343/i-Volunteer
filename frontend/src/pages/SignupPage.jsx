// SignupPage.jsx — Register new user with Chandigarh Tricity & Punjab region branding
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Chandigarh',
    password: '',
    isVolunteer: true
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your full name.';
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
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        city: form.city.trim(),
        isVolunteer: form.isVolunteer
      });
      login(res.data.token, res.data.user);
      setSuccess('Account created successfully! Redirecting to your profile…');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    setErrors(er => ({ ...er, [field]: '' }));
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
          <h1 className="login-brand-heading">Join our community of givers &amp; change-makers.</h1>
          <p className="login-brand-subtext">Create your iVolunteer account to track doorstep donations, connect with top verified Tricity non-profits, and log your volunteer hours.</p>
          <div className="login-brand-stats">
            {[['2,800+', 'Donations Delivered'], ['12', 'Verified Organisations'], ['1,400+', 'Active Volunteers']].map(([n, l]) => (
              <div className="login-stat" key={l}>
                <span className="login-stat-number">{n}</span>
                <span className="login-stat-label">{l}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 'var(--space-4)' }}>
            * Verified impact metrics across Chandigarh, Mohali, Panchkula &amp; Punjab
          </p>
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
            <h2>Create an account</h2>
            <p>Start your journey of giving back and making a local impact today.</p>
          </div>

          {success && <div className="form-success visible" role="alert">{success}</div>}
          {apiError && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--color-error-bg, #fef2f2)', borderRadius: 'var(--radius-md)', color: 'var(--color-error, #dc2626)', border: '1px solid #fecaca' }}>
              {apiError}
            </div>
          )}

          <form id="signup-form" noValidate onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className={`form-group${errors.name ? ' has-error' : ''}`}>
              <label htmlFor="signup-name">Full Name <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="signup-name" className="form-input form-input-icon" placeholder="e.g. Amanpreet Singh" value={form.name} onChange={setField('name')} autoComplete="name" />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className={`form-group${errors.email ? ' has-error' : ''}`}>
              <label htmlFor="signup-email">Email Address <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" id="signup-email" className="form-input form-input-icon" placeholder="you@example.com" value={form.email} onChange={setField('email')} autoComplete="email" />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Phone & City */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="signup-phone">Phone / WhatsApp</label>
                <input type="tel" id="signup-phone" className="form-input" placeholder="+91 98140 76543" value={form.phone} onChange={setField('phone')} />
              </div>
              <div className="form-group">
                <label htmlFor="signup-city">City / Region</label>
                <input type="text" id="signup-city" className="form-input" placeholder="Chandigarh, Mohali..." value={form.city} onChange={setField('city')} />
              </div>
            </div>

            {/* Password */}
            <div className={`form-group${errors.password ? ' has-error' : ''}`}>
              <label htmlFor="signup-password">Password <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" id="signup-password" className="form-input form-input-icon" placeholder="At least 6 characters" value={form.password} onChange={setField('password')} autoComplete="new-password" />
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Volunteer checkbox */}
            <div className="form-group" style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <label className="checkbox-item" style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary-dark)' }}>
                <input type="checkbox" id="signup-is-volunteer" checked={form.isVolunteer} onChange={setField('isVolunteer')} />
                Enroll as Active Volunteer (Unlocks Badges &amp; Drive RSVP)
              </label>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 4, marginLeft: 24 }}>
                Enables volunteer badges, drive hours tracking, and certificates in your profile.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-submit-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create My Free Account →'}
            </button>
          </form>

          <p className="login-footer-text">
            Already have an account? <Link to="/login" className="login-link">Sign In</Link>
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
