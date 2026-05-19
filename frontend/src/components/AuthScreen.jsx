import { useState } from 'react';
import { FONTS } from '../theme.js';
import { createT } from '../i18n.js';

function Field({ t, label, type, value, onChange, error }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block', fontSize: 12, fontFamily: FONTS.serif,
        fontStyle: 'italic', color: t.ink2, marginBottom: 6,
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 14px', fontSize: 14, fontFamily: FONTS.sans,
          background: t.bg, color: t.ink,
          border: `1px solid ${error ? '#c0392b' : t.rule2}`,
          borderRadius: 6, outline: 'none',
        }}
      />
      {error && (
        <div style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

export default function AuthScreen({ t, onAuth, lang = 'en', mode = 'light' }) {
  const tr = createT(lang);
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.includes('@')) e.email = tr('auth.error.invalid_email');
    if (password.length < 8) e.password = tr('auth.error.password_min');
    if (view === 'register' && password !== password2) e.password2 = tr('auth.error.password_mismatch');
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      const endpoint = view === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONTS.sans,
    }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <img
            src={mode === 'dark' ? '/lockup-dark.svg' : '/lockup-light.svg'}
            alt="FxLedger"
            style={{ height: 40, display: 'inline-block' }}
          />
        </div>
        <div style={{
          fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14,
          color: t.ink2, textAlign: 'center', marginBottom: 40,
        }}>
          {view === 'login' ? tr('auth.tagline.login') : tr('auth.tagline.register')}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Field t={t} label={tr('auth.email')} type="email"
            value={email} onChange={setEmail} error={errors.email} />
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

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', fontSize: 14, fontFamily: FONTS.sans,
            fontWeight: 600, border: 'none', borderRadius: 999, cursor: loading ? 'wait' : 'pointer',
            background: t.ink, color: t.bg,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '…' : view === 'login' ? tr('auth.sign_in') : tr('auth.create_account')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: t.ink2 }}>
          {view === 'login' ? (
            <>{tr('auth.no_account')}{' '}
              <button onClick={() => switchView('register')} style={{
                background: 'none', border: 'none', color: t.ink,
                cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 13,
                textDecoration: 'underline', padding: 0,
              }}>{tr('auth.sign_up')}</button>
            </>
          ) : (
            <>{tr('auth.already_registered')}{' '}
              <button onClick={() => switchView('login')} style={{
                background: 'none', border: 'none', color: t.ink,
                cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 13,
                textDecoration: 'underline', padding: 0,
              }}>{tr('auth.sign_in')}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
