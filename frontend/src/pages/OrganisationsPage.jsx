// OrganisationsPage.jsx — Verified organisations directory with interactive modal & filters
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ngos, categoryLabels } from '../appData';

function getCategoryColor(category) {
  const colors = {
    ngo: 'var(--color-primary)',
    orphanage: 'var(--color-accent)',
    oldAgeHome: '#6B5B95'
  };
  return colors[category] || 'var(--color-primary)';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function OrganisationsPage() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  // Check URL params on initial render
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearchTerm(urlSearch);

    const ngoIdParam = searchParams.get('ngo') || searchParams.get('id');
    if (ngoIdParam) {
      const found = ngos.find(n => n.id === parseInt(ngoIdParam));
      if (found) setSelectedNgo(found);
    }
  }, [searchParams]);

  // Geolocation detection for distance sorting
  const handleDistanceSort = () => {
    if (userCoords) {
      // Toggle off
      setUserCoords(null);
      return;
    }
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDistanceLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDistanceLoading(false);
      },
      () => {
        alert('Unable to retrieve your location for distance sorting.');
        setDistanceLoading(false);
      }
    );
  };

  // Filtered and sorted NGOs
  let filteredNgos = ngos.filter(ngo => {
    const matchCategory = activeCategory === 'all' || ngo.category === activeCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      ngo.name.toLowerCase().includes(term) ||
      ngo.city.toLowerCase().includes(term) ||
      ngo.address.toLowerCase().includes(term) ||
      (ngo.urgentNeeds && ngo.urgentNeeds.some(n => n.toLowerCase().includes(term)));
    return matchCategory && matchSearch;
  });

  if (userCoords) {
    filteredNgos = [...filteredNgos].sort((a, b) => {
      const distA = calculateDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
      const distB = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
      return distA - distB;
    });
  }

  return (
    <>
      <Header />

      <section className="page-header">
        <div className="container">
          <h1>Verified Organisations</h1>
          <p>All organisations on iVolunteer are verified for authenticity. Search by name, location, or category.</p>
        </div>
      </section>

      <section className="page-content">
        <div className="container">

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="search-input-wrap">
              <svg className="search-icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="ngo-search"
                className="form-input"
                placeholder="Search by name or city..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-pills" id="ngo-filters">
              {[
                { key: 'all', label: 'All' },
                { key: 'ngo', label: 'NGOs' },
                { key: 'orphanage', label: 'Orphanages' },
                { key: 'oldAgeHome', label: 'Old Age Homes' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`filter-pill${activeCategory === key ? ' active' : ''}`}
                  onClick={() => setActiveCategory(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              id="distance-sort-btn"
              className={`btn btn-ghost btn-sm${userCoords ? ' active' : ''}`}
              onClick={handleDistanceSort}
              disabled={distanceLoading}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {distanceLoading ? 'Detecting...' : userCoords ? 'Sorted by Distance (Active)' : 'Sort by Distance'}
            </button>
          </div>

          {/* NGO Grid */}
          <div id="ngo-grid" className="grid-3">
            {filteredNgos.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <p>No organisations found matching your search.</p>
              </div>
            ) : (
              filteredNgos.map(ngo => {
                const distStr = userCoords
                  ? `${Math.round(calculateDistance(userCoords.lat, userCoords.lng, ngo.lat, ngo.lng))} km away`
                  : null;

                return (
                  <div className="card ngo-interactive-card" key={ngo.id}>
                    <div className="card-image" style={{ position: 'relative' }}>
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        width: '100%', height: '100%', minHeight: 120,
                        background: `linear-gradient(135deg, ${getCategoryColor(ngo.category)} 0%, #0D3E2B 100%)`,
                        padding: 'var(--space-4)', textAlign: 'center'
                      }}>
                        <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-white)', letterSpacing: 1 }}>
                          {ngo.name.charAt(0)}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                          Est. {ngo.founded || '2015'}
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
                        <span className="badge badge-category">{categoryLabels[ngo.category] || ngo.category}</span>
                        {ngo.beneficiariesServed && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {ngo.beneficiariesServed}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>{ngo.description}</p>

                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <strong style={{ display: 'block', fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>
                          Urgent Needs:
                        </strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {ngo.urgentNeeds?.map((n, i) => (
                            <span key={i} className="badge" style={{ backgroundColor: '#FFF3E0', color: '#E65100', fontSize: 11 }}>
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
                        {distStr && (
                          <span className="card-meta-item">
                            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {distStr}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => setSelectedNgo(ngo)}
                        >
                          View Details &amp; Needs
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

      {/* Modal for Details & Needs */}
      {selectedNgo && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedNgo(null); }}>
          <div className="modal-card" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{selectedNgo.name}</h3>
                  {selectedNgo.verified && (
                    <span className="badge badge-verified">
                      <svg viewBox="0 0 24 24" width="12" height="12"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Verified
                    </span>
                  )}
                </div>
                <span className="badge badge-category" style={{ marginTop: 6, display: 'inline-block' }}>
                  {categoryLabels[selectedNgo.category] || selectedNgo.category}
                </span>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedNgo(null)}>&times;</button>
            </div>

            <div className="modal-body" style={{ fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>About Organisation</strong>
                <p style={{ marginTop: 4, lineHeight: 'var(--line-height-relaxed)' }}>{selectedNgo.description}</p>
              </div>

              {selectedNgo.impactHighlights && (
                <div className="alert alert-success" style={{ marginBottom: 0 }}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                  <span><strong>Impact Highlight:</strong> {selectedNgo.impactHighlights}</span>
                </div>
              )}

              <div>
                <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Urgent Item Requirements</strong>
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: 6 }}>
                  {selectedNgo.urgentNeeds?.map((need, idx) => (
                    <li key={idx} style={{ marginBottom: 4, fontWeight: 500, color: '#E65100' }}>• {need}</li>
                  )) || <li>• Food, clothes, books &amp; essential supplies</li>}
                </ul>
              </div>

              <div className="profile-grid" style={{ gap: 'var(--space-4)' }}>
                <div>
                  <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Address &amp; City</strong>
                  <p style={{ marginTop: 2 }}>{selectedNgo.address}, {selectedNgo.city}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Operating Hours</strong>
                  <p style={{ marginTop: 2 }}>{selectedNgo.operatingHours || '9:00 AM - 6:00 PM'}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Verification Audit</strong>
                  <p style={{ marginTop: 2, fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                    {selectedNgo.verificationDetails || 'Verified 2026'}
                  </p>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Direct Contact</strong>
                  <p style={{ marginTop: 2, fontSize: 'var(--font-size-xs)' }}>
                    {selectedNgo.contactPhone} | {selectedNgo.contactEmail}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <Link
                  to={`/donate?ngo=${selectedNgo.id}`}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, textAlign: 'center' }}
                  onClick={() => setSelectedNgo(null)}
                >
                  Donate Items to {selectedNgo.name.split(' ')[0]}
                </Link>
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setSelectedNgo(null)}>
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
