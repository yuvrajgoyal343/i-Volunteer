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

  // Edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm]           = useState({ name: '', phone: '', city: '', bio: '' });
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
    setEditForm({ name: user.name || '', phone: user.phone || '', city: user.city || '', bio: user.bio || '' });
    setEditError('');
    setEditSuccess('');
    setShowEditModal(true);
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
      setEditSuccess('Profile updated!');
      setTimeout(() => setShowEditModal(false), 800);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Update failed.');
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
                      <button type="button" className="btn btn-ghost btn-sm" onClick={openEdit}>Edit</button>
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
                                  <div className="vol-badge-icon">{b.icon}</div>
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
            {editError   && <p style={{ color: 'var(--color-error, #dc2626)', marginBottom: 8 }}>{editError}</p>}
            {editSuccess && <p style={{ color: 'var(--color-success, #16a34a)', marginBottom: 8 }}>{editSuccess}</p>}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-name">Full Name</label>
                <input type="text" id="edit-name" className="form-input" required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-phone">Phone Number</label>
                <input type="tel" id="edit-phone" className="form-input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-city">City</label>
                <input type="text" id="edit-city" className="form-input" value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-bio">Short Bio</label>
                <textarea id="edit-bio" className="form-textarea" rows="3" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={editLoading}>{editLoading ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
