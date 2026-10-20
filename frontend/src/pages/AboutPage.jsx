// AboutPage.jsx — About Page with Verification Pipeline, Core Values & Direct Helpdesk
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const IMPACT_METRICS = [
  { val: '12', lbl: 'Verified Partner Homes & Missions' },
  { val: '12k+', lbl: 'Children, Elders & Families Supported' },
  { val: '₹0', lbl: 'Platform Fees (100% Free Doorstep Pickup)' },
  { val: '1,400+', lbl: 'Active Community Volunteers Enrolled' }
];

const VERIFICATION_STEPS = [
  { num: 1, color: '#059669', bg: 'var(--color-primary-bg)', text: 'var(--color-primary)', title: 'Legal & Tax Audit', desc: 'Verification of 12A/80G tax exemption certificates, state society registration under the Societies Act, and CWC (Child Welfare Committee) approvals.' },
  { num: 2, color: '#F59E0B', bg: 'var(--color-accent-bg)', text: 'var(--color-accent-dark)', title: 'On-Ground Inspection', desc: 'Our field coordinators conduct physical visits to inspect facility hygiene, resident welfare, storage conditions, and direct community utilization.' },
  { num: 3, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)', text: '#4F46E5', title: 'Continuous Delivery Receipts', desc: 'Donation deliveries are documented with date-stamped pickup proofs and annual re-verification to maintain list status.' }
];

