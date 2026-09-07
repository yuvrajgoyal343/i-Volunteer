// VolunteerPage.jsx — Premium Volunteer Hub for Chandigarh Tricity & Punjab
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { volunteerActivities, activityTypeLabels } from '../appData';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const TYPE_CONFIG = {
  foodDrive: {
    label: 'Food Drive',
    icon: '🍲',
    badgeClass: 'badge-warning',
    color: '#F59E0B',
    lightBg: '#FFFBEB'
  },
  clothingDrive: {
    label: 'Clothing Drive',
    icon: '🧥',
    badgeClass: 'badge-category',
    color: '#059669',
    lightBg: '#ECFDF5'
  },
  teaching: {
    label: 'Teaching & Mentorship',
    icon: '📚',
    badgeClass: 'badge-verified',
    color: '#6366F1',
    lightBg: '#EEF2FF'
  },
  elderCare: {
    label: 'Elder Care',
    icon: '❤️',
    badgeClass: 'badge-rose',
    color: '#F43F5E',
    lightBg: '#FFF1F2'
  },
  cleanup: {
    label: 'Eco Cleanup & Animal Care',
    icon: '🌿',
    badgeClass: 'badge-teal',
    color: '#0D9488',
    lightBg: '#F0FDFA'
  }
};

export default function VolunteerPage() {
  const { user, refreshProfile } = useAuth();

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drive RSVP modal
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

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
    if (form.interests.length === 0) errs.interests = 'Select at least one area of interest.';
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
        if (!user.isVolunteer) {
          await api.post('/volunteer/activate');
        }
        await api.put('/volunteer/profile', {
          availability: form.availability,
          interests: form.interests,
          skills: ['Community Outreach & Logistics']
        });
        await refreshProfile();
        setSuccess('Awesome! Your Volunteer profile is now active with iVolunteer Chandigarh.');
      } else {
        setSuccess('Registration received! Create an account to log volunteer hours, earn badges, and receive drive reminder SMS.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinDrive = (activity) => {
    setSelectedDrive(activity);
    setRsvpSuccess(false);
  };

  const confirmRsvp = () => {
    setRsvpSuccess(true);
    setTimeout(() => {
      setSelectedDrive(null);
      setRsvpSuccess(false);
    }, 2200);
  };

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return volunteerActivities.filter(a => {
      const matchCat = activeCategory === 'all' || a.type === activeCategory;
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.organiser.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="live-region-badge" style={{ margin: '0 auto var(--space-4)' }}>
            <span className="live-dot pulse"></span>
            <span>Tricity Volunteer Network • Chandigarh, Mohali, Panchkula &amp; Punjab</span>
          </div>

          <h1>
            Give Your Time, <span className="hero-gradient-text">Spark Real Change</span>
          </h1>
          <p style={{ maxWidth: 700, margin: '0 auto var(--space-8)' }}>
            Join hundreds of dedicated Tricity volunteers distributing hot langar meals, teaching children, warming families in winter, and preserving local ecology.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div className="hero-feature-chip">
              <span style={{ fontSize: '1.2rem' }}>🌟</span>
              <span><strong>8+</strong> Weekly Drives</span>
            </div>
            <div className="hero-feature-chip">
              <span style={{ fontSize: '1.2rem' }}>🤝</span>
              <span><strong>1,200+</strong> Volunteers Joined</span>
            </div>
            <div className="hero-feature-chip">
              <span style={{ fontSize: '1.2rem' }}>📜</span>
              <span>Volunteer Hour Certificates</span>
            </div>
            <div className="hero-feature-chip">
              <span style={{ fontSize: '1.2rem' }}>📍</span>
              <span>Verified Local NGOs Only</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-content">
        <div className="container">

          {/* Value Props Row */}
          <div className="grid-3" style={{ marginBottom: 'var(--space-12)' }}>
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🎯</div>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>Direct Grassroots Impact</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Work directly alongside verified homes like Bal Niketan, Tammana, and Tera Hi Tera mission right here in the Tricity.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', borderTop: '4px solid var(--color-accent)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>⏱️</div>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>Flexible Time Commitments</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Whether you have 2 hours on Sunday morning or can coordinate weekday drives, there is a role designed for your schedule.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', borderTop: '4px solid var(--color-secondary-indigo)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🏅</div>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>Recognition &amp; Badges</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Track your hours, earn community milestone badges, and receive verified volunteering certificates for college and career portfolios.
              </p>
            </div>
          </div>

          {/* Volunteer Sign-Up Form Card */}
          <div className="form-page-layout" style={{ marginBottom: 'var(--space-16)', maxWidth: 840, margin: '0 auto var(--space-16)' }}>
            <div className="form-wrapper" style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 20px 40px -15px rgba(5, 150, 105, 0.08), 0 0 0 1px rgba(16, 185, 129, 0.08)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <span className="badge badge-verified" style={{ marginBottom: 'var(--space-2)' }}>Quick Enrollment</span>
                <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Become an Active Volunteer</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Join the volunteer WhatsApp &amp; SMS broadcast for upcoming Chandigarh Tricity drives.
                </p>
              </div>

              {success && (
                <div className="form-success visible" role="alert" style={{ marginBottom: 'var(--space-6)', animation: 'fadeIn 0.4s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem' }}>🎉</span>
                    <span>{success}</span>
                  </div>
                  {user ? (
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                      <Link to="/profile" className="btn btn-primary btn-sm">
                        View Volunteer Profile &amp; Badges →
                      </Link>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                      <Link to="/signup" className="btn btn-primary btn-sm">
                        Create Free Account to Save Hours →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form id="volunteer-form" noValidate onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                  {/* Full Name */}
                  <div className={`form-group${errors.name ? ' has-error' : ''}`}>
                    <label htmlFor="vol-name">Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      id="vol-name"
                      className="form-input"
                      placeholder="e.g. Amanpreet Singh"
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                  {/* Phone */}
                  <div className={`form-group${errors.phone ? ' has-error' : ''}`}>
                    <label htmlFor="vol-phone">Phone / WhatsApp <span className="required">*</span></label>
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

                  {/* Availability */}
                  <div className={`form-group${errors.availability ? ' has-error' : ''}`}>
                    <label htmlFor="vol-availability">Your Availability <span className="required">*</span></label>
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
                      <option value="weekends">Weekends Only (Sat / Sun)</option>
                      <option value="weekdays">Weekdays (Mon - Fri)</option>
                      <option value="both">Both Weekdays &amp; Weekends</option>
                      <option value="flexible">On-Call / Emergency Drives</option>
                    </select>
                    {errors.availability && <span className="form-error">{errors.availability}</span>}
                  </div>
                </div>

                {/* Areas of Interest */}
                <div className={`form-group${errors.interests ? ' has-error' : ''}`}>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                    Causes &amp; Activities You Wish to Support <span className="required">*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 'var(--space-2)' }}>
                    {[
                      { val: 'foodDrive', label: 'Food Drives', icon: '🍲' },
                      { val: 'clothingDrive', label: 'Winter Clothes', icon: '🧥' },
                      { val: 'teaching', label: 'Teaching Children', icon: '📚' },
                      { val: 'elderCare', label: 'Elder Care', icon: '❤️' },
                      { val: 'cleanup', label: 'Eco & Animal Care', icon: '🌿' }
                    ].map(({ val, label, icon }) => {
                      const selected = form.interests.includes(val);
                      return (
                        <button
                          type="button"
                          key={val}
                          onClick={() => toggleInterest(val)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: selected ? 'var(--color-primary-bg)' : 'var(--color-white)',
                            color: selected ? 'var(--color-primary-dark)' : 'var(--color-text)',
                            fontWeight: selected ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                          <span style={{ fontSize: 'var(--font-size-sm)' }}>{label}</span>
                          {selected && (
                            <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.interests && <span className="form-error" style={{ display: 'block', marginTop: 6 }}>{errors.interests}</span>}
                </div>

                {/* Message */}
                <div className="form-group">
                  <label htmlFor="vol-message">Prior Experience or Special Skills (Optional)</label>
                  <textarea
                    id="vol-message"
                    className="form-textarea"
                    rows="2"
                    placeholder="e.g. First Aid certified, driving licence, photography, teaching math..."
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={submitting}
                >
                  <span>{submitting ? 'Registering...' : 'Register as Tricity Volunteer'}</span>
                  <span>→</span>
                </button>
              </form>
            </div>
          </div>

          {/* Ongoing Activities Section */}
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div className="live-region-badge" style={{ margin: '0 auto var(--space-2)' }}>
              <span className="live-dot"></span>
              <span>Live Opportunities</span>
            </div>
            <h2>Upcoming Community Drives in Chandigarh &amp; Punjab</h2>
            <p style={{ maxWidth: 640, margin: '0 auto' }}>
              Explore confirmed volunteer drives happening this week. Click any drive to RSVP your spot.
            </p>
          </div>

          {/* Interactive Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-8)',
            padding: 'var(--space-4)',
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Drives', icon: '✨' },
                { id: 'foodDrive', label: 'Food Drives', icon: '🍲' },
                { id: 'clothingDrive', label: 'Clothes', icon: '🧥' },
                { id: 'teaching', label: 'Teaching', icon: '📚' },
                { id: 'elderCare', label: 'Elder Care', icon: '❤️' },
                { id: 'cleanup', label: 'Eco & Animal', icon: '🌿' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: activeCategory === cat.id ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: activeCategory === cat.id ? 'var(--color-primary-gradient)' : 'var(--color-white)',
                    color: activeCategory === cat.id ? 'var(--color-white)' : 'var(--color-text-secondary)',
                    fontWeight: activeCategory === cat.id ? 600 : 500,
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: activeCategory === cat.id ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none'
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="search-input-wrap" style={{ minWidth: 260 }}>
              <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-input"
                placeholder="Search drive, venue, or NGO..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 38, height: 38, fontSize: 'var(--font-size-sm)' }}
              />
            </div>
          </div>

          {/* Activities Grid */}
          <div id="activities-grid" className="grid-3">
            {filteredActivities.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1', padding: 'var(--space-12)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🔍</div>
                <h3>No drives found matching your criteria</h3>
                <p>Try clearing your search query or selecting "All Drives" to see all scheduled events.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 'var(--space-4)' }}
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredActivities.map((activity, idx) => {
                const conf = TYPE_CONFIG[activity.type] || {
                  label: activity.type,
                  icon: '🤝',
                  badgeClass: 'badge-category',
                  color: 'var(--color-primary)',
                  lightBg: 'var(--color-primary-bg)'
                };

                return (
                  <div
                    className="card activity-card"
                    key={activity.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-xl)',
                      borderTop: `4px solid ${conf.color}`,
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      animation: `fadeInUp 0.35s ease ${idx * 0.05}s both`
                    }}
                  >
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Card Header Top */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            background: conf.lightBg,
                            color: conf.color
                          }}
                        >
                          <span>{conf.icon}</span>
                          <span>{conf.label}</span>
                        </span>

                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                          {activity.spotsAvailable} spots left
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 style={{ fontSize: '1.15rem', lineHeight: 1.3, marginBottom: 'var(--space-2)' }}>
                        {activity.title}
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', flexGrow: 1, marginBottom: 'var(--space-4)' }}>
                        {activity.description}
                      </p>

                      {/* Meta Information Box */}
                      <div style={{
                        background: 'var(--color-bg)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-4)',
                        fontSize: 'var(--font-size-xs)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
                          <span style={{ color: 'var(--color-primary)' }}>📍</span>
                          <span><strong>Venue:</strong> {activity.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
                          <span style={{ color: 'var(--color-accent)' }}>📅</span>
                          <span><strong>Schedule:</strong> {activity.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}>
                          <span>🏛️</span>
                          <span><strong>Host:</strong> {activity.organiser}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleJoinDrive(activity)}
                      >
                        Join This Drive →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* RSVP Modal */}
      {selectedDrive && (
        <div
          className="modal-overlay visible"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)'
          }}
          onClick={() => setSelectedDrive(null)}
        >
          <div
            className="modal-card"
            style={{
              background: 'var(--color-white)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: 500,
              width: '100%',
              padding: 'var(--space-8)',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)',
              animation: 'modalPop 0.3s ease'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedDrive(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)'
              }}
            >
              ×
            </button>

            {rsvpSuccess ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-2)' }}>🎉</div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-primary)' }}>You're Confirmed!</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  A confirmation SMS &amp; drive briefing have been dispatched. See you at <strong>{selectedDrive.title}</strong>!
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.8rem' }}>
                    {TYPE_CONFIG[selectedDrive.type]?.icon || '🤝'}
                  </span>
                  <div>
                    <span className="badge badge-category" style={{ fontSize: 11 }}>
                      {TYPE_CONFIG[selectedDrive.type]?.label || selectedDrive.type}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', margin: '4px 0 0' }}>{selectedDrive.title}</h3>
                  </div>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  {selectedDrive.description}
                </p>

                <div style={{
                  background: 'var(--color-bg)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-6)',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <div>📍 <strong>Location:</strong> {selectedDrive.location}</div>
                  <div>📅 <strong>Timing:</strong> {selectedDrive.date}</div>
                  <div>🏛️ <strong>Lead Organiser:</strong> {selectedDrive.organiser}</div>
                  <div>👥 <strong>Capacity:</strong> {selectedDrive.spotsAvailable} spots remaining</div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setSelectedDrive(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 2, justifyContent: 'center' }}
                    onClick={confirmRsvp}
                  >
                    Confirm My Attendance ✓
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
