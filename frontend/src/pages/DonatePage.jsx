// DonatePage.jsx — Premium Donation Flow with Visual Category Picker & Multi-Stage Tracker
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ngos, donationTypeLabels, statusLabels } from '../appData';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const DONATION_TYPES = [
  {
    id: 'food',
    label: 'Food & Rations',
    icon: '🍲',
    desc: 'Atta, rice, pulses, fresh fruit, packaged dry ration kits',
    examples: 'Wheat flour, pulses, cooking oil'
  },
  {
    id: 'clothes',
    label: 'Clothes & Woollens',
    icon: '🧥',
    desc: 'Winter jackets, warm sweaters, blankets, shoes, children wear',
    examples: 'Clean sweaters, coats, blankets'
  },
  {
    id: 'books',
    label: 'Books & Stationery',
    icon: '📚',
    desc: 'School textbooks (CBSE/PSEB), notebooks, stationery kits',
    examples: 'Class 1-12 books, school supplies'
  },
  {
    id: 'medicines',
    label: 'Medicines & First Aid',
    icon: '💊',
    desc: 'Unopened prescription medicines, surgical supplies, bandages',
    examples: 'First aid kits, antiseptic, wheelchairs'
  },
  {
    id: 'other',
    label: 'Other Essentials',
    icon: '📦',
    desc: 'Utensils, bedding, sports gear, hygiene kits, baby care',
    examples: 'Stainless steel utensils, hygiene sets'
  }
];

const STATUS_STEPS = [
  { key: 'requested', label: 'Requested' },
  { key: 'verified', label: 'Verified' },
  { key: 'pickedUp', label: 'Picked Up' },
  { key: 'delivered', label: 'Delivered' }
];

