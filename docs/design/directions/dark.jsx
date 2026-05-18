// Direction 4 — Dusk
// Warm dark sanctuary: never pure black, never neon. Big breathing room,
// numbers in light weight, copper highlight for what matters. Less a
// dashboard, more a quiet room you visit at the end of the day.

const dusk = {
  bg: '#181a18',
  card: '#1f2220',
  card2: '#262a27',
  ink: '#e9e3d4',
  ink2: '#9a948a',
  ink3: '#5e5b54',
  rule: 'rgba(255,245,225,.06)',
  rule2: 'rgba(255,245,225,.10)',
  win: '#9ab891',
  loss: '#c98363',
  accent: '#c98363',
  sans: '"Inter", system-ui, sans-serif',
  display: '"Instrument Serif", "Newsreader", Georgia, serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',
};

const DuskShell = ({ active, children }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex',
    background: dusk.bg, color: dusk.ink, fontFamily: dusk.sans, fontSize: 14 }}>
    <aside style={{ width: 76, padding: '24px 0',
      borderRight: `1px solid ${dusk.rule}`, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 6 }}>
      <div style={{ width: 36, height: 36, marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" stroke={dusk.accent} strokeWidth="1.4" />
          <path d="M5 13c2-3 4-3 6 0s4 3 6 0" stroke={dusk.ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      {[
        { n: 'Today', icon: 'M3 9h14M5 5l1-2h8l1 2M5 5v12a2 2 0 002 2h6a2 2 0 002-2V5' },
        { n: 'Trades', icon: 'M3 5h14M3 10h14M3 15h14' },
        { n: 'Journal', icon: 'M5 3h10v14l-5-3-5 3V3z' },
        { n: 'Insights', icon: 'M3 16l4-5 3 3 5-7' },
        { n: 'Settings', icon: 'M10 13a3 3 0 100-6 3 3 0 000 6zM10 2v2M10 16v2M4.2 4.2l1.5 1.5M14.3 14.3l1.5 1.5M2 10h2M16 10h2M4.2 15.8l1.5-1.5M14.3 5.7l1.5-1.5' },
      ].map((it, i) => (
        <button key={it.n} title={it.n} style={{ width: 44, height: 44, borderRadius: 10,
          border: 'none', cursor: 'pointer',
          background: i === active ? dusk.card2 : 'transparent',
          color: i === active ? dusk.ink : dusk.ink2,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d={it.icon} />
          </svg>
        </button>
      ))}
      <div style={{ marginTop: 'auto', width: 32, height: 32, borderRadius: '50%',
        background: dusk.card2, border: `1px solid ${dusk.rule2}` }} />
    </aside>
    {children}
  </div>
);

// ────────────────────────── Dashboard ──────────────────────────
function DuskDashboard() {
  const { equity, trades, summary, pathFor, areaFor } = window.FX;
  const W = 820, H = 240;
  return (
    <DuskShell active={0}>
      <main style={{ flex: 1, padding: '64px 72px 48px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column' }}>
        <header style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: dusk.mono, fontSize: 11, color: dusk.ink3,
            textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 18 }}>
            Sunday · 17 May · evening
          </div>
          <h1 style={{ fontFamily: dusk.display, fontSize: 56, fontWeight: 400, margin: 0,
            letterSpacing: -1, lineHeight: 1, color: dusk.ink }}>
            Good evening. <span style={{ fontStyle: 'italic', color: dusk.ink2 }}>You're up
            <span style={{ color: dusk.win, fontWeight: 500 }}> $2,115 </span>
            this month.</span>
          </h1>
        </header>

        {/* big equity figure + curve */}
        <section style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 56,
          alignItems: 'center', marginBottom: 56 }}>
          <div>
            <div style={{ fontFamily: dusk.mono, fontSize: 11, color: dusk.ink3,
              textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Account</div>
            <div style={{ fontFamily: dusk.display, fontSize: 64, fontWeight: 400,
              letterSpacing: -1.2, lineHeight: 1 }}>
              ${summary.balance.toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 16,
              fontFamily: dusk.mono, fontSize: 12, color: dusk.ink2 }}>
              <span style={{ color: dusk.win }}>↑ +17.4%</span>
              <span>30 d</span>
              <span>· dd −1.8%</span>
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
            <defs>
              <linearGradient id="dusk-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={dusk.accent} stopOpacity="0.20" />
                <stop offset="1" stopColor={dusk.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaFor(equity, W, H, 6)} fill="url(#dusk-area)" />
            <path d={pathFor(equity, W, H, 6)} fill="none" stroke={dusk.accent}
              strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={W - 6} cy={6} r={4} fill={dusk.accent} />
          </svg>
        </section>

        {/* divider + quiet stats */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48,
          paddingTop: 32, borderTop: `1px solid ${dusk.rule2}` }}>
          {[
            { k: 'Win rate',      v: '70',  unit: '%',   sub: '7 of 10 trades' },
            { k: 'Average R',     v: '1.6', unit: 'R',   sub: 'against 1.5 target' },
            { k: 'Pips, month',   v: '+251',unit: '',    sub: 'EUR/USD strongest' },
            { k: 'Streak',        v: '4',   unit: ' days', sub: 'a kind week' },
          ].map((s) => (
            <div key={s.k}>
              <div style={{ fontFamily: dusk.mono, fontSize: 10.5, color: dusk.ink3,
                textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12 }}>{s.k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: dusk.display, fontSize: 44, fontWeight: 400,
                  letterSpacing: -0.8, lineHeight: 1 }}>{s.v}</span>
                <span style={{ fontFamily: dusk.display, fontSize: 22, color: dusk.ink2,
                  fontStyle: 'italic' }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: dusk.ink3, marginTop: 10,
                fontStyle: 'italic', fontFamily: dusk.display }}>{s.sub}</div>
            </div>
          ))}
        </section>

        {/* a single line about today */}
        <section style={{ marginTop: 'auto', paddingTop: 36,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontFamily: dusk.display, fontStyle: 'italic', fontSize: 22,
            color: dusk.ink2, maxWidth: '36ch' }}>
            "{trades[0].note.split('.')[0]}."
          </div>
          <button style={{ background: dusk.accent, color: dusk.bg, border: 'none',
            padding: '13px 26px', borderRadius: 999, fontFamily: dusk.sans, fontWeight: 600,
            fontSize: 14, letterSpacing: 0.2, cursor: 'pointer' }}>
            Log tonight's trade
          </button>
        </section>
      </main>
    </DuskShell>
  );
}

