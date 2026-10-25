// VolunteerPage.jsx — Premium Volunteer Hub for Chandigarh Tricity & Punjab
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { volunteerActivities } from '../appData';
import { useAuth } from '../context/useAuth';
import api from '../api';

const TYPE_CONFIG = {
  foodDrive: {
    label: 'Food Drive',
    badgeClass: 'badge-warning',
    color: '#F59E0B',
    lightBg: '#FFFBEB'
  },
  clothingDrive: {
    label: 'Clothing Drive',
    badgeClass: 'badge-category',
    color: '#059669',
    lightBg: '#ECFDF5'
  },
  teaching: {
    label: 'Teaching & Mentorship',
    badgeClass: 'badge-verified',
    color: '#6366F1',
    lightBg: '#EEF2FF'
  },
  elderCare: {
    label: 'Elder Care',
    badgeClass: 'badge-rose',
    color: '#F43F5E',
    lightBg: '#FFF1F2'
  },
  cleanup: {
    label: 'Eco Cleanup & Animal Care',
    badgeClass: 'badge-teal',
    color: '#0D9488',
    lightBg: '#F0FDFA'
  }
};

export default function VolunteerPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    interests: [],
    availability: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Filters for activities
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drive RSVP modal
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState('');

  // Pre-fill form when user loads asynchronously
  useEffect(() => {
    if (user) {
      // oxlint-disable-next-line react/set-state-in-effect
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        availability: user.volunteerSubProfile?.availability || prev.availability,
        interests: (user.volunteerSubProfile?.interests?.length) ? user.volunteerSubProfile.interests : prev.interests,
        message: user.volunteerSubProfile?.priorExperience || prev.message
      }));
    }
  }, [user]);

  // Handle modal scroll lock and Escape key
  useEffect(() => {
    if (!selectedDrive) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !rsvpSubmitting) setSelectedDrive(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDrive, rsvpSubmitting]);

  const isDriveRegistered = (drive) => {
    if (!user || !drive) return false;
    const upcoming = user.volunteerSubProfile?.upcomingDrives || [];
    const attended = user.volunteerSubProfile?.attendedDrives || [];
    return (
      upcoming.some(d => (drive.id && d.id === drive.id) || (drive.title && d.title === drive.title)) ||
      attended.some(d => (drive.id && d.driveId === drive.id) || (drive.title && d.driveTitle === drive.title))
    );
  };

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
        const customSkills = form.message
          ? form.message.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
          : [];
        const combinedSkills = customSkills.length ? customSkills : (user.volunteerSubProfile?.skills || ['Community Outreach']);

        // Update volunteer subprofile with user's selected interests and availability
        await api.put('/volunteer/profile', {
          availability: form.availability,
          interests: form.interests,
          skills: combinedSkills,
          priorExperience: form.message.trim()
        });

        // Save name, phone and availability
        await api.put('/profile', {
          name: form.name.trim(),
          phone: form.phone.trim(),
          isVolunteer: true,
          availability: form.availability,
          interests: form.interests,
          skills: combinedSkills
        });

        await refreshProfile();
        setSuccess('Awesome! Your volunteer profile is now active and updated.');
        setShowUpdateForm(false);
      } else {
        // Persist guest volunteer registration safely without duplicates
        try {
          const raw = localStorage.getItem('ivolunteer_guest_registrations');
          let guestVolunteers = [];
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) guestVolunteers = parsed;
            } catch {}
          }
          const emailLower = form.email.trim().toLowerCase();
          const existingIdx = guestVolunteers.findIndex(
            g => g.email && g.email.trim().toLowerCase() === emailLower
          );
          const guestRecord = {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            availability: form.availability,
            interests: form.interests,
            priorExperience: form.message.trim(),
            registeredAt: new Date().toISOString()
          };
          if (existingIdx !== -1) {
            guestVolunteers[existingIdx] = {
              ...guestVolunteers[existingIdx],
              ...guestRecord
            };
          } else {
            guestVolunteers.push(guestRecord);
          }
          localStorage.setItem('ivolunteer_guest_registrations', JSON.stringify(guestVolunteers));
          setSuccess(`Registration received for ${form.name}! Please sign in or create an account to view confirmed drives and service milestones.`);
        } catch {
          setSuccess(`Registration received for ${form.name}! Please sign in or create an account to view confirmed drives and service milestones.`);
        }
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
    setRsvpError('');
  };

  const confirmRsvp = async () => {
    if (!user) {
      alert('Please sign in or create an account to RSVP for volunteer drives!');
      navigate('/login');
      return;
    }

    if (isDriveRegistered(selectedDrive)) {
      setRsvpError('You have already confirmed attendance for this drive. You can view it in your profile.');
      return;
    }

    setRsvpSubmitting(true);
    setRsvpError('');

    try {
      await api.post('/volunteer/rsvp', { drive: selectedDrive });
      await refreshProfile();
      setRsvpSuccess(true);
      setTimeout(() => {
        setSelectedDrive(null);
        setRsvpSuccess(false);
        setRsvpError('');
      }, 2000);
    } catch (err) {
      setRsvpError(err.response?.data?.error || 'Failed to confirm RSVP. Please try again.');
    } finally {
      setRsvpSubmitting(false);
    }
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
          <h1>
            Give Your Time, <span className="gradient-text">Spark Real Change</span>
          </h1>
          <p style={{ maxWidth: 560, margin: '0 auto var(--space-8)' }}>
            Join volunteers across Chandigarh Tricity distributing meals, teaching children, and serving local communities.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div className="hero-feature-chip">
              <span><strong>8+</strong> Weekly Drives</span>
            </div>
            <div className="hero-feature-chip">
              <span><strong>1,400+</strong> Volunteers Joined</span>
            </div>
            <div className="hero-feature-chip">
              <span>Drive Tracking &amp; Badges</span>
            </div>
            <div className="hero-feature-chip">
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
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>Direct Grassroots Impact</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Work with verified homes like Bal Niketan, Tammana, and Tera Hi Tera in the Tricity.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', borderTop: '4px solid var(--color-accent)' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>Flexible Time Commitments</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Weekday or weekend — choose a schedule that works for you.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', borderTop: '4px solid var(--color-secondary-indigo)' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>Recognition &amp; Badges</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Earn milestone badges and build your social impact record.
              </p>
            </div>
          </div>

          {/* Volunteer Sign-Up Form or Active Volunteer Card */}
          <div className="form-page-layout" style={{ marginBottom: 'var(--space-16)', maxWidth: 840, margin: '0 auto var(--space-16)' }}>
            {user?.isVolunteer && !showUpdateForm ? (
              <div className="form-wrapper" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-8)' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--color-primary-bg, #ecfdf5)',
                  color: 'var(--color-primary, #059669)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-3)'
                }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>
                  You are already a volunteer
                </h2>

                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 480, margin: '0 auto var(--space-6)', fontSize: 'var(--font-size-md)' }}>
                  Your volunteer profile is active. Browse drives below, track your hours, or update your preferences.
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/profile" className="btn btn-primary btn-md">
                    View Volunteer Profile
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary btn-md"
                    onClick={() => setShowUpdateForm(true)}
                  >
                    Change Preferences
                  </button>
                  <a href="#community-drives" className="btn btn-ghost btn-md">
                    Explore Community Drives Below
                  </a>
                </div>
              </div>
            ) : (
              <div className="form-wrapper">
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="badge badge-verified" style={{ marginBottom: 'var(--space-2)' }}>
                      {user?.isVolunteer ? 'Update Volunteer Profile' : 'Quick Enrollment'}
                    </span>
                    {user?.isVolunteer && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowUpdateForm(false)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <h2 style={{ fontSize: 'var(--font-size-xl)' }}>
                    {user?.isVolunteer ? 'Update Your Causes & Availability' : 'Become an Active Volunteer'}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    Select the causes you wish to support and when you are available for community drives.
                  </p>
                </div>

              {success && (
                <div className="form-success visible" role="alert" style={{ marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <span>{success}</span>
                  </div>
                  {user ? (
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                      <Link to="/profile" className="btn btn-primary btn-sm">
                        View Volunteer Profile &amp; Badges
                      </Link>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                      <Link to="/signup" className="btn btn-primary btn-sm">
                        Create Free Account to Save Hours
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
                      { val: 'foodDrive', label: 'Food Drives' },
                      { val: 'clothingDrive', label: 'Winter Clothes' },
                      { val: 'teaching', label: 'Teaching Children' },
                      { val: 'elderCare', label: 'Elder Care' },
                      { val: 'cleanup', label: 'Eco & Animal Care' }
                    ].map(({ val, label }) => {
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
                            background: selected ? 'var(--color-primary-bg)' : 'var(--surface-card)',
                            color: selected ? 'var(--color-primary-dark)' : 'var(--color-text)',
                            fontWeight: selected ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: 'var(--font-size-sm)' }}>{label}</span>
                          {selected && (
                            <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 'bold' }}>&#x2713;</span>
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
                  {submitting ? 'Registering...' : 'Register as Tricity Volunteer'}
                </button>
              </form>
            </div>
            )}
          </div>

          {/* Ongoing Activities Section */}
          <div className="section-header" id="community-drives" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
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
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Drives' },
                { id: 'foodDrive', label: 'Food Drives' },
                { id: 'clothingDrive', label: 'Clothes' },
                { id: 'teaching', label: 'Teaching' },
                { id: 'elderCare', label: 'Elder Care' },
                { id: 'cleanup', label: 'Eco & Animal' }
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
                    background: activeCategory === cat.id ? 'var(--color-primary)' : 'var(--surface-card)',
                    color: activeCategory === cat.id ? 'var(--color-white)' : 'var(--color-text-secondary)',
                    fontWeight: activeCategory === cat.id ? 600 : 500,
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  {cat.label}
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
              filteredActivities.map((activity) => {
                const conf = TYPE_CONFIG[activity.type] || {
                  label: activity.type,
                  icon: '',
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
                      borderTop: `4px solid ${conf.color}`
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
                          <span><strong>Venue:</strong> {activity.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)' }}>
                          <span><strong>Schedule:</strong> {activity.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}>
                          <span><strong>Host:</strong> {activity.organiser}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        className={`btn btn-sm ${isDriveRegistered(activity) ? 'btn-ghost' : 'btn-primary'}`}
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleJoinDrive(activity)}
                      >
                        {isDriveRegistered(activity) ? 'Registered' : 'Join This Drive'}
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
          role="dialog"
          aria-modal="true"
          onClick={() => { if (!rsvpSubmitting) setSelectedDrive(null); }}
        >
          <div
            className="modal-card"
            style={{
              background: 'var(--surface-card)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: 500,
              width: '100%',
              padding: 'var(--space-8)',
              position: 'relative',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => { if (!rsvpSubmitting) setSelectedDrive(null); }}
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
                <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-primary)' }}>You&apos;re Confirmed!</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  Your spot has been registered! You can view this drive and track your volunteer hours directly in your profile.
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge-category" style={{ fontSize: 11 }}>
                    {TYPE_CONFIG[selectedDrive.type]?.label || selectedDrive.type}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', margin: '4px 0 0' }}>{selectedDrive.title}</h3>
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
                  <div><strong>Location:</strong> {selectedDrive.location}</div>
                  <div><strong>Timing:</strong> {selectedDrive.date}</div>
                  <div><strong>Lead Organiser:</strong> {selectedDrive.organiser}</div>
                  <div><strong>Capacity:</strong> {selectedDrive.spotsAvailable} spots remaining</div>
                </div>

                {rsvpError && (
                  <div style={{
                    marginBottom: 'var(--space-4)',
                    padding: '0.75rem 1rem',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-md)',
                    color: '#DC2626',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    {rsvpError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setSelectedDrive(null)}
                    disabled={rsvpSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 2, justifyContent: 'center' }}
                    onClick={confirmRsvp}
                    disabled={rsvpSubmitting || isDriveRegistered(selectedDrive)}
                  >
                    {rsvpSubmitting
                      ? 'Confirming RSVP...'
                      : isDriveRegistered(selectedDrive)
                      ? 'Already Registered'
                      : 'Confirm My Attendance'}
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
