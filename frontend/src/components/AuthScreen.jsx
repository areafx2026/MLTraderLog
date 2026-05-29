import { useState, useCallback, useRef, useEffect } from 'react';
import { createT } from '../i18n.js';
import { getThemeAssets } from '../App.jsx';

function Field({ t, label, type, value, onChange, onBlur, error, hint, badge }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <label style={{
          fontSize: 12, fontFamily: t.serif,
          fontStyle: 'italic', color: t.ink2,
        }}>{label}</label>
        {badge && (
          <span style={{
            fontSize: 11, fontFamily: t.serif, fontStyle: 'italic',
            color: badge.color,
          }}>{badge.text}</span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 14px', fontSize: 14, fontFamily: t.sans,
          background: t.bg, color: t.ink,
          border: `1px solid ${error ? '#c0392b' : t.rule2}`,
          borderRadius: 6, outline: 'none',
        }}
      />
      {error && (
        <div style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{error}</div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 11, color: t.ink3, marginTop: 4, fontStyle: 'italic' }}>{hint}</div>
      )}
    </div>
  );
}

// ── 6-digit OTP input ─────────────────────────────────────────────────────────

function OtpInput({ t, value, onChange }) {
  const digits = (value + '      ').slice(0, 6).split('');
  const refs = Array.from({ length: 6 }, () => useRef(null)); // eslint-disable-line react-hooks/rules-of-hooks

  const update = (index, char) => {
    const arr = (value + '      ').slice(0, 6).split('');
    arr[index] = char.replace(/\D/g, '').slice(-1);
    onChange(arr.join('').trimEnd());
    if (char && index < 5) refs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index] === ' ' || digits[index] === '') {
        if (index > 0) refs[index - 1].current?.focus();
      } else {
        const arr = (value + '      ').slice(0, 6).split('');
        arr[index] = ' ';
        onChange(arr.join('').trimEnd());
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    refs[focusIdx].current?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          autoFocus={i === 0}
          onChange={e => update(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          style={{
            width: 44, height: 52, textAlign: 'center',
            fontSize: 22, fontFamily: t.mono, fontWeight: 600,
            background: t.bg, color: t.ink,
            border: `1px solid ${digits[i].trim() ? t.accent : t.rule2}`,
            borderRadius: 8, outline: 'none',
            caretColor: 'transparent',
            transition: 'border-color .12s',
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AuthScreen({ t, onAuth, lang = 'en', resolvedMode = 'dark', design = 'linen', mode = 'dark' }) {
  const tr = createT(lang);
  const [view, setView] = useState('login'); // 'login' | 'register' | 'verify'

  // login / register form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // username availability
  const [usernameStatus, setUsernameStatus] = useState(null);
  const debounceRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // verify view state
  const [verifyEmail, setVerifyEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const checkUsername = useCallback(async (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) { setUsernameStatus(null); return; }
    setUsernameStatus('checking');
    try {
      const res = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json();
      setUsernameStatus(data.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus(null);
    }
  }, []);

  const handleUsernameChange = (value) => {
    setUsername(value);
    setUsernameStatus(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkUsername(value), 600);
  };

  const handleUsernameBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (username.trim().length >= 2) checkUsername(username);
  };

  const usernameBadge = () => {
    if (!username.trim() || usernameStatus === null) return null;
    if (usernameStatus === 'checking') return { text: tr('auth.username.checking'), color: t.ink3 };
    if (usernameStatus === 'available') return { text: `✓ ${tr('auth.username.available')}`, color: t.win };
    if (usernameStatus === 'taken') return { text: `✗ ${tr('auth.username.taken')}`, color: '#c0392b' };
    return null;
  };

  const validate = () => {
    const e = {};
    if (!email.includes('@')) e.email = tr('auth.error.invalid_email');
    if (view === 'register') {
      if (username.trim().length < 2) e.username = tr('auth.error.username_min');
      else if (usernameStatus !== 'available') e.username = tr('auth.error.username_unavailable');
    }
    if (password.length < 8) e.password = tr('auth.error.password_min');
    if (view === 'register' && password !== password2) e.password2 = tr('auth.error.password_mismatch');
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (view === 'register' && usernameStatus === 'checking') return;
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      const endpoint = view === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = view === 'login'
        ? { email, password }
        : { email, password, username: username.trim(), design, mode };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.requiresVerification) {
        // → go to verify view (from both register success and login with unverified account)
        setVerifyEmail(data.email);
        setOtpValue('');
        setVerifyError('');
        setResendCooldown(60);
        setView('verify');
      } else if (!res.ok) {
        setServerError(data.error || 'Authentication failed');
      } else {
        onAuth(data.token, data.user);
      }
    } catch {
      setServerError(tr('auth.error.connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otpValue.replace(/\s/g, '');
    if (code.length !== 6) { setVerifyError('Please enter the full 6-digit code.'); return; }
    setVerifyError('');
    setVerifyLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || 'Verification failed');
      } else {
        onAuth(data.token, data.user);
      }
    } catch {
      setVerifyError(tr('auth.error.connection'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setResendCooldown(data.retryAfter || 60);
      } else if (res.ok) {
        setResendCooldown(60);
        setOtpValue('');
        setVerifyError('');
      }
    } catch { /* silent */ }
  };

  const switchView = (v) => {
    setView(v);
    setErrors({});
    setServerError('');
    setUsernameStatus(null);
  };

  // ── Verify view ─────────────────────────────────────────────────────────────
  if (view === 'verify') {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: resolvedMode === 'light' ? t.paper : t.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: t.sans, position: 'relative', overflow: 'hidden',
      }}>
        {t.bloomViolet && (
          <>
            <div style={{ position: 'absolute', top: -240, right: -240, width: 640, height: 640, borderRadius: '50%', pointerEvents: 'none', background: t.bloomViolet }} />
            <div style={{ position: 'absolute', bottom: -240, left: -240, width: 560, height: 560, borderRadius: '50%', pointerEvents: 'none', background: t.bloomCyan }} />
          </>
        )}

        <div style={{ width: 340, position: 'relative', zIndex: 1 }}>
          <img
            src={getThemeAssets(design, resolvedMode).lockup}
            alt="FxLedger"
            style={{ width: '100%', display: 'block', transform: 'translateX(27px)', marginBottom: 8 }}
          />
          <div style={{
            fontFamily: t.serif, fontStyle: 'italic', fontSize: 14,
            color: t.ink2, textAlign: 'center', marginBottom: 40,
          }}>
            Check your inbox.
          </div>

          <p style={{
            fontSize: 14, color: t.ink2, marginBottom: 8, lineHeight: 1.6,
            fontFamily: t.serif, fontStyle: 'italic',
          }}>
            We sent a 6-digit code to <strong style={{ fontStyle: 'normal', color: t.ink }}>{verifyEmail}</strong>.
            Enter it below to confirm your email address.
          </p>

          <OtpInput t={t} value={otpValue} onChange={setOtpValue} />

          {verifyError && (
            <div style={{
              fontSize: 13, color: '#c0392b', marginBottom: 16,
              padding: '10px 14px', background: 'rgba(192,57,43,.08)', borderRadius: 6,
            }}>{verifyError}</div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifyLoading || otpValue.replace(/\s/g, '').length < 6}
            style={{
              width: '100%', padding: '13px', fontSize: 14, fontFamily: t.sans,
              fontWeight: 600, border: 'none', borderRadius: 999,
              cursor: (verifyLoading || otpValue.replace(/\s/g, '').length < 6) ? 'not-allowed' : 'pointer',
              background: t.gradientPrimary || t.ink,
              color: t.gradientPrimary ? '#fff' : t.bg,
              opacity: (verifyLoading || otpValue.replace(/\s/g, '').length < 6) ? 0.5 : 1,
              transition: 'opacity .15s',
            }}>
            {verifyLoading ? '…' : 'Confirm email'}
          </button>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: t.ink2 }}>
            <button onClick={handleResend} disabled={resendCooldown > 0}
              style={{
                background: 'none', border: 'none',
                color: resendCooldown > 0 ? t.ink3 : t.ink,
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
                fontFamily: t.sans, fontSize: 13, padding: 0,
                textDecoration: resendCooldown > 0 ? 'none' : 'underline',
              }}>
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </button>
            <span style={{ margin: '0 10px', color: t.ink3 }}>·</span>
            <button onClick={() => switchView('login')}
              style={{
                background: 'none', border: 'none', color: t.ink2,
                cursor: 'pointer', fontFamily: t.sans, fontSize: 13,
                padding: 0, textDecoration: 'underline',
              }}>
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Login / Register view ───────────────────────────────────────────────────
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: resolvedMode === 'light' ? t.paper : t.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: t.sans, position: 'relative', overflow: 'hidden',
    }}>
      {t.bloomViolet && (
        <>
          <div style={{ position: 'absolute', top: -240, right: -240, width: 640, height: 640, borderRadius: '50%', pointerEvents: 'none', background: t.bloomViolet }} />
          <div style={{ position: 'absolute', bottom: -240, left: -240, width: 560, height: 560, borderRadius: '50%', pointerEvents: 'none', background: t.bloomCyan }} />
        </>
      )}

      <div style={{ width: 360, position: 'relative', zIndex: 1 }}>
        <div style={{ overflow: 'hidden', marginBottom: 8 }}>
          <img
            src={getThemeAssets(design, resolvedMode).lockup}
            alt="FxLedger"
            style={{ width: '100%', display: 'block', transform: 'translateX(27px)' }}
          />
        </div>
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 14,
          color: t.ink2, textAlign: 'center', marginBottom: 40,
        }}>
          {view === 'login' ? tr('auth.tagline.login') : tr('auth.tagline.register')}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Field t={t} label={tr('auth.email')} type="email"
            value={email} onChange={setEmail} error={errors.email} />

          {view === 'register' && (
            <Field t={t} label={tr('auth.username')} type="text"
              value={username}
              onChange={handleUsernameChange}
              onBlur={handleUsernameBlur}
              error={errors.username}
              hint={tr('auth.username.hint')}
              badge={usernameBadge()} />
          )}

          <Field t={t} label={tr('auth.password')} type="password"
            value={password} onChange={setPassword} error={errors.password} />
          {view === 'register' && (
            <Field t={t} label={tr('auth.password_repeat')} type="password"
              value={password2} onChange={setPassword2} error={errors.password2} />
          )}

          {serverError && (
            <div style={{
              fontSize: 13, color: '#c0392b', marginBottom: 16,
              padding: '10px 14px', background: 'rgba(192,57,43,.08)', borderRadius: 6,
            }}>{serverError}</div>
          )}

          <button type="submit" disabled={loading || usernameStatus === 'checking'} style={{
            width: '100%', padding: '13px', fontSize: 14, fontFamily: t.sans,
            fontWeight: 600, border: 'none', borderRadius: 999,
            cursor: (loading || usernameStatus === 'checking') ? 'wait' : 'pointer',
            background: t.gradientPrimary || t.ink,
            color: t.gradientPrimary ? '#fff' : t.bg,
            opacity: (loading || usernameStatus === 'checking') ? 0.7 : 1,
          }}>
            {loading ? '…' : view === 'login' ? tr('auth.sign_in') : tr('auth.create_account')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: t.ink2 }}>
          {view === 'login' ? (
            <>{tr('auth.no_account')}{' '}
              <button onClick={() => switchView('register')} style={{
                background: 'none', border: 'none', color: t.ink,
                cursor: 'pointer', fontFamily: t.sans, fontSize: 13,
                textDecoration: 'underline', padding: 0,
              }}>{tr('auth.sign_up')}</button>
            </>
          ) : (
            <>{tr('auth.already_registered')}{' '}
              <button onClick={() => switchView('login')} style={{
                background: 'none', border: 'none', color: t.ink,
                cursor: 'pointer', fontFamily: t.sans, fontSize: 13,
                textDecoration: 'underline', padding: 0,
              }}>{tr('auth.sign_in')}</button>
            </>
          )}
        </div>

        {/* Legal links */}
        <div style={{
          marginTop: 32, textAlign: 'center',
          fontFamily: t.sans, fontSize: 12, color: t.ink3,
        }}>
          <button onClick={() => onNavigateLegal?.('privacy')} style={{
            background: 'none', border: 'none', color: t.ink3, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 'inherit', padding: 0,
            textDecoration: 'underline',
          }}>Privacy Policy</button>
          <span style={{ margin: '0 8px' }}>·</span>
          <button onClick={() => onNavigateLegal?.('terms')} style={{
            background: 'none', border: 'none', color: t.ink3, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 'inherit', padding: 0,
            textDecoration: 'underline',
          }}>Terms and Conditions</button>
        </div>

      </div>
    </div>
  );
}
