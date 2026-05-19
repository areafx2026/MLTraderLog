import { useState } from 'react';
import { FONTS } from '../theme.js';

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
          <div style={{
            fontSize: 13, color: t.ink2, marginTop: 4,
            fontFamily: FONTS.serif, fontStyle: 'italic',
          }}>{sub}</div>
        )}
      </div>
      <div>{control}</div>
    </div>
  );
}

function SectionLabel({ t, children }) {
  return (
    <h2 style={{
      fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14,
      color: t.ink2, fontWeight: 400, margin: '36px 0 4px', letterSpacing: 0.2,
    }}>{children}</h2>
  );
}

function Seg({ t, value, options, onChange }) {
  return (
    <span style={{
      display: 'inline-flex', borderRadius: 999,
      border: `1px solid ${t.rule2}`, padding: 2,
    }}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13,
              fontFamily: FONTS.sans, border: 'none', cursor: 'pointer',
              background: on ? t.ink : 'transparent',
              color: on ? t.inkInk : t.ink2,
            }}>{o.label}</button>
        );
      })}
    </span>
  );
}

function Toggle({ t, on: initial }) {
  const [on, setOn] = useState(!!initial);
  return (
    <button onClick={() => setOn(v => !v)} aria-pressed={on}
      style={{
        width: 40, height: 24, padding: 2, border: 'none',
        borderRadius: 999, cursor: 'pointer',
        background: on ? t.accent : t.rule2,
        transition: 'background .18s',
        display: 'inline-flex', alignItems: 'center',
      }}>
      <span style={{
        width: 20, height: 20, borderRadius: '50%', background: t.paper,
        transform: on ? 'translateX(16px)' : 'translateX(0)',
        transition: 'transform .18s',
        boxShadow: '0 1px 2px rgba(0,0,0,.15)',
        display: 'block',
      }} />
    </button>
  );
}

function GhostButton({ t, children, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background: 'transparent', color: t.ink2, border: `1px solid ${t.rule2}`,
        padding: '11px 16px', borderRadius: 999, fontFamily: FONTS.sans,
        fontWeight: 500, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
      {children}
    </button>
  );
}

export default function Settings({ t, mode, onToggleMode, view, onChangeView, user, onSignOut, token }) {
  const handleExport = () => {
    fetch('/api/export', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'forexlog-trades.csv'; a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0 }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: FONTS.serif, fontWeight: 400, fontSize: 44, margin: 0,
          letterSpacing: -0.8, lineHeight: 1.05, color: t.ink,
        }}>Settings</h1>
      </header>

      <div style={{ maxWidth: 720 }}>
        <SectionLabel t={t}>Appearance</SectionLabel>
        <Row t={t} label="Theme"
          sub="Linen by day, Dusk by night. Both calm — pick whichever matches the room you're in."
          control={
            <Seg t={t} value={mode}
              options={[{ id: 'light', label: 'Linen' }, { id: 'dark', label: 'Dusk' }]}
              onChange={(m) => onToggleMode(m)} />
          } />
        <Row t={t} label="Default trade view"
          sub="How Trades opens by default. You can always flip at the top."
          control={
            <Seg t={t} value={view}
              options={[{ id: 'list', label: 'List' }, { id: 'cards', label: 'Cards' }]}
              onChange={onChangeView} />
          } />

        <SectionLabel t={t}>Account</SectionLabel>
        {user && (
          <Row t={t} label="Signed in as"
            sub={user.email}
            control={null} />
        )}
        <Row t={t} label="Display currency"
          sub="All P&L is shown in the currency you log it in."
          control={<GhostButton t={t}>Change</GhostButton>} />
        <Row t={t} label="Risk per trade"
          sub="Default risk target, applied as a guide when logging."
          control={<GhostButton t={t}>Adjust</GhostButton>} />

        <SectionLabel t={t}>Journal</SectionLabel>
        <Row t={t} label="Evening prompt"
          sub="Quiet nudge at 9 pm to reflect on the day's trades."
          control={<Toggle t={t} on />} />
        <Row t={t} label="Weekly review"
          sub="A Sunday digest with the week's equity, wins, and one thing to keep."
          control={<Toggle t={t} on />} />

        <SectionLabel t={t}>The boring bits</SectionLabel>
        <Row t={t} label="Export trades"
          sub="A CSV of everything you've logged."
          control={<GhostButton t={t} onClick={handleExport}>Export</GhostButton>} />
        <Row t={t} label="Sign out"
          sub="See you tomorrow."
          control={<GhostButton t={t} onClick={onSignOut}>Sign out</GhostButton>} />
      </div>
    </div>
  );
}
