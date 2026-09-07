// NotFoundPage.jsx — 404 error page with search and quick links
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
        padding: 'var(--space-16) 0',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-white) 100%)'
      }}>
        <div className="container">
          <div style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 'var(--space-2)'
          }}>
            404
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-main)',
            marginBottom: 'var(--space-4)'
          }}>
            Oops! Page Not Found
          </h1>
          <p style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-secondary)',
            maxWidth: 520,
            margin: '0 auto var(--space-8)',
            lineHeight: 'var(--line-height-relaxed)'
          }}>
            We could not find the page you were looking for. The URL might be misspelled, moved, or deleted. Let us get you back on track!
          </p>

          <div style={{ maxWidth: 480, margin: '0 auto var(--space-10)' }}>
            <div className="search-input-wrap">
              <svg className="search-icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-input"
                placeholder="Search organisations, drives, or pages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          <h3 style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)' }}>
            Popular Destinations
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            maxWidth: 800,
            margin: '0 auto'
          }}>
            {[
              {
                to: '/',
                icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                title: 'Homepage',
                sub: 'Return to iVolunteer home'
              },
              {
                to: '/donate',
                icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
                title: 'Donate Items',
                sub: 'Food, clothes, books & more'
              },
              {
                to: '/volunteer',
                icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
                title: 'Volunteer',
                sub: 'Join community drives'
              },
              {
                to: '/organisations',
                icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Organisations',
                sub: 'Verified NGOs & Homes'
              }
            ].map(({ to, icon, title, sub }) => (
              <Link
                key={title}
                to={to}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 'var(--space-6)',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  textDecoration: 'none',
                  color: 'var(--color-text-main)',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(27, 107, 74, 0.08)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-3)'
                }}>
                  {icon}
                </div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>
                  {title}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  {sub}
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
