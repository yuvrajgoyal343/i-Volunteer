// Footer.jsx — Premium site footer with social links
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="site-logo" style={{ color: 'var(--color-white)', marginBottom: 'var(--space-2)', display: 'inline-flex' }}>
              <div className="logo-icon">iV</div>
              <span>iVolunteer</span>
            </Link>
            <p>Connecting generous donors with verified organisations across Chandigarh, Mohali, Panchkula & Punjab to deliver food, clothing, books, medicines, and essential items to those who need them most.</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              {[
                { label: 'Twitter', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
                { label: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01' },
                { label: 'GitHub', path: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' },
              ].map(({ label, path }) => (
                <a key={label} href="#" title={label} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  color: 'rgba(255,255,255,0.6)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; e.currentTarget.style.color = '#10B981'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                    {label === 'Instagram' && <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/donate">Donate Items</Link></li>
              <li><Link to="/volunteer">Volunteer</Link></li>
              <li><Link to="/organisations">Organisations</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/donate">Food</Link></li>
              <li><Link to="/donate">Clothes</Link></li>
              <li><Link to="/donate">Books</Link></li>
              <li><Link to="/donate">Medicines</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@ivolunteer.org">hello@ivolunteer.org</a></li>
              <li><Link to="/about">Contact Form</Link></li>
              <li><Link to="/login">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 iVolunteer. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
            Built with care for communities in Chandigarh & Punjab
          </p>
        </div>
      </div>
    </footer>
  );
}
