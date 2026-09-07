// SignupPage.jsx — Register new user, all profile data from form
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', password: '', isVolunteer: true
  });
  const [errors, setErrors]   = useState({});
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
        name:        form.name.trim(),
        email:       form.email.trim(),
        password:    form.password,
        phone:       form.phone.trim(),
        city:        form.city.trim(),
        isVolunteer: form.isVolunteer,
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
          <p className="login-brand-subtext">Create your iVolunteer account to track donations, connect with top verified NGOs, and manage your volunteer journey.</p>
          <div className="login-brand-stats">
            {[['2,400+', 'Donations Delivered'], ['85+', 'Verified Organisations'], ['1,200+', 'Active Volunteers']].map(([n, l]) => (
              <div className="login-stat" key={l}>
                <span className="login-stat-number">{n}</span>
                <span className="login-stat-label">{l}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 'var(--space-4)' }}>* Platform-wide network impact metrics across India</p>
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
            <p>Start your journey of giving back and making an impact today.</p>
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
                <input type="text" id="signup-name" className="form-input form-input-icon" placeholder="Enter your full name" value={form.name} onChange={setField('name')} autoComplete="name" />
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
                <label htmlFor="signup-phone">Phone Number</label>
                <input type="tel" id="signup-phone" className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={setField('phone')} />
              </div>
              <div className="form-group">
                <label htmlFor="signup-city">City</label>
                <input type="text" id="signup-city" className="form-input" placeholder="e.g. New Delhi" value={form.city} onChange={setField('city')} />
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
            <div className="form-group" style={{ backgroundColor: 'var(--color-bg-secondary)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <label className="checkbox-item" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-main)' }}>
                <input type="checkbox" id="signup-is-volunteer" checked={form.isVolunteer} onChange={setField('isVolunteer')} />
                Register as a Volunteer as well (creates a Volunteer Subprofile)
              </label>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 4, marginLeft: 24 }}>
                Enables volunteer badges, drives tracking, and hours logger in your profile.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-submit-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create My Account'}
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
