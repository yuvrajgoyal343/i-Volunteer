// OrganisationsPage.jsx — Verified organisations directory with interactive modal & filters
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ngos, categoryLabels } from '../appData';

function getCategoryColor(category) {
  const colors = {
    ngo: '#059669',
    orphanage: '#D97706',
    oldAgeHome: '#6366F1'
  };
  return colors[category] || '#059669';
}

function getCategoryEmoji(category) {
  const emojis = {
    ngo: '🤝',
    orphanage: '🧒',
    oldAgeHome: '👴'
  };
  return emojis[category] || '🏢';
}

export default function OrganisationsPage() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLocation, setActiveLocation] = useState('all');
  const [selectedNgo, setSelectedNgo] = useState(null);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    // Keep directory filters synchronized when navigation changes URL params.
    // oxlint-disable-next-line react/set-state-in-effect
    setSearchTerm(urlSearch || '');
    const locParam = searchParams.get('location');
    // oxlint-disable-next-line react/set-state-in-effect
    setActiveLocation(locParam || 'all');
    const ngoIdParam = searchParams.get('ngo') || searchParams.get('id');
    const found = ngos.find(n => n.id === Number.parseInt(ngoIdParam, 10));
    // oxlint-disable-next-line react/set-state-in-effect
    setSelectedNgo(found || null);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedNgo) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedNgo(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNgo]);

  const filteredNgos = ngos.filter(ngo => {
    const matchCategory = activeCategory === 'all' || ngo.category === activeCategory;
    const cityLower = ngo.city.toLowerCase();
    const matchLocation =
      activeLocation === 'all' ||
      (activeLocation === 'chandigarh' && cityLower === 'chandigarh') ||
      (activeLocation === 'mohali' && cityLower === 'mohali') ||
      (activeLocation === 'panchkula' && cityLower === 'panchkula') ||
      (activeLocation === 'punjab' &&
        cityLower !== 'chandigarh' &&
        cityLower !== 'mohali' &&
        cityLower !== 'panchkula' &&
        (ngo.state?.toLowerCase().includes('punjab') || cityLower === 'ludhiana' || cityLower === 'amritsar'));
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      ngo.name.toLowerCase().includes(term) ||
      ngo.city.toLowerCase().includes(term) ||
      (ngo.state && ngo.state.toLowerCase().includes(term)) ||
      ngo.address.toLowerCase().includes(term) ||
      (ngo.urgentNeeds && ngo.urgentNeeds.some(n => n.toLowerCase().includes(term)));
    return matchCategory && matchLocation && matchSearch;
  });

  return (
    <>
      <Header />

      <section className="page-header">
        <div className="container">
          <div className="region-badge">
            <span className="live-dot"></span>
            <span>Verified Directory • Chandigarh Tricity &amp; Punjab</span>
          </div>
          <h1>Verified <span className="gradient-text">Organisations</span></h1>
          <p>Find genuine non-profit organisations, children homes, and elder care facilities near Chandigarh, Mohali, Panchkula, and across Punjab.</p>
        </div>
      </section>

      <section className="page-content">
        <div className="container">

          {/* Location / Region Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-5)', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginRight: 4 }}>
                Region:
              </span>
              {[
                { key: 'all', label: 'All Regions' },
                { key: 'chandigarh', label: 'Chandigarh' },
                { key: 'mohali', label: 'Mohali' },
                { key: 'panchkula', label: 'Panchkula' },
                { key: 'punjab', label: 'Rest of Punjab' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`filter-pill${activeLocation === key ? ' active' : ''}`}
                  style={{ fontSize: 'var(--font-size-xs)', padding: '4px 12px' }}
                  onClick={() => setActiveLocation(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', fontSize: 11, fontWeight: 700 }}>{filteredNgos.length}</span>
              verified organisation{filteredNgos.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="search-input-wrap">
              <svg className="search-icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text" id="ngo-search" className="form-input"
                placeholder="Search by name, sector, city, or need..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-pills" id="ngo-filters">
              {[
                { key: 'all', label: 'All Types' },
                { key: 'ngo', label: 'NGOs' },
                { key: 'orphanage', label: 'Orphanages' },
                { key: 'oldAgeHome', label: 'Old Age Homes' }
              ].map(({ key, label }) => (
                <button key={key} className={`filter-pill${activeCategory === key ? ' active' : ''}`}
                  onClick={() => setActiveCategory(key)}>{label}</button>
              ))}
            </div>
          </div>

          {/* NGO Grid */}
          <div id="ngo-grid" className="grid-3">
            {filteredNgos.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <p>No organisations found matching your filters in Chandigarh or Punjab.</p>
              </div>
            ) : (
              filteredNgos.map(ngo => {
                const color = getCategoryColor(ngo.category);

                return (
                  <div className="card ngo-interactive-card" key={ngo.id}>
                    <div className="card-image" style={{ position: 'relative' }}>
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        width: '100%', height: '100%', minHeight: 140,
                        background: color,
                        padding: 'var(--space-4)', textAlign: 'center', position: 'relative', overflow: 'hidden'
                      }}>
                        <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--color-white)', letterSpacing: 1, position: 'relative', zIndex: 1 }}>
                          {ngo.name.charAt(0)}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: 600, position: 'relative', zIndex: 1 }}>
                          Est. {ngo.founded || '2000'} • {ngo.city}
                        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <h3 style={{ marginBottom: 0, fontSize: 'var(--font-size-md)' }}>{ngo.name}</h3>
                        {ngo.verified && (
                          <span className="badge badge-verified" title={ngo.verificationDetails || 'Verified'}>
                            <svg viewBox="0 0 24 24" width="12" height="12"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Verified
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                        <span className="badge badge-category">
                          {getCategoryEmoji(ngo.category)} {categoryLabels[ngo.category] || ngo.category}
                        </span>
                        {ngo.beneficiariesServed && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {ngo.beneficiariesServed}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ngo.description}</p>

                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <strong style={{ display: 'block', fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>
                          Urgent Needs:
                        </strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {ngo.urgentNeeds?.slice(0, 4).map((n, i) => (
                            <span key={i} className="badge" style={{ background: '#FFF7ED', color: '#C2410C', fontSize: 11, border: '1px solid rgba(194,65,12,0.12)' }}>
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="card-meta" style={{ marginBottom: 'var(--space-4)' }}>
                        <span className="card-meta-item">
                          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {ngo.address}, {ngo.city}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
                        <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1 }}
                          onClick={() => setSelectedNgo(ngo)}>
                          View Details
                        </button>
                        <Link to={`/donate?ngo=${ngo.id}`} className="btn btn-secondary btn-sm" title={`Donate to ${ngo.name}`}>
                          Donate
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* Modal */}
      {selectedNgo && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ngo-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedNgo(null); }}
        >
          <div className="modal-card" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 id="ngo-modal-title" style={{ margin: 0 }}>{selectedNgo.name}</h3>
                  {selectedNgo.verified && (
                    <span className="badge badge-verified">
                      <svg viewBox="0 0 24 24" width="12" height="12"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Verified
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-category">
                    {getCategoryEmoji(selectedNgo.category)} {categoryLabels[selectedNgo.category] || selectedNgo.category}
                  </span>
                  <span className="badge" style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid rgba(3,105,161,0.12)' }}>
                    {selectedNgo.city}, {selectedNgo.state}
                  </span>
                </div>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedNgo(null)}>&times;</button>
            </div>

            <div className="modal-body" style={{ fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>About Organisation</strong>
                <p style={{ marginTop: 4, lineHeight: 'var(--line-height-relaxed)' }}>{selectedNgo.description}</p>
              </div>

              {selectedNgo.impactHighlights && (
                <div className="alert alert-success" style={{ marginBottom: 0 }}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                  <span><strong>Impact Highlight:</strong> {selectedNgo.impactHighlights}</span>
                </div>
              )}

              <div>
                <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Urgent Item Requirements</strong>
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: 6 }}>
                  {selectedNgo.urgentNeeds?.map((need, idx) => (
                    <li key={idx} style={{ marginBottom: 4, fontWeight: 500, color: '#C2410C', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316', flexShrink: 0 }}></span>
                      {need}
                    </li>
                  )) || <li>• Food, clothes, books &amp; essential supplies</li>}
                </ul>
              </div>

              <div className="profile-grid" style={{ gap: 'var(--space-4)' }}>
                <div>
                  <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address &amp; Location</strong>
                  <p style={{ marginTop: 2 }}>{selectedNgo.address}, {selectedNgo.city}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Operating Hours</strong>
                  <p style={{ marginTop: 2 }}>{selectedNgo.operatingHours || '9:00 AM - 6:00 PM'}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification</strong>
                  <p style={{ marginTop: 2, fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                    ✓ {selectedNgo.verificationDetails || 'Verified 2026'}
                  </p>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</strong>
                  <p style={{ marginTop: 2, fontSize: 'var(--font-size-xs)' }}>
                    {selectedNgo.contactPhone} | {selectedNgo.contactEmail}
                  </p>
                  {selectedNgo.website && (
                    <p style={{ marginTop: 4 }}>
                      <a href={selectedNgo.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>
                        Visit Official Website →
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <Link to={`/donate?ngo=${selectedNgo.id}`} className="btn btn-primary btn-lg"
                  style={{ flex: 1, textAlign: 'center' }} onClick={() => setSelectedNgo(null)}>
                  Donate to {selectedNgo.name || 'Organisation'}
                </Link>
                <button type="button" className="btn btn-ghost btn-lg" onClick={() => setSelectedNgo(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
