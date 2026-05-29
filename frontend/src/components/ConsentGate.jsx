// ─────────────────────────────────────────────────────────────────────────────
// ConsentGate — blocking GDPR consent overlay for the public landing page.
//
// Usage (future landing page):
//   const [consent, setConsent] = useState(() => localStorage.getItem('cookie_consent'));
//   if (!consent) return <ConsentGate t={t} onAccept={setConsent} onNavigate={...} />;
//
// The gate is full-screen and non-dismissable — users must make an active
// choice before accessing the landing page, as required by GDPR Art. 7.
// ─────────────────────────────────────────────────────────────────────────────

export default function ConsentGate({ t, onAccept, onNavigate }) {
  const accept = (level) => {
    localStorage.setItem('cookie_consent', level);
    onAccept(level);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: t.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: t.sans,
    }}>
      {/* Gradient blooms (Hyper only) */}
      {t.bloomViolet && (
        <>
          <div style={{ position: 'absolute', top: -200, right: -200, width: 560, height: 560, borderRadius: '50%', pointerEvents: 'none', background: t.bloomViolet }} />
          <div style={{ position: 'absolute', bottom: -200, left: -200, width: 480, height: 480, borderRadius: '50%', pointerEvents: 'none', background: t.bloomCyan }} />
        </>
      )}

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 520, width: '100%',
        background: t.pane || 'transparent',
        border: t.isGlass ? `1px solid ${t.rule}` : 'none',
        borderRadius: t.isGlass ? 20 : 0,
        padding: t.isGlass ? '48px 48px' : '0',
        backdropFilter: t.isGlass ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: t.isGlass ? 'blur(24px)' : 'none',
        boxShadow: t.shadowMd || 'none',
      }}>
        {/* Logo placeholder — swap with your lockup img when integrating */}
        <div style={{
          fontFamily: t.serif, fontSize: 22, fontWeight: 500,
          color: t.ink, marginBottom: 32, letterSpacing: -0.5,
        }}>
          FxLedger
        </div>

        <h1 style={{
          fontFamily: t.serif, fontWeight: 400, fontSize: 28,
          color: t.ink, margin: '0 0 16px', letterSpacing: -0.5, lineHeight: 1.15,
        }}>
          Before you continue
        </h1>

        <p style={{
          fontSize: 14, color: t.ink2, lineHeight: 1.7, margin: '0 0 10px',
        }}>
          We use cookies to keep you securely logged in. With your permission,
          we also use analytics cookies to improve the service.
        </p>

        <p style={{ fontSize: 13, color: t.ink3, lineHeight: 1.6, margin: '0 0 32px' }}>
          You can change your choice at any time in Settings. Read our{' '}
          <button onClick={() => onNavigate?.('datenschutz')}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: t.accent, fontFamily: 'inherit', fontSize: 'inherit',
              textDecoration: 'underline',
            }}>
            Data Protection Declaration
          </button>
          {' '}for full details.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => accept('all')}
            style={{
              background: t.gradientPrimary || t.ink,
              color: t.gradientPrimary ? '#fff' : t.inkInk,
              border: 'none', borderRadius: 999,
              padding: '14px 24px', width: '100%',
              fontFamily: t.sans, fontWeight: 600, fontSize: 14,
              cursor: 'pointer', letterSpacing: 0.1,
              boxShadow: t.shadowGlow || 'none',
            }}>
            Accept all cookies
          </button>

          <button onClick={() => accept('necessary')}
            style={{
              background: 'transparent',
              color: t.ink2,
              border: `1px solid ${t.rule2}`,
              borderRadius: 999,
              padding: '13px 24px', width: '100%',
              fontFamily: t.sans, fontWeight: 500, fontSize: 14,
              cursor: 'pointer',
            }}>
            Accept only necessary cookies
          </button>
        </div>

        {/* Legal links */}
        <div style={{
          marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center',
          fontSize: 12, color: t.ink3,
        }}>
          <button onClick={() => onNavigate?.('privacy')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}>
            Privacy Policy
          </button>
          <button onClick={() => onNavigate?.('terms')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}>
            Terms
          </button>
          <button onClick={() => onNavigate?.('datenschutz')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}>
            Data Protection
          </button>
        </div>
      </div>
    </div>
  );
}
