import { useState, useEffect } from 'react';

// ── Countdown ─────────────────────────────────────────────────────────────────

const DEADLINE = new Date('2026-06-30T23:59:59');

function useCountdown() {
  const calc = () => {
    const diff = DEADLINE - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function CountdownUnit({ value, label, t }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 60 }}>
      <div style={{
        fontFamily: t.serif, fontSize: 40, fontWeight: 500,
        letterSpacing: -1, lineHeight: 1, color: t.ink,
        background: t.gradientText
          ? `linear-gradient(135deg, ${t.ink} 40%, ${t.accent})`
          : 'none',
        WebkitBackgroundClip: t.gradientText ? 'text' : 'unset',
        WebkitTextFillColor: t.gradientText ? 'transparent' : 'unset',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{
        fontFamily: t.serif, fontStyle: 'italic', fontSize: 11,
        color: t.ink3, marginTop: 4, letterSpacing: 0.3,
      }}>{label}</div>
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────

function WaitlistForm({ t, onNavigateLegal }) {
  const [email, setEmail]       = useState('');
  const [consent, setConsent]   = useState(false);
  const [state, setState]       = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) { setErrorMsg('Please accept the data protection terms.'); return; }
    if (!email.includes('@')) { setErrorMsg('Please enter a valid email address.'); return; }
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      });
      if (res.ok) {
        setState('success');
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorMsg(d.error || 'Something went wrong. Please try again.');
        setState('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{
          fontFamily: t.serif, fontSize: 22, fontWeight: 400,
          color: t.win, marginBottom: 8, letterSpacing: -0.3,
        }}>You're in.</div>
        <div style={{ fontFamily: t.sans, fontSize: 13, color: t.ink2 }}>
          We'll reach out as soon as Founding Membership opens.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            flex: 1, minWidth: 220,
            padding: '13px 16px', borderRadius: 999,
            border: `1px solid ${t.rule2}`,
            background: t.pane || t.paper,
            color: t.ink, fontFamily: t.sans, fontSize: 14,
            outline: 'none',
            backdropFilter: t.isGlass ? 'blur(8px)' : 'none',
          }}
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          style={{
            background: t.gradientPrimary || t.ink,
            color: t.gradientPrimary ? '#fff' : t.inkInk,
            border: 'none', borderRadius: 999,
            padding: '13px 28px',
            fontFamily: t.sans, fontWeight: 600, fontSize: 14,
            cursor: state === 'loading' ? 'default' : 'pointer',
            whiteSpace: 'nowrap', opacity: state === 'loading' ? 0.7 : 1,
            boxShadow: t.shadowGlow || 'none',
            transition: 'opacity .15s',
          }}
        >
          {state === 'loading' ? 'Sending…' : 'Join the waitlist'}
        </button>
      </div>

      {/* Consent */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
        fontFamily: t.sans, fontSize: 12, color: t.ink3, lineHeight: 1.5,
      }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          style={{ marginTop: 2, flexShrink: 0, accentColor: t.accent }}
        />
        <span>
          I agree that FxLedger may contact me about the Founding Member offer. I have read the{' '}
          <button
            type="button"
            onClick={() => onNavigateLegal?.('datenschutz')}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: t.accent, fontFamily: 'inherit', fontSize: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Data Protection Declaration
          </button>
          {' '}and consent to my email being stored for this purpose. I can withdraw this consent at any time.
        </span>
      </label>

      {errorMsg && (
        <div style={{
          marginTop: 10, fontFamily: t.sans, fontSize: 12,
          color: t.loss, lineHeight: 1.4,
        }}>{errorMsg}</div>
      )}
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage({ t, onEnterApp, onNavigateLegal, design, resolvedMode }) {
  const { days, hours, minutes, seconds } = useCountdown();

  const divider = <span style={{ color: t.ink3, margin: '0 6px' }}>·</span>;

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: resolvedMode === 'light' ? t.paper : t.bg,
      color: t.ink, fontFamily: t.sans,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Gradient blooms */}
      {t.bloomViolet && (
        <>
          <div style={{ position: 'absolute', top: -240, right: -160, width: 640, height: 640, borderRadius: '50%', pointerEvents: 'none', background: t.bloomViolet }} />
          <div style={{ position: 'absolute', bottom: -240, left: -160, width: 560, height: 560, borderRadius: '50%', pointerEvents: 'none', background: t.bloomCyan }} />
        </>
      )}

      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px',
      }}>
        <div style={{
          fontFamily: t.serif, fontSize: 20, fontWeight: 500,
          letterSpacing: -0.4, color: t.ink,
        }}>FxLedger</div>
        <button onClick={onEnterApp} style={{
          background: 'transparent', border: `1px solid ${t.rule2}`,
          color: t.ink2, borderRadius: 999,
          padding: '8px 20px', fontFamily: t.sans, fontSize: 13,
          fontWeight: 500, cursor: 'pointer',
        }}>Sign in →</button>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px 80px', textAlign: 'center',
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 14,
          color: t.ink2, marginBottom: 24, letterSpacing: 0.2,
        }}>
          GDPR-native · Built in Europe · Designed for clarity
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: t.serif, fontWeight: 400,
          fontSize: 'clamp(36px, 6vw, 72px)',
          letterSpacing: -1.5, lineHeight: 1.08,
          margin: '0 0 24px', maxWidth: 760,
          color: t.ink,
        }}>
          Your trades.{' '}
          <span style={{
            fontStyle: 'italic',
            background: t.gradientText || 'none',
            WebkitBackgroundClip: t.gradientText ? 'text' : 'unset',
            WebkitTextFillColor: t.gradientText ? 'transparent' : 'unset',
            color: t.gradientText ? 'transparent' : t.accent,
          }}>Your data.</span>
          {' '}Your rules.
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontFamily: t.sans, fontSize: 17, color: t.ink2,
          lineHeight: 1.65, maxWidth: 520, margin: '0 0 16px',
        }}>
          The trading journal that puts you in control — private by design,
          clean by choice, and built for serious traders across Europe.
        </p>

        {/* Founding Member slogan */}
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 15,
          color: t.accent, marginBottom: 48,
        }}>
          Become a Founding Member — lock in lifetime pricing before 30 June.
        </div>

        {/* Form */}
        <div style={{
          width: '100%', maxWidth: 540,
          background: t.isGlass ? t.pane : 'transparent',
          border: t.isGlass ? `1px solid ${t.rule}` : 'none',
          borderRadius: t.isGlass ? 20 : 0,
          padding: t.isGlass ? '28px 32px' : '0',
          backdropFilter: t.isGlass ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: t.isGlass ? 'blur(20px)' : 'none',
          boxShadow: t.shadowMd || 'none',
          marginBottom: 48,
        }}>
          <WaitlistForm t={t} onNavigateLegal={onNavigateLegal} />
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontFamily: t.serif, fontStyle: 'italic', fontSize: 12,
            color: t.ink3, marginBottom: 16, letterSpacing: 0.3,
          }}>
            Founding Member offer closes in
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center' }}>
            <CountdownUnit value={days}    label="days"    t={t} />
            <CountdownUnit value={hours}   label="hours"   t={t} />
            <CountdownUnit value={minutes} label="min"     t={t} />
            <CountdownUnit value={seconds} label="sec"     t={t} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '20px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, fontSize: 12, color: t.ink3, fontFamily: t.sans,
        flexWrap: 'wrap',
      }}>
        <span>© 2026 FxLedger</span>
        {divider}
        <button onClick={() => onNavigateLegal?.('privacy')}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}>
          Privacy Policy
        </button>
        {divider}
        <button onClick={() => onNavigateLegal?.('terms')}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}>
          Terms
        </button>
        {divider}
        <button onClick={() => onNavigateLegal?.('datenschutz')}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}>
          Data Protection
        </button>
      </footer>
    </div>
  );
}
