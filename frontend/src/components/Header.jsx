// Header.jsx — Site navigation with dynamic auth state
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  const isActive = (href) => {
    const filename = href.replace('/', '') || 'index';
    const current  = location.pathname.replace('/', '') || 'index';
    return current === filename || (filename === 'index' && current === '');
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="site-logo">
          <div className="logo-icon">iV</div>
          <span>iVolunteer</span>
        </Link>

        <button
          className={`menu-toggle${menuOpen ? ' open' : ''}`}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={`main-nav${menuOpen ? ' open' : ''}`} id="main-nav" ref={navRef}>
          {[
            { to: '/',              label: 'Home' },
            { to: '/donate',       label: 'Donate' },
            { to: '/volunteer',    label: 'Volunteer' },
            { to: '/organisations',label: 'Organisations' },
            { to: '/about',        label: 'About' },
          ].map(({ to, label }) => (
            <Link
              key={to} to={to}
              className={isActive(to) ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >{label}</Link>
          ))}

          <div className="header-cta">
            {user ? (
              <div className="header-user-menu">
                <Link
                  to="/profile"
                  className="header-profile-btn"
                  title="View Profile"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="header-avatar initials-avatar">{getInitials(user.name)}</div>
                  <span className="header-username">{user.name}</span>
                  {user.isVolunteer && <span className="user-vol-pill" title="Active Volunteer">Vol</span>}
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  title="Log Out"
                  onClick={handleLogout}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="header-login-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
            )}
            <Link to="/donate" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Donate Now</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
