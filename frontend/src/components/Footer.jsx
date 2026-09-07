// Footer.jsx — Site footer
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
            <p>Connecting generous donors with verified organisations to deliver food, clothing, books, medicines, and essential items to those who need them most.</p>
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
          <p>2026 iVolunteer. All rights reserved.</p>
          <p>Built with care for communities in need.</p>
        </div>
      </div>
    </footer>
  );
}
