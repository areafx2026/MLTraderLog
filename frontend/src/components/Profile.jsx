import { useState } from 'react';
import { FONTS } from '../theme.js';

function SectionLabel({ t, children }) {
  return (
    <h2 style={{
      fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14,
      color: t.ink2, fontWeight: 400, margin: '36px 0 4px', letterSpacing: 0.2,
    }}>{children}</h2>
  );
}

function Row({ t, label, sub, control }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '20px 0', borderBottom: `1px solid ${t.rule}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONTS.serif, fontSize: 18, color: t.ink, lineHeight: 1.2 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 13, color: t.ink2, marginTop: 4, fontFamily: FONTS.serif, fontStyle: 'italic' }}>
            {sub}
          </div>
        )}
      </div>
      {control && <div>{control}</div>}
    </div>
  );
}

function Input({ t, value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '9px 12px', fontSize: 14, fontFamily: FONTS.sans,
        background: t.bg, color: t.ink, border: `1px solid ${t.rule2}`,
        borderRadius: 6, outline: 'none', width: 220, boxSizing: 'border-box',
      }}
    />
  );
}

function GhostButton({ t, children, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent',
      color: danger ? t.loss : t.ink2,
      border: `1px solid ${danger ? t.loss : t.rule2}`,
      padding: '9px 16px', borderRadius: 999, fontFamily: FONTS.sans,
      fontWeight: 500, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  );
}

function StatusMsg({ ok, msg }) {
  if (!msg) return null;
  return (
    <div style={{
      fontSize: 12, marginTop: 8,
      color: ok ? '#4a7c59' : '#c0392b',
    }}>{msg}</div>
  );
}

export default function Profile({ t, user, token, onUserUpdate }) {
  const initial = (user?.username || user?.email || '?')[0].toUpperCase();
  const displayName = user?.username || '';

  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [emailPw, setEmailPw] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState(null);

  const handleEmailSave = async () => {
    if (!newEmail.includes('@')) { setEmailStatus({ ok: false, msg: 'Please enter a valid email address' }); return; }
    if (!emailPw) { setEmailStatus({ ok: false, msg: 'Current password required' }); return; }
    setEmailStatus(null);
    try {
      const res = await fetch('/api/auth/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail, password: emailPw }),
      });
      const data = await res.json();
      if (!res.ok) { setEmailStatus({ ok: false, msg: data.error }); return; }
      setEmailStatus({ ok: true, msg: 'Email updated. Please log in again.' });
      setNewEmail(''); setEmailPw('');
      if (onUserUpdate) onUserUpdate({ ...user, email: data.email });
    } catch {
      setEmailStatus({ ok: false, msg: 'Connection failed' });
    }
  };

  const handlePasswordSave = async () => {
    if (newPw.length < 8) { setPwStatus({ ok: false, msg: 'At least 8 characters required' }); return; }
    if (newPw !== confirmPw) { setPwStatus({ ok: false, msg: 'Passwords do not match' }); return; }
    if (!currentPw) { setPwStatus({ ok: false, msg: 'Current password required' }); return; }
    setPwStatus(null);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwStatus({ ok: false, msg: data.error }); return; }
      setPwStatus({ ok: true, msg: 'Password updated successfully' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch {
      setPwStatus({ ok: false, msg: 'Connection failed' });
    }
  };

  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0 }}>
      <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: t.accent, color: t.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONTS.sans, fontWeight: 700, fontSize: 28, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div>
          <h1 style={{
            fontFamily: FONTS.serif, fontWeight: 400, fontSize: 44, margin: 0,
            letterSpacing: -0.8, lineHeight: 1.05, color: t.ink,
          }}>{displayName}</h1>
          <div style={{ fontSize: 13, color: t.ink2, marginTop: 4 }}>{user?.email}</div>
        </div>
      </header>

      <div style={{ maxWidth: 640 }}>
        <SectionLabel t={t}>Account</SectionLabel>

        <Row t={t} label="Username"
          sub="Your username cannot be changed." />

        <Row t={t} label="Email address"
          sub="Requires your current password to confirm."
          control={null} />
        <div style={{ paddingBottom: 20, borderBottom: `1px solid ${t.rule}` }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <Input t={t} value={newEmail} onChange={setNewEmail}
              type="email" placeholder="New email address" />
            <Input t={t} value={emailPw} onChange={setEmailPw}
              type="password" placeholder="Current password" />
            <GhostButton t={t} onClick={handleEmailSave}>Save</GhostButton>
          </div>
          <StatusMsg ok={emailStatus?.ok} msg={emailStatus?.msg} />
        </div>

        <SectionLabel t={t}>Security</SectionLabel>

        <Row t={t} label="Change password" sub={null} control={null} />
        <div style={{ paddingBottom: 20, borderBottom: `1px solid ${t.rule}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 280 }}>
            <Input t={t} value={currentPw} onChange={setCurrentPw}
              type="password" placeholder="Current password" />
            <Input t={t} value={newPw} onChange={setNewPw}
              type="password" placeholder="New password (min 8 chars)" />
            <Input t={t} value={confirmPw} onChange={setConfirmPw}
              type="password" placeholder="Confirm new password" />
            <div style={{ marginTop: 4 }}>
              <GhostButton t={t} onClick={handlePasswordSave}>Update password</GhostButton>
            </div>
          </div>
          <StatusMsg ok={pwStatus?.ok} msg={pwStatus?.msg} />
        </div>
      </div>
    </div>
  );
}
