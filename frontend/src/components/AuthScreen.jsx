import { useState, useCallback, useRef } from 'react';
import { createT } from '../i18n.js';
import { ModeToggle } from './Sidebar.jsx';

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

export default function AuthScreen({ t, onAuth, lang = 'en', mode = 'dark', theme = 'dark', onSetTheme }) {
  const tr = createT(lang);
  const [view, setView] = useState('login');

  // form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // username availability
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'error'
  const debounceRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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
    // If username check is still in flight, wait for it
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
        : { email, password, username: username.trim() };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
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

  const switchView = (v) => {
    setView(v);
    setErrors({});
    setServerError('');
    setUsernameStatus(null);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: mode === 'light' ? t.paper : t.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: t.sans, position: 'relative', overflow: 'hidden',
    }}>
      {/* Hyper gradient blooms */}
      {t.isGlass && (
        <>
          <div style={{
            position: 'absolute', top: -240, right: -240, width: 640, height: 640,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(169,139,255,0.13) 0%, transparent 68%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -240, left: -240, width: 560, height: 560,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(95,220,240,0.09) 0%, transparent 68%)',
          }} />
        </>
      )}

      {/* Theme toggle bottom-left */}
      {onSetTheme && (
        <div style={{ position: 'absolute', bottom: 28, left: 28, zIndex: 1 }}>
          <ModeToggle t={t} theme={theme} onSetTheme={onSetTheme} />
        </div>
      )}

      <div style={{ width: 360, position: 'relative', zIndex: 1 }}>
        <div style={{ overflow: 'hidden', marginBottom: 8 }}>
          <img
            src={mode === 'light' ? '/lockup-light.png' : '/lockup-dark.png'}
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
      </div>
    </div>
  );
}
