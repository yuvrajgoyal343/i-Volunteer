// CertificateModal.jsx — Verifiable Volunteer Certificate Generator
// Displays an authentic, framed certificate and exports high-resolution PNG / printable PDF
import { useRef, useEffect, useCallback, useState } from 'react';

function createCertificateId() {
  return `IVOL-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function CertificateModal({ isOpen, onClose, certificateData }) {
  const canvasRef = useRef(null);
  const [fallbackCertId] = useState(createCertificateId);

  const {
    volunteerName = 'Dedicated Volunteer',
    volunteerId = 'VOL-2026-1042',
    driveTitle = 'Community Service & Rations Drive',
    organizer = 'iVolunteer Social Welfare Network',
    location = 'Chandigarh Tricity',
    hours = 4,
    date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    certId = fallbackCertId
  } = certificateData || {};

  // Render high-resolution canvas for PNG export
  const renderToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D rendering is unavailable.');
      const width = 1600;
      const height = 1130;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Parchment
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FCFBF7');
      bgGrad.addColorStop(0.5, '#F7F4EA');
      bgGrad.addColorStop(1, '#EFEAD8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Outer Ornate Border
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 14;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // Inner Thin Gold Line
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.strokeRect(54, 54, width - 108, height - 108);

      // Corner Ornaments
      const drawCorner = (x, y, flipX, flipY) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 50);
        ctx.lineTo(10, 10);
        ctx.lineTo(50, 10);
        ctx.stroke();

        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(22, 22, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCorner(54, 54, false, false);
      drawCorner(width - 54, 54, true, false);
      drawCorner(54, height - 54, false, true);
      drawCorner(width - 54, height - 54, true, true);

      // 3. Header Branding
      ctx.textAlign = 'center';
      ctx.fillStyle = '#064E3B';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('IVOLUNTEER TRICITY & PUNJAB', width / 2, 130);

      ctx.fillStyle = '#64748B';
      ctx.font = '500 16px sans-serif';
      ctx.fillText('NON-PROFIT GRASSROOTS SOCIAL WELFARE & DONATION NETWORK', width / 2, 160);

      // Horizontal Accent Line
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 220, 185);
      ctx.lineTo(width / 2 + 220, 185);
      ctx.stroke();

      // 4. Certificate Title
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 50px serif';
      ctx.fillText('CERTIFICATE OF APPRECIATION', width / 2, 260);

      ctx.fillStyle = '#B45309';
      ctx.font = 'italic 600 24px serif';
      ctx.fillText('For Exceptional Voluntary Service & Community Impact', width / 2, 305);

      // 5. Presentation Text
      ctx.fillStyle = '#475569';
      ctx.font = '400 20px sans-serif';
      ctx.fillText('THIS CERTIFICATE IS PROUDLY CONFERRED UPON', width / 2, 380);

      // Volunteer Name (Hero)
      ctx.fillStyle = '#064E3B';
      ctx.font = 'bold 56px serif';
      ctx.fillText(volunteerName, width / 2, 455);

      // Volunteer ID & Recognition Text
      ctx.fillStyle = '#64748B';
      ctx.font = '600 16px sans-serif';
      ctx.fillText(`Registered Volunteer ID: ${volunteerId}`, width / 2, 490);

      ctx.fillStyle = '#334155';
      ctx.font = '400 22px serif';
      ctx.fillText(
        'in grateful recognition of selfless community support and active participation in',
        width / 2,
        560
      );

      // Drive Title
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`"${driveTitle}"`, width / 2, 620);

      // Details Grid (Hours, Organizer, Location)
      ctx.fillStyle = '#475569';
      ctx.font = '500 21px sans-serif';
      ctx.fillText(
        `Contributing ${hours} Hours of Service • Hosted by ${organizer}`,
        width / 2,
        670
      );

      ctx.font = '400 18px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`Conducted at: ${location}`, width / 2, 705);

      // 6. Gold Embossed Seal (Bottom Center)
      const sealX = width / 2;
      const sealY = 850;
      const sealRadius = 75;

      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#996515';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealRadius - 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealRadius - 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('★ VERIFIED VOLUNTEER ★', sealX, sealY - 14);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('iVOLUNTEER', sealX, sealY + 6);
      ctx.font = '600 12px sans-serif';
      ctx.fillText('TRICITY • 2026', sealX, sealY + 24);

      // 7. Signatures
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(180, 890);
      ctx.lineTo(440, 890);
      ctx.stroke();

      ctx.fillStyle = '#1E293B';
      ctx.font = 'italic 30px cursive';
      ctx.fillText('Harpreet Singh', 310, 875);

      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Dr. Harpreet Singh, MD', 310, 920);
      ctx.font = '400 14px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Director, Volunteer Operations', 310, 942);

      // Right Signature
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width - 440, 890);
      ctx.lineTo(width - 180, 890);
      ctx.stroke();

      ctx.fillStyle = '#1E293B';
      ctx.font = 'italic 30px cursive';
      ctx.fillText('Simranjit Kaur', width - 310, 875);

      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Simranjit Kaur', width - 310, 920);
      ctx.font = '400 14px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Lead Coordinator, Tricity Outreach', width - 310, 942);

      // 8. Footer Verification Code & Date
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 14px monospace';
      ctx.fillText(`Date Issued: ${date}   •   Verification Record ID: ${certId}`, width / 2, 1040);
    } catch (err) {
      console.warn('Canvas render fallback:', err);
    }
  }, [
    certId,
    date,
    driveTitle,
    hours,
    location,
    organizer,
    volunteerId,
    volunteerName
  ]);

  useEffect(() => {
    if (isOpen) {
      const timeoutId = window.setTimeout(renderToCanvas, 80);
      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen, renderToCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      renderToCanvas();
      const sanitizedTitle = driveTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const sanitizedName = volunteerName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `iVolunteer_Certificate_${sanitizedName}_${sanitizedTitle}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch {
      alert('Downloading certificate... Use Print / Save PDF if download is blocked by browser.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !certificateData) return null;

  return (
    <div
      className="modal-overlay visible"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 17, 32, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card certificate-modal-box"
        style={{
          maxWidth: 880,
          width: '100%',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--surface-card, #151E2E)',
          color: 'var(--color-text, #F8FAFC)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          border: '1px solid var(--color-border)',
          position: 'relative',
          maxHeight: '94vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>🎓</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Certificate of Appreciation</h3>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                Official Verification Record: <strong>{certId}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 26,
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: '0 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Certificate Visual Presentation (Framed Canvas + Elegant HTML Preview) */}
        <div
          className="certificate-frame"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #FCFBF7 0%, #F7F4EA 50%, #EFEAD8 100%)',
            border: '8px solid #B8860B',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6) var(--space-8)',
            color: '#1E293B',
            textAlign: 'center',
            boxShadow: 'inset 0 0 30px rgba(184, 134, 11, 0.2), 0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          {/* Inner gold border */}
          <div
            style={{
              position: 'absolute',
              inset: 8,
              border: '2px solid #D4AF37',
              pointerEvents: 'none',
              borderRadius: 'inherit'
            }}
          />

          {/* Org Header */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: '#064E3B', textTransform: 'uppercase' }}>
              iVolunteer Tricity &amp; Punjab
            </span>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: 1 }}>
              NON-PROFIT GRASSROOTS SOCIAL WELFARE NETWORK
            </div>
          </div>

          <div style={{ width: 120, height: 2, background: '#D4AF37', margin: '6px auto var(--space-3)' }} />

          {/* Title */}
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0', fontFamily: 'serif', letterSpacing: -0.5 }}>
            CERTIFICATE OF APPRECIATION
          </h2>
          <div style={{ fontStyle: 'italic', color: '#B45309', fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-4)' }}>
            For Exceptional Voluntary Service &amp; Community Impact
          </div>

          <p style={{ fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
            This certificate is proudly conferred upon
          </p>

          {/* Volunteer Name */}
          <div style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)', fontWeight: 800, color: '#064E3B', fontFamily: 'serif', margin: '4px 0 2px 0' }}>
            {volunteerName}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
            Volunteer ID: {volunteerId}
          </div>

          <p style={{ fontSize: 13, color: '#334155', maxWidth: 540, margin: '0 auto 6px auto', lineHeight: 1.4 }}>
            in grateful recognition of selfless service and active participation in the community drive:
          </p>

          {/* Drive Title */}
          <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', fontWeight: 700, color: '#047857', margin: '4px 0' }}>
            &ldquo;{driveTitle}&rdquo;
          </div>

          {/* Metric Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FDE68A', padding: '4px 14px', borderRadius: 20, margin: '6px 0 16px 0', fontSize: 12, color: '#92400E', fontWeight: 700 }}>
            <span>⭐ {hours} Hours Contributed</span>
            <span>•</span>
            <span>{organizer}</span>
          </div>

          {/* Signatures & Seal Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
            {/* Left signature */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'cursive', fontSize: 18, color: '#1E293B', marginBottom: 2 }}>
                Harpreet Singh
              </div>
              <div style={{ height: 1.5, background: '#1E293B', width: 140, margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: 11, fontWeight: 700 }}>Dr. Harpreet Singh, MD</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Director, Volunteer Operations</div>
            </div>

            {/* Gold Seal Emblem */}
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D4AF37 50%, #B45309 100%)',
                border: '3px solid #996515',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(184, 134, 11, 0.4)',
                textAlign: 'center',
                padding: 4
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>★ VERIFIED ★</span>
              <span style={{ fontSize: 11, fontWeight: 800 }}>iVOLUNTEER</span>
              <span style={{ fontSize: 8, fontWeight: 700 }}>TRICITY</span>
            </div>

            {/* Right signature */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'cursive', fontSize: 18, color: '#1E293B', marginBottom: 2 }}>
                Simranjit Kaur
              </div>
              <div style={{ height: 1.5, background: '#1E293B', width: 140, margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: 11, fontWeight: 700 }}>Simranjit Kaur</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Lead Coordinator, Tricity</div>
            </div>
          </div>

          {/* Verification Record Footer */}
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-2)', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: 10, color: '#94A3B8' }}>
            Issued on: {date} • Certificate Verification Record: <strong>{certId}</strong> • Verified Registry Record
          </div>
        </div>

        {/* Hidden Canvas for High-Resolution PNG Export */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Modal Bottom Actions Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--space-5)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span>
            <span>Recorded in your live profile registry with {hours} volunteer hours</span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print / Save PDF
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Certificate (PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
