// AboutPage.jsx — Mission, verification process, values, and contact form
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const validate = () => {
    const errs = {};
    if (!contactForm.name.trim()) errs.name = 'Please enter your name.';
    if (!contactForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email))
      errs.email = 'Please enter a valid email address.';
    if (!contactForm.subject.trim()) errs.subject = 'Please enter a subject.';
    if (!contactForm.message.trim() || contactForm.message.trim().length < 10)
      errs.message = 'Message must be at least 10 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSuccess('Thank you for reaching out. We will get back to you shortly.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <>
      <Header />

      <section className="page-header">
        <div className="container">
          <h1>About iVolunteer</h1>
          <p>Our mission, values, and commitment to transparent, impactful giving.</p>
        </div>
      </section>

      <section className="page-content">
        <div className="container">

          {/* Mission Section */}
          <div className="form-page-layout" style={{ maxWidth: 800, margin: '0 auto var(--space-16)' }}>
            <div>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>Our Mission</h2>
              <p style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-6)' }}>
                iVolunteer was built on a simple belief: everyone has something to give, and every contribution — no matter how small — can change a life. We bridge the gap between willing donors and verified organisations that serve the most vulnerable members of our communities.
              </p>
              <p style={{ marginBottom: 'var(--space-6)' }}>
                Whether it is a bag of rice for a family struggling with food insecurity, warm blankets for an orphanage in winter, or textbooks for a child who cannot afford them, iVolunteer makes it easy to give what you can and know exactly where it goes.
              </p>
              <p>
                We are not just a donation platform. We are a community of people who believe in showing up for each other — through donations, volunteering, and simply paying attention to the needs around us.
              </p>
            </div>
          </div>

          {/* How Verification Works */}
          <div style={{ maxWidth: 800, margin: '0 auto var(--space-16)' }}>
            <h2 style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>How We Verify Organisations</h2>

            <div className="steps-flow" style={{ marginBottom: 'var(--space-8)' }}>
              <div className="step-item">
                <div className="step-number">1</div>
                <h3>Application Review</h3>
                <p>Organisations submit their registration documents, tax exemption certificates, and operational details for review.</p>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <h3>On-Ground Check</h3>
                <p>Our team conducts physical visits to verify the organisation's operations, infrastructure, and community impact.</p>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <h3>Ongoing Monitoring</h3>
                <p>Verified organisations provide periodic reports. We track donation deliveries and collect feedback from beneficiaries.</p>
              </div>
            </div>

            <div className="alert alert-info">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Every organisation listed on iVolunteer carries a Verified badge, meaning it has passed all three stages of our verification process. We re-verify annually.</span>
            </div>
          </div>

          {/* Values Section */}
          <div style={{ maxWidth: 800, margin: '0 auto var(--space-16)' }}>
            <h2 style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>Our Values</h2>

            <div className="grid-3">
              <div className="card">
                <div className="card-body">
                  <div className="card-icon-header">
                    <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <h3>Transparency</h3>
                  <p>Every donation is tracked from pickup to delivery. Donors can see exactly where their contributions go.</p>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="card-icon-header">
                    <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <h3>Trust</h3>
                  <p>We only work with verified organisations. Our multi-step verification process ensures every partner is legitimate.</p>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="card-icon-header">
                    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3>Community</h3>
                  <p>We bring together donors, volunteers, and organisations to build a network of mutual support and shared purpose.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="two-col" style={{ maxWidth: 900, margin: '0 auto' }}>

            {/* Contact Form */}
            <div className="form-wrapper">
              <h2>Get in Touch</h2>

              {success && <div className="form-success visible" role="alert">{success}</div>}

              <form id="contact-form" noValidate onSubmit={handleSubmit}>
                <div className={`form-group${errors.name ? ' has-error' : ''}`}>
                  <label htmlFor="contact-name">Your Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="contact-name"
                    className="form-input"
                    placeholder="Full name"
                    value={contactForm.name}
                    onChange={e => {
                      setContactForm(prev => ({ ...prev, name: e.target.value }));
                      setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    required
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className={`form-group${errors.email ? ' has-error' : ''}`}>
                  <label htmlFor="contact-email">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    id="contact-email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={e => {
                      setContactForm(prev => ({ ...prev, email: e.target.value }));
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    required
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <div className={`form-group${errors.subject ? ' has-error' : ''}`}>
                  <label htmlFor="contact-subject">Subject <span className="required">*</span></label>
                  <input
                    type="text"
                    id="contact-subject"
                    className="form-input"
                    placeholder="What is this about?"
                    value={contactForm.subject}
                    onChange={e => {
                      setContactForm(prev => ({ ...prev, subject: e.target.value }));
                      setErrors(prev => ({ ...prev, subject: '' }));
                    }}
                    required
                  />
                  {errors.subject && <span className="form-error">{errors.subject}</span>}
                </div>

                <div className={`form-group${errors.message ? ' has-error' : ''}`}>
                  <label htmlFor="contact-message">Message <span className="required">*</span></label>
                  <textarea
                    id="contact-message"
                    className="form-textarea"
                    rows="5"
                    placeholder="Write your message here (minimum 10 characters)"
                    value={contactForm.message}
                    onChange={e => {
                      setContactForm(prev => ({ ...prev, message: e.target.value }));
                      setErrors(prev => ({ ...prev, message: '' }));
                    }}
                    required
                  ></textarea>
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 style={{ marginBottom: 'var(--space-6)' }}>Contact Information</h2>

              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>Email</h4>
                <p><a href="mailto:hello@ivolunteer.org" style={{ color: 'var(--color-primary)' }}>hello@ivolunteer.org</a></p>
              </div>

              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>For Organisations</h4>
                <p>If you run an NGO, orphanage, or old-age home and would like to be listed on iVolunteer, write to us at <a href="mailto:partners@ivolunteer.org" style={{ color: 'var(--color-primary)' }}>partners@ivolunteer.org</a> with your registration details.</p>
              </div>

              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>For Volunteers</h4>
                <p>Have questions about volunteering opportunities? Visit our <a href="/volunteer" style={{ color: 'var(--color-primary)' }}>Volunteer page</a> or email <a href="mailto:volunteer@ivolunteer.org" style={{ color: 'var(--color-primary)' }}>volunteer@ivolunteer.org</a>.</p>
              </div>

              <div className="alert alert-warning">
                <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>iVolunteer does not accept monetary donations. We only facilitate the donation of physical items (food, clothes, books, medicines, and essentials).</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
