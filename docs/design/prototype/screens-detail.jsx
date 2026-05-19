// Forex Log — Trade detail + Add trade + Settings screens (theme-aware).

// ────────────────────────── Trade detail ──────────────────────────
function TradeDetailScreen({ t, tradeId, onBack }) {
  const { trades } = window.FX;
  const tr = trades.find((x) => x.id === tradeId) || trades[0];
  const isWin = tr.pl > 0, isLoss = tr.pl < 0;
  const plColor = tr.pl === 0 ? t.ink3 : tr.pl > 0 ? t.win : t.loss;
  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0 }}>
      <button onClick={onBack}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, color: t.ink3, padding: 0, marginBottom: 18,
          fontFamily: FONTS.sans }}>
        ← Trades
      </button>

      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        paddingBottom: 22, marginBottom: 28, borderBottom: `1px solid ${t.rule2}`, gap: 24 }}>
        <div>
          <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', color: t.ink2,
            fontSize: 14, marginBottom: 6 }}>
            Trade #{tr.id} · {tr.date.slice(5)}, {tr.time}
          </div>
          <h1 style={{ fontFamily: FONTS.serif, fontWeight: 400, fontSize: 48, margin: 0,
            letterSpacing: -0.8, lineHeight: 1, color: t.ink }}>
            {tr.pair} <span style={{ fontStyle: 'italic', color: t.ink2 }}>{tr.side}</span>
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FONTS.serif, fontWeight: 500, fontSize: 44,
            color: plColor, letterSpacing: -0.5, lineHeight: 1 }}>
            {tr.pl === 0 ? '—' : (isWin ? `+$${tr.pl}` : `–$${Math.abs(tr.pl)}`)}
          </div>
          <div style={{ fontSize: 13, color: t.ink2, marginTop: 6 }}>
            {tr.pips > 0 ? '+' : ''}{tr.pips} pips · {tr.rr}R · {tr.size} lots
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48 }}>
        <div>
          <div style={{ background: t.paper, border: `1px solid ${t.rule}`,
            borderRadius: 4, padding: 24, marginBottom: 24 }}>
            <TradeChart t={t} height={220} />
          </div>

          {/* reflection */}
          <div>
            <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14,
              color: t.ink2, marginBottom: 12 }}>Reflection</div>
            <p style={{ fontFamily: FONTS.serif, fontSize: 19, lineHeight: 1.6, margin: 0,
              color: t.ink, maxWidth: '60ch' }}>
              {tr.note} The level held exactly where it should have — and I watched
              it from the kitchen rather than from the chair. Trailed stop above the
              previous high once the second leg was in. Out at the daily pivot, which
              was the plan.
            </p>
            <p style={{ fontFamily: FONTS.serif, fontSize: 19, lineHeight: 1.6,
              color: t.ink2, fontStyle: 'italic', maxWidth: '60ch', marginTop: 14 }}>
              Note for next week: don't add to a winner that's already at target.
            </p>
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 22, fontSize: 13 }}>
          {[
            ['Setup',      tr.tag],
            ['Direction',  `${tr.side.charAt(0).toUpperCase() + tr.side.slice(1)} · ${tr.size} lots`],
            ['Entry',      tr.entry.toFixed(tr.pair.includes('JPY') ? 2 : 4)],
            ['Exit',       tr.exit.toFixed(tr.pair.includes('JPY') ? 2 : 4)],
            ['Stop',       '1.0820 · 22 pips'],
            ['Risk',       '0.8% of account'],
            ['R-multiple', `${tr.rr ? '+' : ''}${tr.rr} R`],
            ['Mood',       tr.mood.charAt(0).toUpperCase() + tr.mood.slice(1)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
              borderBottom: `1px solid ${t.rule}`, paddingBottom: 10, gap: 12 }}>
              <span style={{ color: t.ink2, fontFamily: FONTS.serif, fontStyle: 'italic',
                whiteSpace: 'nowrap' }}>{k}</span>
              <span style={{ color: t.ink, fontFamily: FONTS.serif, fontWeight: 500,
                whiteSpace: 'nowrap', textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

// ────────────────────────── Add trade ──────────────────────────
function AddTradeScreen({ t, onCancel, onSave }) {
  // Lightweight controlled fields — feels real without a backend.
  const [form, setForm] = React.useState({
    pair: 'EUR / USD', side: 'Long', entry: '1.0842', exit: '1.0901',
    stop: '1.0820', size: '1.50', setup: 'London breakout', mood: 'Calm', note: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const Field = ({ k, label, sub, w = 1 }) => (
    <div style={{ gridColumn: `span ${w}`, borderBottom: `1px solid ${t.rule2}`,
      paddingBottom: 14 }}>
      <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12,
        color: t.ink2, marginBottom: 8, letterSpacing: 0.2 }}>{label}</div>
      <input value={form[k]} onChange={(e) => set(k, e.target.value)}
        placeholder="add"
        style={{ background: 'transparent', border: 'none', outline: 'none',
          fontFamily: FONTS.serif, fontSize: 26, color: form[k] ? t.ink : t.ink3,
          letterSpacing: -0.3, width: '100%', padding: 0,
          fontStyle: form[k] ? 'normal' : 'italic' }} />
      {sub && <div style={{ fontSize: 11, color: t.ink3, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0,
      display: 'flex', flexDirection: 'column' }}>
      <button onClick={onCancel}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, color: t.ink3, padding: 0, marginBottom: 18,
          fontFamily: FONTS.sans, alignSelf: 'flex-start' }}>
        ← Trades
      </button>

      <h1 style={{ fontFamily: FONTS.serif, fontWeight: 400, fontSize: 44,
        margin: '0 0 6px', letterSpacing: -0.8, color: t.ink }}>
        A new trade.
      </h1>
      <p style={{ fontFamily: FONTS.serif, fontStyle: 'italic', color: t.ink2,
        fontSize: 16, margin: '0 0 36px' }}>Tell me about it.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 64px',
        maxWidth: 820 }}>
        <Field k="pair"  label="Pair" />
        <Field k="side"  label="Direction" />
        <Field k="entry" label="Entry" />
        <Field k="exit"  label="Exit"  sub="or leave blank if still open" />
        <Field k="stop"  label="Stop"  sub="22 pips of risk" />
        <Field k="size"  label="Size"  sub="lots · 0.8% of account" />
        <Field k="setup" label="Setup" />
        <Field k="mood"  label="Mood" />
      </div>

      <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${t.rule2}`,
        maxWidth: 820 }}>
        <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12,
          color: t.ink2, marginBottom: 12, letterSpacing: 0.2 }}>A few notes</div>
        <textarea value={form.note} onChange={(e) => set('note', e.target.value)}
          placeholder="What were you watching? How did it feel?…"
          rows={4}
          style={{ background: 'transparent', border: 'none', outline: 'none',
            fontFamily: FONTS.serif, fontSize: 19, color: form.note ? t.ink : t.ink3,
            fontStyle: form.note ? 'normal' : 'italic',
            lineHeight: 1.6, width: '100%', resize: 'none', padding: 0 }} />
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: 12, paddingTop: 28,
        alignItems: 'center' }}>
        <PrimaryButton t={t} onClick={onSave}>Save trade</PrimaryButton>
        <button onClick={onCancel}
          style={{ background: 'transparent', color: t.ink2, border: 'none',
            padding: '12px 16px', fontFamily: FONTS.sans, fontSize: 14, cursor: 'pointer' }}>
          Save draft
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: t.ink3,
          fontFamily: FONTS.serif, fontStyle: 'italic' }}>⌘↵ to save</span>
      </div>
    </div>
  );
}

// ────────────────────────── Settings ──────────────────────────
function SettingsScreen({ t, mode, onToggleMode, view, onChangeView }) {
  const Row = ({ label, sub, control }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24,
      padding: '20px 0', borderBottom: `1px solid ${t.rule}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONTS.serif, fontSize: 18, color: t.ink, lineHeight: 1.2 }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 13, color: t.ink2, marginTop: 4,
          fontFamily: FONTS.serif, fontStyle: 'italic' }}>{sub}</div>}
      </div>
      <div>{control}</div>
    </div>
  );

  const Seg = ({ value, options, onChange }) => (
    <span style={{ display: 'inline-flex', borderRadius: 999,
      border: `1px solid ${t.rule2}`, padding: 2 }}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)}
            style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13,
              fontFamily: FONTS.sans, border: 'none', cursor: 'pointer',
              background: on ? t.ink : 'transparent',
              color:      on ? t.inkInk : t.ink2 }}>
            {o.label}
          </button>
        );
      })}
    </span>
  );

  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0 }}>
      <Header t={t} title="Settings" />

      <div style={{ maxWidth: 720 }}>
        <SectionHeader t={t}>Appearance</SectionHeader>
        <Row label="Theme"
          sub="Linen by day, Dusk by night. Both calm — pick whichever matches the room you're in."
          control={
            <Seg value={mode}
              options={[{ id: 'light', label: 'Linen' }, { id: 'dark', label: 'Dusk' }]}
              onChange={onToggleMode} />
          } />
        <Row label="Default trade view"
          sub="How Trades opens by default. You can always flip at the top."
          control={
            <Seg value={view}
              options={[{ id: 'list', label: 'List' }, { id: 'cards', label: 'Cards' }]}
              onChange={onChangeView} />
          } />

        <SectionHeader t={t}>Account</SectionHeader>
        <Row label="Display currency"
          sub="USD — used for P&L and balance."
          control={<GhostButton t={t}>Change</GhostButton>} />
        <Row label="Risk per trade"
          sub="0.8% of account, applied when you fill out the form."
          control={<GhostButton t={t}>Adjust</GhostButton>} />

        <SectionHeader t={t}>Journal</SectionHeader>
        <Row label="Evening prompt"
          sub="Quiet nudge at 9pm to reflect on the day's trades."
          control={<Toggle t={t} on />} />
        <Row label="Weekly review"
          sub="A Sunday digest with the week's equity, wins, and one thing to keep."
          control={<Toggle t={t} on />} />

        <SectionHeader t={t}>The boring bits</SectionHeader>
        <Row label="Export trades"
          sub="A CSV of everything you've logged."
          control={<GhostButton t={t}>Export</GhostButton>} />
        <Row label="Sign out"
          sub="See you tomorrow."
          control={<GhostButton t={t}>Sign out</GhostButton>} />
      </div>
    </div>
  );
}

function SectionHeader({ t, children }) {
  return (
    <h2 style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14,
      color: t.ink2, fontWeight: 400, margin: '36px 0 4px',
      letterSpacing: 0.2 }}>{children}</h2>
  );
}

function Toggle({ t, on: initial }) {
  const [on, setOn] = React.useState(!!initial);
  return (
    <button onClick={() => setOn((v) => !v)} aria-pressed={on}
      style={{ width: 40, height: 24, padding: 2, border: 'none',
        borderRadius: 999, cursor: 'pointer',
        background: on ? t.accent : t.rule2, transition: 'background .18s',
        display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%',
        background: t.paper,
        transform: on ? 'translateX(16px)' : 'translateX(0)',
        transition: 'transform .18s',
        boxShadow: '0 1px 2px rgba(0,0,0,.15)' }} />
    </button>
  );
}

Object.assign(window, { TradeDetailScreen, AddTradeScreen, SettingsScreen });
