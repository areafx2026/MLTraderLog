import { useState, useRef } from 'react';

const CURRENCIES = ['USD','EUR','GBP','JPY','CHF','AUD','CAD','NZD','SGD','HKD'];
import { LANGUAGES } from '../i18n.js';

function Row({ t, label, sub, control }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '20px 0', borderBottom: `1px solid ${t.rule}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: t.serif, fontSize: 18, color: t.ink, lineHeight: 1.2 }}>
          {label}
        </div>
        {sub && (
          <div style={{
            fontSize: 13, color: t.ink2, marginTop: 4,
            fontFamily: t.serif, fontStyle: 'italic',
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
      fontFamily: t.serif, fontStyle: 'italic', fontSize: 14,
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
        const useGradient = on && !!t.gradientPrimary;
        return (
          <button key={o.id} onClick={() => onChange(o.id)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13,
              fontFamily: t.sans, border: 'none', cursor: 'pointer',
              background: useGradient
                ? t.gradientPrimary
                : on ? t.ink : 'transparent',
              color: on ? (useGradient ? '#fff' : t.inkInk) : t.ink2,
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
        padding: '11px 16px', borderRadius: 999, fontFamily: t.sans,
        fontWeight: 500, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
      {children}
    </button>
  );
}

export default function Settings({ t, resolvedMode, design, mode, onSetDesign, onSetMode, view, onChangeView, user, onSignOut, onNavigate, token, lang, onChangeLang, accountCurrency, accountBalance, onSaveAccount }) {
  const [currency, setCurrency] = useState(accountCurrency || 'EUR');
  const [balanceInput, setBalanceInput] = useState(String(accountBalance ?? 0));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef(null);

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currency, balance: parseFloat(balanceInput) || 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        onSaveAccount(data.accountCurrency, data.accountBalance);
        setSaved(true);
        clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

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
          fontFamily: t.serif, fontWeight: 400, fontSize: 44, margin: 0,
          letterSpacing: -0.8, lineHeight: 1.05, color: t.ink,
        }}>Settings</h1>
      </header>

      <div style={{ maxWidth: 720 }}>
        <SectionLabel t={t}>Language</SectionLabel>
        <Row t={t} label="Language"
          sub="Choose the interface language. More languages coming soon."
          control={
            <Seg t={t} value={lang}
              options={LANGUAGES.map(l => ({ id: l.id, label: l.label }))}
              onChange={onChangeLang} />
          } />

        <SectionLabel t={t}>Appearance</SectionLabel>
        <Row t={t} label="Design"
          sub="Linen: warm serif surfaces. Hyper: glass and gradient."
          control={
            <Seg t={t} value={design}
              options={[
                { id: 'linen', label: 'Linen' },
                { id: 'hyper', label: 'Hyper' },
              ]}
              onChange={onSetDesign} />
          } />
        <Row t={t} label="Mode"
          sub="Light, dark, or follow your system setting."
          control={
            <Seg t={t} value={mode}
              options={[
                { id: 'light', label: 'Light' },
                { id: 'system', label: 'Auto' },
                { id: 'dark', label: 'Dark' },
              ]}
              onChange={onSetMode} />
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
        <Row t={t} label="Account currency"
          sub="The currency you trade and log P&L in."
          control={
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{
                background: t.isGlass ? t.pane : t.paper,
                color: t.ink, border: `1px solid ${t.rule2}`,
                borderRadius: 999, padding: '8px 14px', fontFamily: t.sans,
                fontSize: 13, cursor: 'pointer', outline: 'none',
              }}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          } />
        <Row t={t} label="Starting balance"
          sub="Your account size. Changes to reflect deposits or withdrawals."
          control={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: t.sans, fontSize: 13, color: t.ink2 }}>{currency}</span>
              <input
                type="number"
                value={balanceInput}
                onChange={e => setBalanceInput(e.target.value)}
                style={{
                  background: t.isGlass ? t.pane : t.paper,
                  color: t.ink, border: `1px solid ${t.rule2}`,
                  borderRadius: 8, padding: '8px 12px', fontFamily: t.mono,
                  fontSize: 13, outline: 'none', width: 120,
                  textAlign: 'right',
                }} />
              <button
                onClick={handleSaveAccount}
                disabled={saving}
                style={{
                  background: saved ? t.win : (t.gradientPrimary || t.accent),
                  color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: 999, fontFamily: t.sans,
                  fontWeight: 500, fontSize: 13, cursor: saving ? 'default' : 'pointer',
                  whiteSpace: 'nowrap', opacity: saving ? 0.6 : 1,
                  transition: 'background .2s',
                }}>
                {saved ? 'Saved ✓' : saving ? '…' : 'Save'}
              </button>
            </div>
          } />

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
        <Row t={t} label="Delete account"
          sub="Permanently delete your account and all trade data."
          control={
            <button onClick={() => onNavigate('delete-account')}
              style={{
                background: 'transparent', color: t.loss,
                border: `1px solid ${t.loss}`,
                padding: '11px 16px', borderRadius: 999, fontFamily: t.sans,
                fontWeight: 500, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                opacity: 0.8,
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}>
              Delete account
            </button>
          } />
      </div>
    </div>
  );
}