export default function DonatePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: 'food',
    description: '',
    quantity: '',
    pickupAddress: '',
    ngoId: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locStatus, setLocStatus] = useState('');
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);

  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  // Pre-fill NGO from query parameter if provided
  useEffect(() => {
    const ngoParam = searchParams.get('ngo') || searchParams.get('id');
    if (ngoParam) {
      setForm(prev => ({ ...prev, ngoId: ngoParam }));
    }
  }, [searchParams]);

  // Load user donations if logged in
  const loadDonations = async () => {
    if (!user) return;
    setLoadingDonations(true);
    try {
      const res = await api.get('/donations');
      setDonations(res.data);
    } catch {
      setDonations([]);
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [user]);

  // Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLoc(true);
    setLocStatus('Detecting Chandigarh Tricity coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Check if near Chandigarh roughly (lat 30.6 - 30.8)
        let areaHint = 'Chandigarh Region';
        if (latitude > 30.70 && latitude < 30.77) areaHint = 'Chandigarh (UT)';
        else if (latitude <= 30.70 && longitude > 76.8) areaHint = 'Panchkula';
        else if (longitude < 76.73) areaHint = 'Mohali (SAS Nagar)';

        setForm(prev => ({
          ...prev,
          pickupAddress: `${areaHint} [Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}]`
        }));
        setLocStatus(`✓ Location set to ${areaHint} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setIsDetectingLoc(false);
        setErrors(prev => ({ ...prev, pickupAddress: '' }));
      },
      () => {
        setLocStatus('Could not retrieve GPS location. Please type your street / sector manually.');
        setIsDetectingLoc(false);
      },
      { timeout: 8000 }
    );
  };

  const validate = () => {
    const errs = {};
    if (!form.type) errs.type = 'Please select a donation category.';
    if (!form.description.trim() || form.description.trim().length < 5)
      errs.description = 'Please provide item details (at least 5 characters).';
    if (!form.quantity.trim()) errs.quantity = 'Please specify quantity / volume.';
    if (!form.pickupAddress.trim()) errs.pickupAddress = 'Please enter a pickup address in Tricity / Punjab.';
    if (!form.ngoId) errs.ngoId = 'Please select a beneficiary organisation.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!user) {
      alert('Please sign in or create an account to submit your donation request and track doorstep pickup!');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setSuccess('');
    try {
      const selectedNgo = ngos.find(n => n.id === parseInt(form.ngoId));
      const res = await api.post('/donations', {
        type: form.type,
        description: form.description.trim(),
        quantity: form.quantity.trim(),
        pickupAddress: form.pickupAddress.trim(),
        ngoId: selectedNgo ? selectedNgo.id : null,
        ngoName: selectedNgo ? selectedNgo.name : ''
      });

      setSuccess(`Donation request confirmed! Pickup Reference: ${res.data.donationRef}`);
      setForm({
        type: 'food',
        description: '',
        quantity: '',
        pickupAddress: '',
        ngoId: ''
      });
      loadDonations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit donation request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Selected NGO info preview
  const selectedNgoDetails = useMemo(() => {
    if (!form.ngoId) return null;
    return ngos.find(n => n.id === parseInt(form.ngoId));
  }, [form.ngoId]);

  return (
    <>
      <Header />

      {/* Hero Header */}
      <section className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="live-region-badge" style={{ margin: '0 auto var(--space-4)' }}>
            <span className="live-dot pulse"></span>
            <span>Free Doorstep Pickup • Chandigarh Tricity &amp; Punjab</span>
          </div>

          <h1>
            Donate Essentials, <span className="hero-gradient-text">Transform Lives</span>
          </h1>
          <p style={{ maxWidth: 680, margin: '0 auto var(--space-6)' }}>
            100% transparent item donations. Pack your surplus clothes, dry rations, or books, and our verified volunteer partners will collect them from your door.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div className="hero-feature-chip">
              <span>🚚</span>
              <span><strong>100% Free</strong> Doorstep Pickup</span>
            </div>
            <div className="hero-feature-chip">
              <span>🛡️</span>
              <span><strong>Verified</strong> Non-Profits Only</span>
            </div>
            <div className="hero-feature-chip">
              <span>📱</span>
              <span><strong>Real-Time</strong> Status Tracking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-content">
        <div className="container">
          <div className="form-page-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 'var(--space-8)', alignItems: 'start' }}>

            {/* Donation Form Card */}
            <div className="form-wrapper" style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 20px 40px -15px rgba(5, 150, 105, 0.08), 0 0 0 1px rgba(16, 185, 129, 0.06)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-xl)', margin: 0 }}>Schedule a Pickup</h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    Step 1 of 2: Item details &amp; destination
                  </p>
                </div>
                <span className="badge badge-verified">Direct Delivery</span>
              </div>

              {success && (
                <div className="form-success visible" role="alert" style={{ marginBottom: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                    <div>
                      <strong>Pickup Booked!</strong>
                      <p style={{ fontSize: 'var(--font-size-xs)', margin: '4px 0 0' }}>{success}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Link to="/profile" className="btn btn-primary btn-sm">
                      View Live Tracker in Profile →
                    </Link>
                  </div>
                </div>
              )}

              <form id="donation-form" noValidate onSubmit={handleSubmit}>

                {/* Visual Category Selector */}
                <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    1. Choose What You Wish to Donate <span className="required">*</span>
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: 'var(--space-2)'
                  }}>
                    {DONATION_TYPES.map(cat => {
                      const isSelected = form.type === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, type: cat.id }));
                            setErrors(prev => ({ ...prev, type: '' }));
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '12px 8px',
                            borderRadius: 'var(--radius-lg)',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: isSelected ? 'var(--color-primary-bg)' : 'var(--color-white)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(5, 150, 105, 0.15)' : 'none'
                          }}
                        >
                          <span style={{ fontSize: '1.8rem', marginBottom: 4 }}>{cat.icon}</span>
                          <span style={{
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text)'
                          }}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.type && <span className="form-error" style={{ display: 'block', marginTop: 6 }}>{errors.type}</span>}
                </div>

                {/* Item Description */}
                <div className={`form-group${errors.description ? ' has-error' : ''}`}>
                  <label htmlFor="donation-description">
                    2. Describe the Items <span className="required">*</span>
                  </label>
                  <textarea
                    id="donation-description"
                    className="form-textarea"
                    rows="3"
                    placeholder="e.g. 5 freshly cleaned woollen jackets, 2 blankets for children, 1 box of school notebooks..."
                    value={form.description}
                    onChange={e => {
                      setForm(prev => ({ ...prev, description: e.target.value }));
                      setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    required
                  ></textarea>
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>

                {/* Quantity */}
                <div className={`form-group${errors.quantity ? ' has-error' : ''}`}>
                  <label htmlFor="donation-quantity">
                    3. Estimated Quantity / Box Count <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="donation-quantity"
                    className="form-input"
                    placeholder="e.g. 2 cartons, approx 15 kg, 4 packets"
                    value={form.quantity}
                    onChange={e => {
                      setForm(prev => ({ ...prev, quantity: e.target.value }));
                      setErrors(prev => ({ ...prev, quantity: '' }));
                    }}
                    required
                  />
                  {errors.quantity && <span className="form-error">{errors.quantity}</span>}
                </div>

                {/* Pickup Address with Location Auto-detect */}
                <div className={`form-group${errors.pickupAddress ? ' has-error' : ''}`}>
                  <label htmlFor="donation-address">
                    4. Doorstep Pickup Address (Tricity / Punjab) <span className="required">*</span>
                  </label>
                  <div className="input-with-btn">
                    <input
                      type="text"
                      id="donation-address"
                      className="form-input"
                      placeholder="Flat/House No., Sector or Landmark, City (e.g. Sector 35-C, Chandigarh)"
                      value={form.pickupAddress}
                      onChange={e => {
                        setForm(prev => ({ ...prev, pickupAddress: e.target.value }));
                        setErrors(prev => ({ ...prev, pickupAddress: '' }));
                      }}
                      required
                    />
                    <button
                      type="button"
                      id="use-location-btn"
                      className="btn btn-ghost btn-sm"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLoc}
                      style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>📍</span>
                      <span>{isDetectingLoc ? 'Detecting...' : 'Auto-Detect'}</span>
                    </button>
                  </div>
                  {errors.pickupAddress && <span className="form-error">{errors.pickupAddress}</span>}
                  {locStatus && (
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: locStatus.startsWith('✓') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      marginTop: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <span>{locStatus}</span>
                    </div>
                  )}
                </div>

                {/* NGO Selection */}
                <div className={`form-group${errors.ngoId ? ' has-error' : ''}`}>
                  <label htmlFor="donation-ngo">
                    5. Select Verified Beneficiary Organisation <span className="required">*</span>
                  </label>
                  <select
                    id="donation-ngo"
                    className="form-select"
                    value={form.ngoId}
                    onChange={e => {
                      setForm(prev => ({ ...prev, ngoId: e.target.value }));
                      setErrors(prev => ({ ...prev, ngoId: '' }));
                    }}
                    required
                  >
                    <option value="">Choose an organisation in Chandigarh Tricity &amp; Punjab</option>
                    {ngos.map(ngo => (
                      <option key={ngo.id} value={ngo.id}>
                        {ngo.name} — {ngo.city} ({ngo.category.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  {errors.ngoId && <span className="form-error">{errors.ngoId}</span>}

                  {/* Selected NGO quick preview box */}
                  {selectedNgoDetails && (
                    <div style={{
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'var(--color-primary-bg)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-xs)',
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-start'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>🏛️</span>
                      <div>
                        <strong>{selectedNgoDetails.name}</strong> • {selectedNgoDetails.city}
                        <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
                          Urgent Needs: {selectedNgoDetails.urgentNeeds.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8, marginTop: 'var(--space-6)' }}
                  disabled={submitting}
                >
                  <span>{submitting ? 'Submitting Request...' : 'Confirm Doorstep Pickup Request'}</span>
                  <span>→</span>
                </button>
              </form>
            </div>

            {/* Donation Tracking Dashboard Column */}
            <div className="form-wrapper" style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>Live Pickup Tracker</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    Real-time status updates from our field team
                  </p>
                </div>
                <span className="live-dot pulse" title="Live Sync Active"></span>
              </div>

              {!user ? (
                <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>🔐</div>
                  <h4>Sign In to View Your Donations</h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Track previous donation deliveries and live volunteer pickups in real time.
                  </p>
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    Sign In to iVolunteer
                  </Link>
                </div>
              ) : loadingDonations ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <div className="spinner" style={{ margin: '0 auto var(--space-2)' }}></div>
                  <p style={{ fontSize: 'var(--font-size-sm)' }}>Fetching your pickup records...</p>
                </div>
              ) : donations.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-4)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>📦</div>
                  <h4>No Donations Logged Yet</h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Fill out the form on the left to schedule your first doorstep pickup in Chandigarh Tricity.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {donations.map(d => {
                    const typeObj = DONATION_TYPES.find(t => t.id === d.type) || { icon: '📦', label: d.type };
                    const isDelivered = d.status === 'delivered';
                    const isPickedUp = d.status === 'pickedUp';

                    return (
                      <div
                        className="card"
                        key={d.id}
                        style={{
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          border: isDelivered ? '1.5px solid #10B981' : '1px solid var(--color-border)',
                          background: isDelivered ? 'rgba(16, 185, 129, 0.02)' : 'var(--color-white)',
                          boxShadow: 'var(--shadow-xs)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.4rem' }}>{typeObj.icon}</span>
                            <div>
                              <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                                {d.description}
                              </strong>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                                Ref: <code>{d.donationRef}</code>
                              </div>
                            </div>
                          </div>
                          <span className={`badge dh-status-badge ${d.status}`}>
                            {statusLabels[d.status] || d.status}
                          </span>
                        </div>

                        {/* Progress Stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '12px 0 8px' }}>
                          {STATUS_STEPS.map((step, sIdx) => {
                            const active =
                              step.key === d.status ||
                              (d.status === 'delivered') ||
                              (d.status === 'pickedUp' && sIdx <= 2) ||
                              (sIdx === 0);

                            return (
                              <div key={step.key} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{
                                  height: 4,
                                  borderRadius: 2,
                                  background: active ? 'var(--color-primary)' : 'var(--color-border)',
                                  marginBottom: 4
                                }}></div>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: active ? 600 : 400,
                                  color: active ? 'var(--color-primary-dark)' : 'var(--color-text-tertiary)'
                                }}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                          background: 'var(--color-bg)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 4
                        }}>
                          <span>🏛️ {d.ngoName || 'Verified Partner'}</span>
                          <span>📦 {d.quantity}</span>
                          <span>📅 {d.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
