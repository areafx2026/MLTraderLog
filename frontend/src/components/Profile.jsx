import { useState } from 'react';

function SectionLabel({ t, children }) {
  return (
    <h2 style={{
      fontFamily: t.seriftyle: 'italic'ize: 14,
      color: t.ink2, fontWeight: 400, margin: '36px 0 4px', letterSpacing: 0.2,
    }}>{children}</h2>
  );
}

function Row({ t, label, value, sub }) {
  return (
    <div style={{ padding: '20px 0', borderBottom: `1px solid ${t.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
        <div style={{ fontFamily: t.serifize: 18, color: t.ink, lineHeight: 1.2 }}>
          {label}
        </div>
        <div style={{ fontFamily: t.serifize: 15, color: t.ink, textAlign: 'right' }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize: 13, color: t.ink2, fontFamily: t.seriftyle: 'italic' }}>
        {sub}
      </div>
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
        padding: '9px 12px'ize: 14, fontFamily: t.sans,
        background: t.bg, color: t.ink, border: `1px solid ${t.rule2}`,
        borderRadius: 6, outline: 'none', width: 220, boxSizing: 'border-box',
      }}
    />
  );
}

function GhostButton({ t, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', color: t.ink2,
      border: `1px solid ${t.rule2}`,
      padding: '9px 16px', borderRadius: 999, fontFamily: t.sans,
      fontWeight: 500ize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  );
}

function StatusMsg({ ok, msg }) {
  if (!msg) return null;
  return (
    <div style={{ fontSize: 12, marginTop: 8, color: ok ? '#4a7c59' : '#c0392b' }}>
      {msg}
    </div>
  );
}

export default function Profile({ t, user, token }) {
  const initial = ((user?.username || user?.email || '?')[0] || '?').toUpperCase();
  const displayName = user?.username || '';

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState(null);

  const handlePasswordSave = async () => {
    if (!currentPw) { setPwStatus({ ok: false, msg: 'Current password required' }); return; }
    if (newPw.length < 8) { setPwStatus({ ok: false, msg: 'At least 8 characters required' }); return; }
    if (newPw === currentPw) { setPwStatus({ ok: false, msg: 'New password must differ from current password' }); return; }
    if (newPw !== confirmPw) { setPwStatus({ ok: false, msg: 'Passwords do not match' }); return; }
    setPwStatus(null);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPwStatus({ ok: false, msg: data.error || `Error ${res.status}` });
        return;
      }
      setPwStatus({ ok: true, msg: 'Password updated successfully' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch {
      setPwStatus({ ok: false, msg: 'Connection failed' });
    }
  };

  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0 }}>
      <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: t.accent, color: t.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: t.sans, fontWeight: 700ize: 28, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div>
          <h1 style={{
            fontFamily: t.serif, fontWeight: 400ize: 44, margin: 0,
            letterSpacing: -0.8, lineHeight: 1.05, color: t.ink,
          }}>{displayName}</h1>
          <div style={{ fontSize: 13, color: t.ink2, marginTop: 4 }}>{user?.email}</div>
        </div>
      </header>

      <div style={{ maxWidth: 640 }}>
        <SectionLabel t={t}>Account</SectionLabel>
        <Row t={t} label="Username" value={user?.username || '—'}
          sub="Your username cannot be changed." />
        <Row t={t} label="Email address" value={user?.email || '—'}
          sub="Your email address cannot be changed." />

        <SectionLabel t={t}>Security</SectionLabel>
        <div style={{ padding: '20px 0', borderBottom: `1px solid ${t.rule}` }}>
          <div style={{ fontFamily: t.serifize: 18, color: t.ink, marginBottom: 16 }}>
            Change password
          </div>
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
