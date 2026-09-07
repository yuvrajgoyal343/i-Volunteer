// VolunteerPage.jsx — Volunteer registration and activities finder
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { volunteerActivities, activityTypeLabels } from '../appData';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function getActivityIcon(type) {
  const icons = {
    foodDrive: <svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    clothingDrive: <svg viewBox="0 0 24 24"><path d="M20.38 3.46L16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 1.88v15.34A2 2 0 0 0 4.26 22h15.48a2 2 0 0 0 1.98-1.32V5.34a2 2 0 0 0-1.34-1.88z"/></svg>,
    teaching: <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    elderCare: <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    cleanup: <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
  };
  return icons[type] || <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>;
}

export default function VolunteerPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    interests: ['foodDrive', 'clothingDrive'],
    availability: 'weekends',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filters for activities
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  const toggleInterest = (val) => {
    setForm(prev => {
      const current = prev.interests;
      const updated = current.includes(val)
        ? current.filter(item => item !== val)
        : [...current, val];
      return { ...prev, interests: updated };
    });
    setErrors(prev => ({ ...prev, interests: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your full name.';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email address.';
    if (!form.phone.trim()) errs.phone = 'Please enter a valid phone number.';
    if (form.interests.length === 0) errs.interests = 'Please select at least one area of interest.';
    if (!form.availability) errs.availability = 'Please select your availability.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSuccess('');

    try {
      if (user) {
        // If user is already logged in, update / activate their volunteer subprofile
        if (!user.isVolunteer) {
          await api.post('/volunteer/activate');
        }
        await api.put('/volunteer/profile', {
          availability: form.availability,
          interests: form.interests,
          skills: ['Community Support']
        });
        await refreshProfile();
        setSuccess('Thank you for volunteering! Your Volunteer Subprofile is now updated in your account.');
      } else {
        // If not logged in, prompt user or guide to signup
        setSuccess('Thank you for volunteering! Create an account or sign in to track your volunteer hours and badges.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered activities
  const filteredActivities = volunteerActivities.filter(a => {
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchLoc = !locationFilter || a.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchType && matchLoc;
  });

  return (
    <>
      <Header />

      <section className="page-header">
        <div className="container">
          <h1>Volunteer With Us</h1>
          <p>Give your time to causes that matter. Sign up and join upcoming drives and activities in your area.</p>
        </div>
      </section>

      <section className="page-content">
        <div className="container">

          {/* Volunteer Sign-Up Form */}
          <div className="form-page-layout" style={{ marginBottom: 'var(--space-16)' }}>
            <div className="form-wrapper">
              <h2>Sign Up as a Volunteer</h2>

              {success && (
                <div className="form-success visible" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                  <div>{success}</div>
                  {user ? (
                    <Link to="/profile" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-2)', display: 'inline-block' }}>
                      View My Volunteer Subprofile
                    </Link>
                  ) : (
                    <Link to="/signup" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-2)', display: 'inline-block' }}>
                      Create Account
                    </Link>
                  )}
                </div>
              )}

              <form id="volunteer-form" noValidate onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className={`form-group${errors.name ? ' has-error' : ''}`}>
                  <label htmlFor="vol-name">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="vol-name"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={e => {
                      setForm(prev => ({ ...prev, name: e.target.value }));
                      setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    required
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className={`form-group${errors.email ? ' has-error' : ''}`}>
                  <label htmlFor="vol-email">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    id="vol-email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => {
                      setForm(prev => ({ ...prev, email: e.target.value }));
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    required
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className={`form-group${errors.phone ? ' has-error' : ''}`}>
                  <label htmlFor="vol-phone">Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="vol-phone"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => {
                      setForm(prev => ({ ...prev, phone: e.target.value }));
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    required
                  />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>

                {/* Areas of Interest */}
                <div className={`form-group${errors.interests ? ' has-error' : ''}`}>
                  <label>Areas of Interest <span className="required">*</span></label>
                  <div className="checkbox-group">
                    {[
                      { val: 'foodDrive', label: 'Food Drives' },
                      { val: 'clothingDrive', label: 'Clothing Drives' },
                      { val: 'teaching', label: 'Teaching' },
                      { val: 'elderCare', label: 'Elder Care' },
                      { val: 'cleanup', label: 'Community Cleanup' }
                    ].map(({ val, label }) => (
                      <label className="checkbox-item" key={val}>
                        <input
                          type="checkbox"
                          name="interests"
                          value={val}
                          checked={form.interests.includes(val)}
                          onChange={() => toggleInterest(val)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  {errors.interests && <span className="form-error" style={{ display: 'block' }}>{errors.interests}</span>}
                </div>

                {/* Availability */}
                <div className={`form-group${errors.availability ? ' has-error' : ''}`}>
                  <label htmlFor="vol-availability">Availability <span className="required">*</span></label>
                  <select
                    id="vol-availability"
                    className="form-select"
                    value={form.availability}
                    onChange={e => {
                      setForm(prev => ({ ...prev, availability: e.target.value }));
                      setErrors(prev => ({ ...prev, availability: '' }));
                    }}
                    required
                  >
                    <option value="">Select your availability</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="both">Both Weekdays and Weekends</option>
                    <option value="flexible">Flexible</option>
                  </select>
                  {errors.availability && <span className="form-error">{errors.availability}</span>}
                </div>

                {/* Message */}
                <div className="form-group">
                  <label htmlFor="vol-message">Additional Message</label>
                  <textarea
                    id="vol-message"
                    className="form-textarea"
                    rows="3"
                    placeholder="Tell us about any prior volunteering experience or other details (optional)"
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Signing Up...' : 'Sign Up to Volunteer'}
                </button>
              </form>
            </div>
          </div>

          {/* Ongoing Activities Section */}
          <div className="section-header">
            <h2>Ongoing Activities and Drives</h2>
            <p>Browse upcoming volunteer opportunities. Filter by activity type or location to find what suits you.</p>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="form-group" style={{ marginBottom: 0, minWidth: 180 }}>
              <select
                id="activity-type-filter"
                className="form-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">All Activity Types</option>
                <option value="foodDrive">Food Drives</option>
                <option value="clothingDrive">Clothing Drives</option>
                <option value="teaching">Teaching</option>
                <option value="elderCare">Elder Care</option>
                <option value="cleanup">Community Cleanup</option>
              </select>
            </div>
            <div className="search-input-wrap" style={{ minWidth: 200 }}>
              <svg className="search-icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="activity-location-filter"
                className="form-input"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Activities Grid */}
          <div id="activities-grid" className="grid-3">
            {filteredActivities.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                <p>No activities match your filters.</p>
              </div>
            ) : (
              filteredActivities.map(activity => (
                <div className="card" key={activity.id}>
                  <div className="card-body">
                    <div className="card-icon-header">
                      {getActivityIcon(activity.type)}
                    </div>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                    <div className="card-meta">
                      <span className="card-meta-item">
                        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {activity.location}
                      </span>
                      <span className="card-meta-item">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {activity.date}
                      </span>
                    </div>
                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-category">{activityTypeLabels[activity.type] || activity.type}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {activity.spotsAvailable} spots available
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
