// DonatePage.jsx — Make donation request and track donations
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ngos, donationTypeLabels, statusLabels } from '../appData';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function DonatePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: '',
    description: '',
    quantity: '',
    pickupAddress: '',
    ngoId: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locStatus, setLocStatus] = useState('');
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
    setLocStatus('Detecting location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          pickupAddress: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }));
        setLocStatus('Location detected.');
        setErrors(prev => ({ ...prev, pickupAddress: '' }));
      },
      () => {
        setLocStatus('Unable to retrieve location. Please type manually.');
      }
    );
  };

  const validate = () => {
    const errs = {};
    if (!form.type) errs.type = 'Please select a donation type.';
    if (!form.description.trim() || form.description.trim().length < 5)
      errs.description = 'Please provide a description (at least 5 characters).';
    if (!form.quantity.trim()) errs.quantity = 'Please enter the quantity.';
    if (!form.pickupAddress.trim()) errs.pickupAddress = 'Please enter a valid pickup address.';
    if (!form.ngoId) errs.ngoId = 'Please select an organisation.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!user) {
      alert('Please sign in to submit a donation request so you can track it in your profile.');
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

      setSuccess(`Donation request submitted successfully! Ref: ${res.data.donationRef}`);
      setForm({
        type: '',
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

  return (
    <>
      <Header />

      <section className="page-header">
        <div className="container">
          <h1>Make a Donation</h1>
          <p>Fill in the details below and your items will be picked up and delivered to a verified organisation.</p>
        </div>
      </section>

      <section className="page-content">
        <div className="container">
          <div className="form-page-layout">

            {/* Donation Form */}
            <div className="form-wrapper">
              <h2>Donation Details</h2>

              {success && (
                <div className="form-success visible" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                  <div>{success}</div>
                  <Link to="/profile" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-2)', display: 'inline-block' }}>
                    View in My Profile
                  </Link>
                </div>
              )}

              <form id="donation-form" noValidate onSubmit={handleSubmit}>
                {/* Donation Type */}
                <div className={`form-group${errors.type ? ' has-error' : ''}`}>
                  <label htmlFor="donation-type">Donation Type <span className="required">*</span></label>
                  <select
                    id="donation-type"
                    className="form-select"
                    value={form.type}
                    onChange={e => {
                      setForm(prev => ({ ...prev, type: e.target.value }));
                      setErrors(prev => ({ ...prev, type: '' }));
                    }}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="food">Food</option>
                    <option value="clothes">Clothes</option>
                    <option value="books">Books</option>
                    <option value="medicines">Medicines</option>
                    <option value="other">Other Essentials</option>
                  </select>
                  {errors.type && <span className="form-error">{errors.type}</span>}
                </div>

                {/* Item Description */}
                <div className={`form-group${errors.description ? ' has-error' : ''}`}>
                  <label htmlFor="donation-desc">Item Description <span className="required">*</span></label>
                  <textarea
                    id="donation-desc"
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe the items you wish to donate (e.g. 10 kg rice, winter blankets, NCERT textbooks)"
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
                  <label htmlFor="donation-qty">Quantity <span className="required">*</span></label>
                  <input
                    type="text"
                    id="donation-qty"
                    className="form-input"
                    placeholder="e.g. 5 kg, 10 items, 20 books"
                    value={form.quantity}
                    onChange={e => {
                      setForm(prev => ({ ...prev, quantity: e.target.value }));
                      setErrors(prev => ({ ...prev, quantity: '' }));
                    }}
                    required
                  />
                  {errors.quantity && <span className="form-error">{errors.quantity}</span>}
                </div>

                {/* Pickup Address */}
                <div className={`form-group${errors.pickupAddress ? ' has-error' : ''}`}>
                  <label htmlFor="donation-address">Pickup Address <span className="required">*</span></label>
                  <div className="input-with-btn">
                    <input
                      type="text"
                      id="donation-address"
                      className="form-input"
                      placeholder="Enter your pickup address"
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
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Use My Location
                    </button>
                  </div>
                  {errors.pickupAddress && <span className="form-error">{errors.pickupAddress}</span>}
                  {locStatus && <div className="location-status" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginTop: 4 }}>{locStatus}</div>}
                </div>

                {/* NGO Selection */}
                <div className={`form-group${errors.ngoId ? ' has-error' : ''}`}>
                  <label htmlFor="donation-ngo">Select Organisation <span className="required">*</span></label>
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
                    <option value="">Choose a nearby organisation</option>
                    {ngos.map(ngo => (
                      <option key={ngo.id} value={ngo.id}>
                        {ngo.name} ({ngo.city})
                      </option>
                    ))}
                  </select>
                  {errors.ngoId && <span className="form-error">{errors.ngoId}</span>}
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Submitting Request...' : 'Submit Donation Request'}
                </button>
              </form>
            </div>

            {/* Donation Tracking Dashboard */}
            <div className="form-wrapper">
              <h2>Your Donations Tracker</h2>
              <p style={{ marginBottom: 'var(--space-6)' }}>
                {user ? 'Live status of your submitted donations.' : 'Sign in to see and track your submitted donations.'}
              </p>

              {!user ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  <p>Please <Link to="/login">sign in</Link> to view and track your donations.</p>
                </div>
              ) : loadingDonations ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading your donations...</p>
              ) : donations.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  <p>You haven't made any donations yet. Submit your first request using the form.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {donations.map(d => (
                    <div className="donation-history-card" key={d.id}>
                      <div className={`dh-icon-col ${d.type}`}>
                        {(donationTypeLabels[d.type] || d.type).charAt(0)}
                      </div>
                      <div className="dh-main-col">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: 4 }}>
                          <h4 style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>{d.description}</h4>
                          <span className={`badge dh-status-badge ${d.status}`}>
                            {statusLabels[d.status] || d.status}
                          </span>
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
                  ))}
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
