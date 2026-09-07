// ProfilePage.jsx — Real user profile from SQL backend, zero demo/hardcoded data
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { donationTypeLabels, statusLabels, activityTypeLabels } from '../appData';
import Header from '../components/Header';
import Footer from '../components/Footer';

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();

  const [activeTab,       setActiveTab]       = useState('overview');
  const [donations,       setDonations]       = useState([]);
  const [donationsLoading,setDonationsLoading]= useState(true);
  const [donationFilter,  setDonationFilter]  = useState('all');

  // Edit profile modal & tab
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm]           = useState({
    name: '',
    phone: '',
    city: '',
    bio: '',
    isVolunteer: false,
    availability: 'weekends'
  });
  const [editLoading, setEditLoading]     = useState(false);
  const [editError, setEditError]         = useState('');
  const [editSuccess, setEditSuccess]     = useState('');

  // Volunteer activate loading
  const [activatingVol, setActivatingVol] = useState(false);

  /* ── Fetch donations ── */
  const fetchDonations = useCallback(async () => {
    setDonationsLoading(true);
    try {
      const res = await api.get('/donations');
      setDonations(res.data);
    } catch {
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  /* ── Open edit modal ── */
  const openEdit = () => {
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
      isVolunteer: !!user.isVolunteer,
      availability: user.volunteerSubProfile?.availability || 'weekends'
    });
    setEditError('');
    setEditSuccess('');
    setShowEditModal(true);
  };

  /* ── Open edit tab ── */
  const openEditTab = () => {
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
      isVolunteer: !!user.isVolunteer,
      availability: user.volunteerSubProfile?.availability || 'weekends'
    });
    setEditError('');
    setEditSuccess('');
    setActiveTab('edit');
  };

  /* ── Save profile edit ── */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) { setEditError('Name is required.'); return; }
    setEditLoading(true);
    setEditError('');
    try {
      await api.put('/profile', editForm);
      await refreshProfile();
      setEditSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        if (activeTab === 'edit') {
          setActiveTab('overview');
        }
      }, 900);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Update failed. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  /* ── Activate volunteer subprofile ── */
  const activateVolunteer = async () => {
    setActivatingVol(true);
    try {
      await api.post('/volunteer/activate');
      await refreshProfile();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not activate volunteer profile.');
    } finally {
      setActivatingVol(false);
    }
  };

  /* ── Derived stats ── */
  const totalDonations  = donations.length;
  const deliveredItems  = donations.filter(d => d.status === 'delivered').length;
  const volSub          = user?.volunteerSubProfile;
  const volHours        = volSub?.hoursContributed ?? 0;
  const volDrives       = volSub?.drivesAttended   ?? 0;

  const filteredDonations = donationFilter === 'all'
    ? donations
    : donations.filter(d => d.status === donationFilter);

  if (!user) return null;

  return (
    <>
      <Header />

      {/* Profile Hero */}
      <section className="page-header profile-header-bg">
        <div className="container">
          <div className="profile-hero-card" id="profile-hero-card">
            <div className="profile-hero-layout">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar-lg initials-avatar">{getInitials(user.name)}</div>
              </div>
              <div className="profile-hero-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, color: 'var(--color-white)', fontSize: 'var(--font-size-2xl)' }}>{user.name}</h1>
                  {user.isVolunteer && (
                    <span className="hero-vol-badge">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      Active Volunteer
                    </span>
                  )}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4, marginBottom: 'var(--space-3)' }}>
                  {user.email}{user.city ? ` • ${user.city}` : ''}
                </p>
                <div className="hero-meta-row">
                  <span>
                    <svg viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Member since {user.joinedDate}
                  </span>
                </div>
              </div>

              {/* Edit Profile Action Button */}
              <div className="profile-hero-actions">
                <button
                  type="button"
                  className="btn btn-edit-profile"
                  onClick={openEdit}
                  title="Edit Profile"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="page-content">
        <div className="container">

          {/* Tabs */}
          <div className="profile-tabs-bar" role="tablist">
            <button className={`profile-tab-btn${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Overview &amp; Info
            </button>
            <button className={`profile-tab-btn${activeTab === 'donations' ? ' active' : ''}`} onClick={() => setActiveTab('donations')}>
              <svg viewBox="0 0 24 24" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              Donation History <span className="tab-badge">{totalDonations}</span>
            </button>
            <button className={`profile-tab-btn${activeTab === 'volunteer' ? ' active' : ''}`} onClick={() => setActiveTab('volunteer')}>
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              Volunteer Subprofile <span className={`tab-badge${user.isVolunteer ? ' badge-vol' : ''}`}>{user.isVolunteer ? 'Active' : 'Off'}</span>
            </button>
            <button className={`profile-tab-btn${activeTab === 'edit' ? ' active' : ''}`} onClick={openEditTab}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
          </div>

          {/* ─── TAB: OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <div className="profile-tab-content active">
              <div className="profile-grid">
                {/* Personal Info */}
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Personal Information</span>
                      <button type="button" className="btn btn-outline btn-sm" onClick={openEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit Profile
                      </button>
                    </h3>
                    <div className="profile-info-list">
                      {[
                        ['Full Name',        user.name        || '—'],
                        ['Email Address',    user.email       || '—'],
                        ['Phone Number',     user.phone       || '—'],
                        ['City / Location',  user.city        || '—'],
                        ['Volunteer Status', user.isVolunteer ? `Active Volunteer${volSub ? ` (${volSub.volunteerId})` : ''}` : 'Standard Member'],
                        ['Bio',              user.bio         || 'No bio added yet.'],
                      ].map(([label, val]) => (
                        <div className="info-row" key={label}>
                          <span className="info-label">{label}</span>
                          <span className="info-val">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Impact Summary */}
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Your Contribution Impact</h3>
                    <div className="profile-impact-grid">
                      <div className="impact-mini-card"><div className="impact-val">{totalDonations}</div><div className="impact-lbl">Total Donations</div></div>
                      <div className="impact-mini-card"><div className="impact-val">{deliveredItems}</div><div className="impact-lbl">Delivered Items</div></div>
                      <div className="impact-mini-card"><div className="impact-val">{volHours} hrs</div><div className="impact-lbl">Volunteered Hours</div></div>
                      <div className="impact-mini-card"><div className="impact-val">{volDrives}</div><div className="impact-lbl">Drives Attended</div></div>
                    </div>
                    <div className="cta-box-mini">
                      <p><strong>Want to make a new donation?</strong> Pick up requested food, clothing, books, or medicines.</p>
                      <Link to="/donate" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-2)', display: 'inline-block' }}>Make a Donation</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: DONATIONS ─── */}
          {activeTab === 'donations' && (
            <div className="profile-tab-content active">
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div>
                      <h2>Your Donation History</h2>
                      <p style={{ color: 'var(--color-text-secondary)' }}>Chronological record of all items you have donated on iVolunteer.</p>
                    </div>
                    <Link to="/donate" className="btn btn-primary btn-sm">+ New Donation Request</Link>
                  </div>

                  {/* Filter pills */}
                  <div className="filter-pills" style={{ marginBottom: 'var(--space-6)' }}>
                    {['all', 'requested', 'pickedUp', 'delivered'].map(s => (
                      <button
                        key={s}
                        className={`filter-pill${donationFilter === s ? ' active' : ''}`}
                        onClick={() => setDonationFilter(s)}
                      >
                        {s === 'all' ? 'All' : statusLabels[s]}
                      </button>
                    ))}
                  </div>

                  {/* Donation list */}
                  {donationsLoading ? (
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading donations…</p>
                  ) : filteredDonations.length === 0 ? (
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                      <p>{donationFilter === 'all' ? 'You have not made any donations yet.' : `No donations with status "${statusLabels[donationFilter] || donationFilter}".`}</p>
                      {donationFilter === 'all' && <Link to="/donate" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-4)' }}>Make Your First Donation</Link>}
                    </div>
                  ) : (
                    filteredDonations.map(d => (
                      <div className="donation-history-card" key={d.id}>
                        <div className={`dh-icon-col ${d.type}`}>{(donationTypeLabels[d.type] || d.type).charAt(0)}</div>
                        <div className="dh-main-col">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: 4 }}>
                            <h4 style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>{d.description}</h4>
                            <span className={`badge dh-status-badge ${d.status}`}>{statusLabels[d.status] || d.status}</span>
                          </div>
                          <div className="dh-meta-row">
                            <span><strong>Ref:</strong> {d.donationRef}</span> •&nbsp;
                            <span><strong>Qty:</strong> {d.quantity}</span> •&nbsp;
                            <span><strong>NGO:</strong> {d.ngoName || 'Verified NGO'}</span>
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                            Pickup: {d.pickupAddress} • Date: {d.date}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: VOLUNTEER ─── */}
          {activeTab === 'volunteer' && (
            <div className="profile-tab-content active">
              {!user.isVolunteer ? (
                /* Prompt to activate */
                <div className="card subprofile-prompt-card">
                  <div className="card-body text-center" style={{ padding: 'var(--space-12)' }}>
                    <div className="vol-prompt-icon">
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--color-primary)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <h2 style={{ marginBottom: 'var(--space-3)' }}>Activate Your Volunteer Subprofile</h2>
                    <p style={{ maxWidth: 540, margin: '0 auto var(--space-6)', color: 'var(--color-text-secondary)' }}>
                      When you choose to volunteer on iVolunteer, a dedicated <strong>Volunteer Subprofile</strong> is created inside your main profile. Track your volunteer hours, earn achievement badges, and participate in community drives!
                    </p>
                    <button type="button" className="btn btn-primary btn-lg" onClick={activateVolunteer} disabled={activatingVol}>
                      {activatingVol ? 'Activating…' : 'Activate Volunteer Subprofile Now'}
                    </button>
                  </div>
                </div>
              ) : volSub ? (
                /* Volunteer subprofile UI */
                <>
                  <div className="vol-subprofile-banner">
                    <div className="vol-sub-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <h2 style={{ margin: 0, color: 'var(--color-white)' }}>Volunteer Subprofile</h2>
                          <span className="vol-id-tag">{volSub.volunteerId}</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                          Status: {volSub.status} • Member since {volSub.joinedDate}
                        </p>
                      </div>
                      <Link to="/volunteer" className="btn btn-secondary btn-sm">Find New Drives</Link>
                    </div>
                  </div>

                  <div className="profile-grid" style={{ marginTop: 'var(--space-6)' }}>
                    {/* Left: Metrics + Badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                      <div className="card">
                        <div className="card-body">
                          <h3 style={{ marginBottom: 'var(--space-4)' }}>Volunteer Impact Metrics</h3>
                          <div className="profile-impact-grid">
                            <div className="impact-mini-card"><div className="impact-val" style={{ color: 'var(--color-primary)' }}>{volSub.hoursContributed}</div><div className="impact-lbl">Hours Contributed</div></div>
                            <div className="impact-mini-card"><div className="impact-val" style={{ color: 'var(--color-accent)' }}>{volSub.drivesAttended}</div><div className="impact-lbl">Drives Attended</div></div>
                            <div className="impact-mini-card"><div className="impact-val" style={{ color: '#6B5B95' }}>{volSub.badges?.length ?? 0}</div><div className="impact-lbl">Badges Unlocked</div></div>
                          </div>
                        </div>
                      </div>

                      {volSub.badges?.length > 0 && (
                        <div className="card">
                          <div className="card-body">
                            <h3 style={{ marginBottom: 'var(--space-4)' }}>Volunteer Badges &amp; Achievements</h3>
                            <div className="vol-badges-grid">
                              {volSub.badges.map((b, i) => (
                                <div className="vol-badge-card" key={i}>
                                  <div className="vol-badge-icon" style={{ color: 'var(--color-primary)' }}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                  </div>
                                  <div className="vol-badge-name">{b.name}</div>
                                  <div className="vol-badge-desc">{b.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Preferences + Drives */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                      <div className="card">
                        <div className="card-body">
                          <h3 style={{ marginBottom: 'var(--space-4)' }}>Preferences &amp; Skills</h3>
                          <div style={{ marginBottom: 'var(--space-4)' }}>
                            <strong style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Areas of Interest</strong>
                            <div>
                              {(volSub.interests || []).map(cat => (
                                <span key={cat} className="badge badge-category" style={{ marginRight: 6, marginBottom: 6 }}>{activityTypeLabels[cat] || cat}</span>
                              ))}
                              {(!volSub.interests || volSub.interests.length === 0) && <span style={{ color: 'var(--color-text-secondary)' }}>No interests added.</span>}
                            </div>
                          </div>
                          <div style={{ marginBottom: 'var(--space-4)' }}>
                            <strong style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Skills Offered</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {(volSub.skills || []).map(sk => (
                                <span key={sk} className="skill-tag">{sk}</span>
                              ))}
                              {(!volSub.skills || volSub.skills.length === 0) && <span style={{ color: 'var(--color-text-secondary)' }}>No skills added.</span>}
                            </div>
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Availability</strong>
                            <span style={{ fontWeight: 'var(--font-weight-medium)', textTransform: 'capitalize' }}>{volSub.availability || 'Weekends'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-body">
                          <h3 style={{ marginBottom: 'var(--space-4)' }}>Upcoming Registered Drives</h3>
                          {volSub.upcomingDrives?.length > 0 ? (
                            <div className="table-responsive">
                              <table className="custom-table">
                                <thead><tr><th>Drive</th><th>Date</th><th>Location</th><th>Status</th></tr></thead>
                                <tbody>
                                  {volSub.upcomingDrives.map((d, i) => (
                                    <tr key={i}>
                                      <td><strong>{d.title}</strong></td>
                                      <td>{d.date}</td>
                                      <td>{d.location}</td>
                                      <td><span className="badge badge-verified">{d.status}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                              No upcoming drives registered. <Link to="/volunteer">Browse available drives</Link>.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>Loading volunteer profile…</p>
              )}
            </div>
          )}

          {/* ─── TAB: EDIT PROFILE ─── */}
          {activeTab === 'edit' && (
            <div className="profile-tab-content active">
              <div className="card" style={{ maxWidth: '780px', margin: '0 auto' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>Edit Profile Details</h2>
                      <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0 0', fontSize: 'var(--font-size-sm)' }}>
                        Update your personal information, volunteer status, and contact preferences.
                      </p>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveTab('overview')}>
                      Cancel
                    </button>
                  </div>

                  {editError   && (
                    <div style={{ marginBottom: 'var(--space-4)', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: '#fee2e2', color: '#991b1b', fontSize: 'var(--font-size-sm)' }}>
                      {editError}
                    </div>
                  )}
                  {editSuccess && (
                    <div style={{ marginBottom: 'var(--space-4)', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: '#dcfce7', color: '#166534', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                      ✓ {editSuccess}
                    </div>
                  )}

                  <form onSubmit={handleEditSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                      <div className="form-group">
                        <label htmlFor="edit-tab-name">Full Name *</label>
                        <input
                          type="text"
                          id="edit-tab-name"
                          className="form-input"
                          required
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="edit-tab-email">Email Address</label>
                        <input
                          type="email"
                          id="edit-tab-email"
                          className="form-input"
                          disabled
                          value={user.email}
                          style={{ backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed', opacity: 0.85 }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px', display: 'block' }}>Email cannot be changed directly</span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="edit-tab-phone">Phone Number</label>
                        <input
                          type="tel"
                          id="edit-tab-phone"
                          className="form-input"
                          placeholder="+91 98765 43210"
                          value={editForm.phone}
                          onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="edit-tab-city">City / Location</label>
                        <input
                          type="text"
                          id="edit-tab-city"
                          className="form-input"
                          placeholder="e.g. Chandigarh, Mohali, Panchkula, Ludhiana"
                          value={editForm.city}
                          onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                      <label htmlFor="edit-tab-bio">Bio / About You</label>
                      <textarea
                        id="edit-tab-bio"
                        className="form-textarea"
                        rows="3"
                        placeholder="Tell the community about yourself and what causes you care about..."
                        value={editForm.bio}
                        onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      />
                    </div>

                    <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontWeight: 600, margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={editForm.isVolunteer}
                          onChange={e => setEditForm(f => ({ ...f, isVolunteer: e.target.checked }))}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                        />
                        <span>Active Volunteer Network Member</span>
                      </label>
                      <p style={{ margin: '4px 0 0 28px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        Enable this to receive alerts about local community food &amp; clothing distribution drives.
                      </p>

                      {editForm.isVolunteer && (
                        <div style={{ marginTop: 'var(--space-3)', marginLeft: '28px' }}>
                          <label htmlFor="edit-tab-avail" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                            Volunteer Availability:
                          </label>
                          <select
                            id="edit-tab-avail"
                            className="form-input"
                            style={{ maxWidth: '260px', padding: '6px 10px', fontSize: 'var(--font-size-sm)' }}
                            value={editForm.availability}
                            onChange={e => setEditForm(f => ({ ...f, availability: e.target.value }))}
                          >
                            <option value="weekends">Weekends Only</option>
                            <option value="weekdays">Weekdays</option>
                            <option value="flexible">Flexible / Any Time</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('overview')}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={editLoading}>
                        {editLoading ? 'Saving Changes…' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Profile Details</h3>
              <button type="button" className="modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            {editError   && (
              <div style={{ marginBottom: 'var(--space-3)', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: '#fee2e2', color: '#991b1b', fontSize: 'var(--font-size-sm)' }}>
                {editError}
              </div>
            )}
            {editSuccess && (
              <div style={{ marginBottom: 'var(--space-3)', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: '#dcfce7', color: '#166534', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                ✓ {editSuccess}
              </div>
            )}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-modal-name">Full Name *</label>
                <input
                  type="text"
                  id="edit-modal-name"
                  className="form-input"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-modal-email">Email Address</label>
                <input
                  type="email"
                  id="edit-modal-email"
                  className="form-input"
                  disabled
                  value={user.email}
                  style={{ backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed', opacity: 0.85 }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-modal-phone">Phone Number</label>
                <input
                  type="tel"
                  id="edit-modal-phone"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-modal-city">City / Location</label>
                <input
                  type="text"
                  id="edit-modal-city"
                  className="form-input"
                  placeholder="e.g. Chandigarh, Mohali, Panchkula, Ludhiana"
                  value={editForm.city}
                  onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-modal-bio">Short Bio</label>
                <textarea
                  id="edit-modal-bio"
                  className="form-textarea"
                  rows="3"
                  placeholder="Tell the community about yourself..."
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                />
              </div>

              <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontWeight: 600, margin: 0, fontSize: 'var(--font-size-sm)' }}>
                  <input
                    type="checkbox"
                    checked={editForm.isVolunteer}
                    onChange={e => setEditForm(f => ({ ...f, isVolunteer: e.target.checked }))}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>Active Volunteer Network Member</span>
                </label>

                {editForm.isVolunteer && (
                  <div style={{ marginTop: 'var(--space-2)', marginLeft: '24px' }}>
                    <label htmlFor="edit-modal-avail" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                      Availability:
                    </label>
                    <select
                      id="edit-modal-avail"
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                      value={editForm.availability}
                      onChange={e => setEditForm(f => ({ ...f, availability: e.target.value }))}
                    >
                      <option value="weekends">Weekends Only</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="flexible">Flexible / Any Time</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={editLoading}>
                  {editLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