// ────────────────────────── Trade log ──────────────────────────
function DuskTradeLog({ view }) {
  const { trades } = window.FX;
  const Pl = ({ pl }) => (
    <span style={{ fontFamily: dusk.mono, fontWeight: 500, fontSize: 14,
      color: pl === 0 ? dusk.ink3 : pl > 0 ? dusk.win : dusk.loss }}>
      {pl > 0 ? '+' : pl < 0 ? '−' : ''}{pl === 0 ? '0' : `$${Math.abs(pl)}`}
    </span>
  );

  // group by month for list view
  const grouped = [
    { label: 'This week',  ids: ['0247', '0246', '0245', '0244'] },
    { label: 'Last week',  ids: ['0243', '0242', '0241'] },
    { label: 'Earlier',    ids: ['0240', '0239', '0238'] },
  ];

  return (
    <DuskShell active={1}>
      <main style={{ flex: 1, padding: '56px 72px 48px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: dusk.mono, fontSize: 11, color: dusk.ink3,
              textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>
              Trades · May 2026
            </div>
            <h1 style={{ fontFamily: dusk.display, fontSize: 48, fontWeight: 400, margin: 0,
              letterSpacing: -1, lineHeight: 1 }}>
              Ten trades, <span style={{ fontStyle: 'italic', color: dusk.ink2 }}>kindly kept.</span>
            </h1>
          </div>
          <div style={{ display: 'inline-flex', background: dusk.card,
            border: `1px solid ${dusk.rule2}`, borderRadius: 999, padding: 3 }}>
            {['List', 'Cards'].map((m) => (
              <span key={m} style={{ padding: '7px 18px', borderRadius: 999, fontSize: 12,
                fontWeight: 500,
                background: (m === 'Cards' ? view === 'cards' : view === 'list') ? dusk.card2 : 'transparent',
                color:      (m === 'Cards' ? view === 'cards' : view === 'list') ? dusk.ink : dusk.ink2 }}>{m}</span>
            ))}
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'hidden' }}>
        {view === 'list' ? (
          <div>
            {grouped.map((g) => (
              <div key={g.label} style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: dusk.display, fontStyle: 'italic', fontSize: 18,
                  color: dusk.ink2, marginBottom: 10 }}>{g.label}</div>
                {g.ids.map((id) => {
                  const t = trades.find(x => x.id === id); if (!t) return null;
                  return (
                    <div key={t.id} style={{ display: 'grid',
                      gridTemplateColumns: '60px 100px 1fr 90px 110px',
                      gap: 24, alignItems: 'center', padding: '14px 0',
                      borderBottom: `1px solid ${dusk.rule}` }}>
                      <span style={{ fontFamily: dusk.mono, fontSize: 12, color: dusk.ink3 }}>
                        {t.date.slice(8)} May
                      </span>
                      <span style={{ fontFamily: dusk.mono, fontSize: 14, fontWeight: 500 }}>{t.pair}</span>
                      <span style={{ fontFamily: dusk.display, fontStyle: 'italic',
                        fontSize: 16, color: dusk.ink, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.tag}
                      </span>
                      <span style={{ fontFamily: dusk.mono, fontSize: 12, color: dusk.ink2, textAlign: 'right' }}>
                        {t.pips > 0 ? '+' : ''}{t.pips}p · {t.rr}R
                      </span>
                      <span style={{ textAlign: 'right' }}><Pl pl={t.pl}/></span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
            alignContent: 'start' }}>
            {trades.slice(0, 9).map((t) => (
              <div key={t.id} style={{ background: dusk.card, border: `1px solid ${dusk.rule}`,
                borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 12,
                minHeight: 168 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: dusk.mono, fontSize: 13, fontWeight: 500 }}>{t.pair}</span>
                  <span style={{ fontFamily: dusk.mono, fontSize: 10, color: dusk.ink3,
                    textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    {t.side}
                  </span>
                </div>
                <div style={{ fontFamily: dusk.display, fontSize: 36, fontWeight: 400,
                  letterSpacing: -0.6, lineHeight: 1,
                  color: t.pl === 0 ? dusk.ink3 : t.pl > 0 ? dusk.win : dusk.loss }}>
                  {t.pl === 0 ? '—' : t.pl > 0 ? `+${t.pl}` : `−${Math.abs(t.pl)}`}
                </div>
                <div style={{ fontFamily: dusk.display, fontStyle: 'italic',
                  fontSize: 14, color: dusk.ink2 }}>{t.tag}</div>
                <div style={{ marginTop: 'auto', display: 'flex',
                  justifyContent: 'space-between', fontFamily: dusk.mono, fontSize: 10.5,
                  color: dusk.ink3, letterSpacing: 1 }}>
                  <span>{t.date.slice(5)} · {t.time}</span>
                  <span>{t.pips > 0 ? '+' : ''}{t.pips}p</span>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </DuskShell>
  );
}

// ────────────────────────── Trade detail ──────────────────────────
function DuskTradeDetail() {
  const { trades, pathFor } = window.FX;
  const t = trades[0];
  const pts = [
    { d: 0, v: 1.0830 }, { d: 1, v: 1.0835 }, { d: 2, v: 1.0828 }, { d: 3, v: 1.0842 },
    { d: 4, v: 1.0840 }, { d: 5, v: 1.0851 }, { d: 6, v: 1.0865 }, { d: 7, v: 1.0858 },
    { d: 8, v: 1.0876 }, { d: 9, v: 1.0884 }, { d:10, v: 1.0892 }, { d:11, v: 1.0901 },
    { d:12, v: 1.0898 },
  ];
  return (
    <DuskShell active={1}>
      <main style={{ flex: 1, padding: '52px 72px 48px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: dusk.mono, fontSize: 11, color: dusk.ink3,
          textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>
          ← Trades · 17 May, 09:42
        </div>

        <header style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40,
          alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: dusk.display, fontSize: 64, fontWeight: 400, margin: 0,
              letterSpacing: -1.2, lineHeight: 0.95 }}>
              EUR/USD <span style={{ fontStyle: 'italic', color: dusk.ink2 }}>·</span>
              <br /><span style={{ fontStyle: 'italic' }}>a calm long.</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: dusk.display, fontSize: 56, fontWeight: 400,
              color: dusk.win, letterSpacing: -1, lineHeight: 1 }}>+$442</div>
            <div style={{ fontFamily: dusk.mono, fontSize: 12, color: dusk.ink2, marginTop: 6, letterSpacing: 1 }}>
              +59 pips · 2.3R · 1.50 lots
            </div>
          </div>
        </header>

        {/* chart */}
        <section style={{ marginBottom: 36 }}>
          <svg viewBox="0 0 980 200" width="100%" height="200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dusk-d-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={dusk.accent} stopOpacity="0.16" />
                <stop offset="1" stopColor={dusk.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((p) => (
              <line key={p} x1={0} x2={980} y1={200 * p} y2={200 * p} stroke={dusk.rule} strokeDasharray="2 5" />
            ))}
            <line x1={3*76+6} x2={3*76+6} y1={0} y2={200} stroke={dusk.ink3} strokeDasharray="2 4" />
            <line x1={11*76+6} x2={11*76+6} y1={0} y2={200} stroke={dusk.win} strokeDasharray="2 4" opacity="0.6" />
            <path d={`${pathFor(pts, 980, 200, 6)} L${980-6},${200-6} L6,${200-6} Z`} fill="url(#dusk-d-area)" />
            <path d={pathFor(pts, 980, 200, 6)} fill="none" stroke={dusk.accent}
              strokeWidth="1.6" strokeLinejoin="round" />
            <text x={3*76+12} y={18} fill={dusk.ink2} fontSize="11"
              fontFamily={dusk.mono} letterSpacing="1.5">ENTRY 1.0842</text>
            <text x={11*76+12} y={18} fill={dusk.win} fontSize="11"
              fontFamily={dusk.mono} letterSpacing="1.5">EXIT 1.0901</text>
          </svg>
        </section>

        {/* note + meta */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 60 }}>
          <div>
            <div style={{ fontFamily: dusk.mono, fontSize: 11, color: dusk.ink3,
              textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 18 }}>Reflection</div>
            <p style={{ fontFamily: dusk.display, fontSize: 26, fontStyle: 'italic',
              lineHeight: 1.4, margin: 0, color: dusk.ink, maxWidth: '36ch', letterSpacing: -0.3 }}>
              "Patient entry after the retest. Watched it from the kitchen
              rather than the chair. Trailed once the second leg held, and out
              at the pivot — which was the plan."
            </p>
            <p style={{ marginTop: 24, fontFamily: dusk.sans, fontSize: 14, color: dusk.ink2,
              lineHeight: 1.65, maxWidth: '52ch' }}>
              For next week: don't add to a winner that's already at target. The
              urge was there at 1.0888 and I am proud I sat with the urge instead of acting.
            </p>
          </div>
          <aside style={{ background: dusk.card, border: `1px solid ${dusk.rule}`, borderRadius: 14,
            padding: 22 }}>
            {[
              ['Setup',     'London breakout'],
              ['Entry',     '1.0842'],
              ['Exit',      '1.0901'],
              ['Stop',      '1.0820'],
              ['Risk',      '0.8% account'],
              ['R-multiple','+2.3 R'],
              ['Mood',      'Calm'],
              ['Session',   'London'],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${dusk.rule}`,
                fontSize: 12 }}>
                <span style={{ color: dusk.ink2, fontStyle: 'italic',
                  fontFamily: dusk.display, fontSize: 15 }}>{k}</span>
                <span style={{ fontFamily: dusk.mono, color: dusk.ink, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </aside>
        </section>
      </main>
    </DuskShell>
  );
}

// ────────────────────────── Add trade ──────────────────────────
function DuskAddTrade() {
  const Field = ({ label, value, sub, ph }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8,
      borderBottom: `1px solid ${dusk.rule}`, paddingBottom: 14 }}>
      <span style={{ fontFamily: dusk.mono, fontSize: 10.5, color: dusk.ink3,
        textTransform: 'uppercase', letterSpacing: 2.5 }}>{label}</span>
      <span style={{ fontFamily: dusk.display,
        fontSize: 28, color: value ? dusk.ink : dusk.ink3,
        fontStyle: value ? 'normal' : 'italic', letterSpacing: -0.4 }}>
        {value || ph}
      </span>
      {sub && <span style={{ fontSize: 11, color: dusk.ink3 }}>{sub}</span>}
    </label>
  );
  return (
    <DuskShell active={1}>
      <main style={{ flex: 1, padding: '56px 72px 40px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: dusk.mono, fontSize: 11, color: dusk.ink3,
          textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>
          New trade
        </div>
        <h1 style={{ fontFamily: dusk.display, fontSize: 52, fontWeight: 400, margin: 0,
          letterSpacing: -1, lineHeight: 1 }}>
          Tell me about it, <span style={{ fontStyle: 'italic', color: dusk.ink2 }}>plainly.</span>
        </h1>

        <div style={{ marginTop: 44, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '28px 56px', maxWidth: 920 }}>
          <Field label="Pair"     value="EUR/USD" />
          <Field label="Side"     value="Long" />
          <Field label="Size"     value="1.50" sub="lots · 0.8% of account" />
          <Field label="Setup"    value="London breakout" />
          <Field label="Entry"    value="1.0842" />
          <Field label="Stop"     value="1.0820" sub="22 pips of risk" />
          <Field label="Exit"     value="1.0901" sub="+59 pips · 2.3R" />
          <Field label="Mood"     value="Calm" />
        </div>

        <div style={{ marginTop: 36, paddingTop: 22,
          borderTop: `1px solid ${dusk.rule2}`, maxWidth: 920 }}>
          <div style={{ fontFamily: dusk.mono, fontSize: 10.5, color: dusk.ink3,
            textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>A few notes</div>
          <div style={{ fontFamily: dusk.display, fontStyle: 'italic',
            fontSize: 22, color: dusk.ink3, lineHeight: 1.5 }}>
            What were you watching? How did it feel? …
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14, paddingTop: 28 }}>
          <button style={{ background: dusk.accent, color: dusk.bg, border: 'none',
            padding: '12px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14,
            letterSpacing: 0.2, cursor: 'pointer' }}>Save trade</button>
          <button style={{ background: 'transparent', color: dusk.ink2,
            border: `1px solid ${dusk.rule2}`, padding: '12px 18px', borderRadius: 999,
            fontSize: 14, cursor: 'pointer' }}>Save & add another</button>
          <div style={{ marginLeft: 'auto', fontFamily: dusk.mono, fontSize: 11,
            color: dusk.ink3, letterSpacing: 1 }}>⌘↵ to save</div>
        </div>
      </main>
    </DuskShell>
  );
}

window.Dusk = { Dashboard: DuskDashboard, TradeLog: DuskTradeLog, TradeDetail: DuskTradeDetail, AddTrade: DuskAddTrade };