const CORE_VALUES = [
  { title: 'Radical Transparency', desc: 'Every donor receives a unique pickup code and delivery confirmation. You always know where your items go.', icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { title: 'Dignity First', desc: 'We believe giving is a shared human connection, not charity from above. Items must be clean, wearable, and high quality.', icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { title: 'Hyper-Local Focus', desc: 'Solving local challenges in Chandigarh, Mohali, and Panchkula strengthens our own immediate neighborhood.', icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  { title: 'Zero Waste Culture', desc: 'Reallocating excess good clothing, extra textbooks, and surplus wedding food directly reduces environmental waste.', icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
];

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const validate = () => {
    const errs = {};
    if (!contactForm.name.trim()) errs.name = 'Please enter your name.';
    if (!contactForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) errs.email = 'Please enter a valid email address.';
    if (!contactForm.subject.trim()) errs.subject = 'Please specify the subject.';
    if (!contactForm.message.trim() || contactForm.message.trim().length < 10) errs.message = 'Message must contain at least 10 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSuccess('Thank you for reaching out! In this demo environment, your message has been logged. You can reach our team directly at support@ivolunteer.org.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSuccess(''), 6000);
  };

  const setField = (field) => (e) => {
    setContactForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <>
      <Header />
      <section className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="region-badge" style={{ margin: '0 auto var(--space-4)' }}>
            <span className="live-dot"></span>
            <span>Our Mission &amp; Transparent Verification • Chandigarh Tricity &amp; Punjab</span>
          </div>
          <h1>Connecting Compassion with <span className="gradient-text">Verified Need</span></h1>
          <p style={{ maxWidth: 720, margin: '0 auto var(--space-6)' }}>
            iVolunteer was founded to eliminate opacity in charity. We ensure every warm sweater, book, and meal reaches genuine orphanages, elderly shelters, and community langars across Chandigarh, Mohali, Panchkula, and Punjab.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            {['100% 3-Stage NGO Audit', 'No Cash Handouts • Items Only', 'Hyper-Local Ground Verification'].map(chip => (
              <div key={chip} className="hero-feature-chip"><span>{chip}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-content">
        <div className="container">
          {/* Mission & Key Philosophy Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
            <div>
              <span className="badge badge-verified" style={{ marginBottom: 'var(--space-3)' }}>The Philosophy</span>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', lineHeight: 1.2, marginBottom: 'var(--space-4)' }}>Why Physical Giving Changes Everything</h2>
              <p style={{ fontSize: 'var(--font-size-md)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                Too often, monetary donations get diluted by administrative overhead and uncertainty. iVolunteer completely shifts the paradigm: we deal exclusively in <strong>tangible essentials</strong> — food grains, textbooks, prescription medicines, warm winter clothing, and volunteer care hours.
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                Every donation submitted through our platform is routed to verified partners such as Tammana, Bal Niketan Panchkula, Tera Hi Tera mission, or Lions Club Old Age Home, where it is put directly into the hands of someone who needs it today.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Link to="/organisations" className="btn btn-primary btn-sm">View Verified Organisations →</Link>
                <Link to="/donate" className="btn btn-secondary btn-sm">Donate Essentials</Link>
              </div>
            </div>

            {/* Visual Stats Box */}
            <div style={{ background: 'var(--color-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', color: 'var(--color-white)', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ color: 'var(--color-white)', fontSize: '1.4rem', marginBottom: 'var(--space-6)' }}>Our Tricity Impact Snapshot</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                  {IMPACT_METRICS.map(m => (
                    <div key={m.lbl}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{m.val}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9, marginTop: 4 }}>{m.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>
          </div>

          {/* 3-Stage Verification Pipeline */}
          <div style={{ marginBottom: 'var(--space-16)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <span className="badge badge-verified" style={{ marginBottom: 'var(--space-2)' }}>The Trust Standard</span>
              <h2>How We Verify Every Organisation</h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                Every listed home undergoes a strict 3-tier audit before appearing in the directory.
              </p>
            </div>
            <div className="steps-flow" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
              {VERIFICATION_STEPS.map(s => (
                <div key={s.num} className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', borderTop: `4px solid ${s.color}` }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.bg, color: s.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: 'var(--space-4)' }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-2)' }}>{s.title}</h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Values Section */}
          <div style={{ marginBottom: 'var(--space-16)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <span className="badge badge-category" style={{ marginBottom: 'var(--space-2)' }}>Guiding Principles</span>
              <h2>Our Core Values</h2>
            </div>
            <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
              {CORE_VALUES.map(v => (
                <div key={v.title} className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}>
                    {v.icon}
                  </div>
                  <h4 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>{v.title}</h4>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Inquiries */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
            <div className="form-wrapper" style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', padding: 'var(--space-8)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>Get in Touch</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                Have questions or need assistance with a large donation pickup? Send us a message.
              </p>
              {success && (
                <div className="form-success visible" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                  ✓ {success}
                </div>
              )}
              <form id="contact-form" noValidate onSubmit={handleSubmit}>
                {[
                  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
                  { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                  { id: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Bulk Winter Cloth Drive / NGO Listing' }
                ].map(f => (
                  <div key={f.id} className={`form-group${errors[f.id] ? ' has-error' : ''}`}>
                    <label htmlFor={`contact-${f.id}`}>{f.label} <span className="required">*</span></label>
                    <input type={f.type} id={`contact-${f.id}`} className="form-input" placeholder={f.placeholder} value={contactForm[f.id]} onChange={setField(f.id)} required />
                    {errors[f.id] && <span className="form-error">{errors[f.id]}</span>}
                  </div>
                ))}
                <div className={`form-group${errors.message ? ' has-error' : ''}`}>
                  <label htmlFor="contact-message">Message <span className="required">*</span></label>
                  <textarea id="contact-message" className="form-textarea" rows="4" placeholder="Tell us how we can help..." value={contactForm.message} onChange={setField('message')} required></textarea>
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  Send Message →
                </button>
              </form>
            </div>

            {/* Helpdesk Contacts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { title: 'General Inquiries', desc: 'For questions about doorstep pickup coverage or drive volunteer guidelines.', email: 'support@ivolunteer.org' },
                { title: 'NGO Listing & Verification', desc: 'Run an orphanage, senior home, or charitable dispensary in Chandigarh Tricity or Punjab? Get audited and verified for listings.', email: 'partners@ivolunteer.org' }
              ].map(c => (
                <div key={c.title} className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-md)', marginBottom: 4 }}>{c.title}</h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{c.desc}</p>
                  <a href={`mailto:${c.email}`} style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{c.email}</a>
                </div>
              ))}
              <div style={{ background: 'var(--color-warning-bg)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: 4 }}>Important Donor Advisory</div>
                iVolunteer coordinates material goods (clothes, food grains, books, medicines) and volunteer service hours only. We do not solicit or process direct cash transfers or money wires.
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
