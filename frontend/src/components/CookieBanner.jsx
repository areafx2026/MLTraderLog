export default function CookieBanner({ t, onAccept }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
      padding: '20px 40px',
      background: t.pane || (t.name === 'dark' ? 'rgba(18,18,18,.96)' : 'rgba(251,246,236,.96)'),
      borderTop: `1px solid ${t.rule}`,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      boxShadow: '0 -4px 24px rgba(0,0,0,.12)',
    }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{
          fontFamily: t.serif, fontWeight: 500, fontSize: 15,
          color: t.ink, marginBottom: 5,
        }}>
          We use cookies
        </div>
        <div style={{
          fontFamily: t.sans, fontSize: 13, color: t.ink2, lineHeight: 1.6,
        }}>
          Technically necessary cookies keep you securely logged in.
          "Accept all" additionally enables analytics cookies for future improvements.
          See our{' '}
          <a href="#privacy" style={{ color: t.accent, textDecoration: 'none' }}>Privacy Policy</a>
          {' '}for details.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => onAccept('necessary')}
          style={{
            background: 'transparent',
            border: `1px solid ${t.rule2}`,
            color: t.ink2,
            padding: '10px 18px', borderRadius: 999,
            fontFamily: t.sans, fontWeight: 500, fontSize: 13,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
          Accept only necessary
        </button>
        <button
          onClick={() => onAccept('all')}
          style={{
            background: t.gradientPrimary || t.ink,
            color: t.gradientPrimary ? '#fff' : t.inkInk,
            border: 'none',
            padding: '10px 18px', borderRadius: 999,
            fontFamily: t.sans, fontWeight: 600, fontSize: 13,
            cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: t.shadowGlow || 'none',
          }}>
          Accept all
        </button>
      </div>
    </div>
  );
}
