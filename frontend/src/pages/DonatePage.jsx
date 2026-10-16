// DonatePage.jsx — Donation Flow with Category Picker and Simple Form
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ngos } from '../appData';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const DONATION_TYPES = [
  {
    id: 'food',
    label: 'Food & Rations',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>
    ),
    desc: 'Atta, rice, pulses, fresh fruit, packaged dry ration kits',
    examples: 'Wheat flour, pulses, cooking oil'
  },
  {
    id: 'clothes',
    label: 'Clothes & Woollens',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
      </svg>
    ),
    desc: 'Winter jackets, warm sweaters, blankets, shoes, children wear',
    examples: 'Clean sweaters, coats, blankets'
  },
  {
    id: 'books',
    label: 'Books & Stationery',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    desc: 'School textbooks (CBSE/PSEB), notebooks, stationery kits',
    examples: 'Class 1-12 books, school supplies'
  },
  {
    id: 'medicines',
    label: 'Medicines & First Aid',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
        <path d="m8.5 8.5 7 7"></path>
      </svg>
    ),
    desc: 'Unopened prescription medicines, surgical supplies, bandages',
    examples: 'First aid kits, antiseptic, wheelchairs'
  },
  {
    id: 'other',
    label: 'Other Essentials',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.29 7 12 12.03 20.71 7"></polyline>
        <line x1="12" y1="22.5" x2="12" y2="12"></line>
      </svg>
    ),
    desc: 'Utensils, bedding, sports gear, hygiene kits, baby care',
    examples: 'Stainless steel utensils, hygiene sets'
  }
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

  // Pre-fill NGO from query parameter if provided
  useEffect(() => {
    const ngoParam = searchParams.get('ngo') || searchParams.get('id');
    if (ngoParam) {
      setForm(prev => ({ ...prev, ngoId: ngoParam }));
    }
  }, [searchParams]);

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
      alert('Please sign in or create an account to submit your donation request.');
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

      setSuccess(`Donation request submitted successfully! Pickup Reference: ${res.data.donationRef}`);
      setForm({
        type: 'food',
        description: '',
        quantity: '',
        pickupAddress: '',
        ngoId: ''
      });
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
      <section className="page-header">
        <div className="container">
          <div className="region-badge" style={{ margin: '0 auto var(--space-4)' }}>
            <span className="live-dot"></span>
            <span>Doorstep Pickup • Chandigarh Tricity &amp; Punjab</span>
          </div>

          <h1>
            Donate Essentials, <span className="gradient-text">Transform Lives</span>
          </h1>
          <p style={{ maxWidth: 680, margin: '0 auto var(--space-6)' }}>
            Transparent item donations. Pack your surplus clothes, dry rations, or books, and our verified volunteer partners will collect them from your door.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div className="hero-feature-chip">
              <span><strong>Free</strong> Doorstep Pickup</span>
            </div>
            <div className="hero-feature-chip">
              <span><strong>Verified</strong> Non-Profits Only</span>
            </div>
            <div className="hero-feature-chip">
              <span><strong>Direct</strong> Delivery</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-content">
        <div className="container">
          <div className="form-page-layout">

            {/* Donation Form Card */}
            <div className="form-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-xl)', margin: 0 }}>Schedule a Pickup</h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    Fill in item details and select an organisation
                  </p>
                </div>
                <span className="badge badge-verified">Direct Delivery</span>
              </div>

              {success && (
                <div className="form-success visible" role="alert" style={{ marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>&#x2713;</span>
                    <div>
                      <strong>Pickup Booked!</strong>
                      <p style={{ fontSize: 'var(--font-size-xs)', margin: '4px 0 0' }}>{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <form id="donation-form" noValidate onSubmit={handleSubmit}>

                {/* Category Selector */}
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
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: isSelected ? 'var(--color-primary-bg)' : 'var(--surface-card)',
                            cursor: 'pointer',
                            transition: 'border-color var(--transition-fast)'
                          }}
                        >
                          <span style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {cat.icon}
                          </span>
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

                {/* Pickup Address */}
                <div className={`form-group${errors.pickupAddress ? ' has-error' : ''}`}>
                  <label htmlFor="donation-address">
                    4. Doorstep Pickup Address (Tricity / Punjab) <span className="required">*</span>
                  </label>
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
                  {errors.pickupAddress && <span className="form-error">{errors.pickupAddress}</span>}
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

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
