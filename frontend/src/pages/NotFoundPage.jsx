// NotFoundPage.jsx — Premium 404 page with floating illustration & quick navigation
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/organisations?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <>
      <Header />

      <section className="error-hero" style={{
        padding: 'var(--space-20) 0',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, var(--color-bg) 60%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Animated 404 Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: 'var(--font-size-xs)',
            marginBottom: 'var(--space-4)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}></span>
            <span>Error 404 • Page Not Found</span>
          </div>

          <div style={{
            fontSize: 'clamp(5rem, 14vw, 9rem)',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.04em',
            marginBottom: 'var(--space-2)'
          }}>
            404
          </div>

          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-4)'
          }}>
            Looks like this page took a detour
          </h1>

          <p style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-secondary)',
            maxWidth: 540,
            margin: '0 auto var(--space-8)',
            lineHeight: 'var(--line-height-relaxed)'
          }}>
            The link you followed might have moved or is temporarily unavailable. Let us help you find verified organisations, active drives, or schedule a doorstep donation.
          </p>

          {/* Quick Search */}
          <div style={{ maxWidth: 460, margin: '0 auto var(--space-10)' }}>
            <div className="search-input-wrap">
              <svg className="search-icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-input"
                placeholder="Search organisations, drives, or press Enter..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                style={{ height: 46, fontSize: 'var(--font-size-base)', paddingLeft: 42 }}
              />
            </div>
          </div>

          {/* Popular destinations grid */}
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <h3 style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recommended Destinations
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 'var(--space-4)'
            }}>
              {[
                {
                  to: '/',
                  icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  ),
                  title: 'Home',
                  sub: 'Return to main page'
                },
                {
                  to: '/donate',
                  icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  ),
                  title: 'Schedule Pickup',
                  sub: 'Food, clothes, books'
                },
                {
                  to: '/volunteer',
                  icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  ),
                  title: 'Volunteer Hub',
                  sub: 'Upcoming community drives'
                },
                {
                  to: '/organisations',
                  icon: (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                      <line x1="9" y1="6" x2="9" y2="6.01"/>
                      <line x1="15" y1="6" x2="15" y2="6.01"/>
                      <line x1="9" y1="10" x2="9" y2="10.01"/>
                      <line x1="15" y1="10" x2="15" y2="10.01"/>
                      <line x1="9" y1="14" x2="9" y2="14.01"/>
                      <line x1="15" y1="14" x2="15" y2="14.01"/>
                    </svg>
                  ),
                  title: 'Verified NGOs',
                  sub: 'Tricity & Punjab homes'
                }
              ].map(({ to, icon, title, sub }) => (
                <Link
                  key={title}
                  to={to}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-xl)',
                    textDecoration: 'none',
                    color: 'var(--color-text)',
                    transition: 'all 0.25s ease',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {sub}
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
