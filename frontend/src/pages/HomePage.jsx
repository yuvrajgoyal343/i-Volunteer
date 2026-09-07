// HomePage.jsx — Landing page
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Give What You Can. <span>Change a Life.</span></h1>
            <p>iVolunteer connects generous donors with verified NGOs, orphanages, and old-age homes. Donate essentials, volunteer your time, and see the impact you make.</p>
            <div className="hero-actions">
              <Link to="/donate" className="btn btn-primary btn-lg">Donate Now</Link>
              <Link to="/volunteer" className="btn btn-secondary btn-lg">Become a Volunteer</Link>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item">
                <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>All Organisations Verified</span>
              </div>
              <div className="hero-trust-item">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>18 Cities Across India</span>
              </div>
              <div className="hero-trust-item">
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>End-to-End Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>A simple, transparent process from your doorstep to the people who need it most.</p>
          </div>
          <div className="steps-flow">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Choose What to Donate</h3>
              <p>Select from food, clothes, books, medicines, or other essentials and fill in the details.</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Select a Verified Organisation</h3>
              <p>Pick a nearby NGO, orphanage, or old-age home. All organisations are verified for authenticity.</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Track Your Impact</h3>
              <p>Follow your donation from pickup to delivery. Know exactly where your contribution goes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Donate */}
      <section className="section" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header">
            <h2>What You Can Donate</h2>
            <p>Every item counts. Choose a category and make a difference today.</p>
          </div>
          <div className="categories-grid">
            {[
              { icon: <svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>, label: 'Food', desc: 'Cooked meals, grains, pulses, packaged food' },
              { icon: <svg viewBox="0 0 24 24"><path d="M20.38 3.46L16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 1.88v15.34A2 2 0 0 0 4.26 22h15.48a2 2 0 0 0 1.98-1.32V5.34a2 2 0 0 0-1.34-1.88z"/></svg>, label: 'Clothes', desc: 'Garments, blankets, shoes, uniforms' },
              { icon: <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, label: 'Books', desc: 'Textbooks, notebooks, stationery' },
              { icon: <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, label: 'Medicines', desc: 'OTC medicines, first-aid, medical supplies' },
              { icon: <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, label: 'Other Essentials', desc: 'Hygiene kits, bedding, utensils' },
            ].map(({ icon, label, desc }) => (
              <Link to="/donate" className="category-card" key={label}>
                <div className="category-icon">{icon}</div>
                <h3>{label}</h3>
                <p>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="section impact-section">
        <div className="container">
          <div className="section-header">
            <h2>The Impact So Far</h2>
            <p>Platform-wide network impact across verified partner organisations throughout India.</p>
          </div>
          <div className="impact-stats">
            {[
              { num: '2,400+', label: 'Donations Delivered' },
              { num: '85+',    label: 'Verified Organisations' },
              { num: '1,200+', label: 'Active Volunteers' },
              { num: '18',     label: 'Cities Covered' },
            ].map(({ num, label }) => (
              <div className="stat-item" key={label}>
                <div className="stat-number">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Collage */}
      <section className="homepage-collage-section">
        <div className="container">
          <div className="section-header">
            <h2>See Real Impact in Action</h2>
            <p>A glimpse into our on-ground food drives, clothing collections, library setups, and volunteer care visits.</p>
          </div>
          <div className="homepage-collage-grid">
            {[
              { src: '/images/hero_food.jpg',      alt: 'Community Food Bank Drive',   title: 'Community Food Drives',       sub: 'Distributing fresh meals & groceries' },
              { src: '/images/hero_clothes.jpg',   alt: 'Winter Clothes Collection',   title: 'Warmth Collection',           sub: 'Winter coats & clothing drives' },
              { src: '/images/hero_books.jpg',     alt: 'Books and Education Donation',title: 'Educational Kits',            sub: 'Books & stationery for orphanages' },
              { src: '/images/hero_volunteer.jpg', alt: 'Elder Care Volunteering',     title: 'Elder Care Companionship',    sub: 'Volunteers serving senior homes' },
            ].map(({ src, alt, title, sub }) => (
              <div className="collage-card" key={title}>
                <img src={src} alt={alt} />
                <div className="collage-overlay">
                  <div className="collage-title">{title}</div>
                  <div className="collage-sub">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center">
        <div className="container">
          <div className="section-header">
            <h2>Ready to Make a Difference?</h2>
            <p>Whether you have items to donate or time to volunteer, your contribution matters. Start today.</p>
          </div>
          <div className="hero-actions">
            <Link to="/donate" className="btn btn-primary btn-lg">Start Donating</Link>
            <Link to="/volunteer" className="btn btn-secondary btn-lg">Join as Volunteer</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
