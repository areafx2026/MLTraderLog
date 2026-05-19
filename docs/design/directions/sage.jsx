// Direction 2 — Sage
// Soft sage greens + warm clay. Modern geometric sans throughout. Things-3 /
// Linear density: tight, calm, precise. A toolbar app, not a diary.

const sage = {
  bg: '#f3f5ef',
  card: '#fbfcf8',
  ink: '#1f2820',
  ink2: '#5a6358',
  ink3: '#9aa094',
  rule: 'rgba(40,60,40,.08)',
  rule2: 'rgba(40,60,40,.14)',
  win: '#638268',
  loss: '#b07057',
  accent: '#638268',
  sans: '"Geist", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',
};

const Tag = ({ tone = 'neutral', children }) => {
  const tones = {
    win:  { bg: 'rgba(99,130,104,.12)', fg: sage.win  },
    loss: { bg: 'rgba(176,112,87,.14)', fg: sage.loss },
    neutral: { bg: 'rgba(40,60,40,.06)', fg: sage.ink2 },
  };
  const c = tones[tone];
  return <span style={{ background: c.bg, color: c.fg, fontSize: 11,
    fontWeight: 500, padding: '2px 8px', borderRadius: 4 }}>{children}</span>;
};

const SageShell = ({ active, children }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex',
    background: sage.bg, color: sage.ink, fontFamily: sage.sans, fontSize: 13 }}>
    <aside style={{ width: 184, padding: '20px 14px',
      borderRight: `1px solid ${sage.rule}`, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px' }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: sage.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: sage.card, fontWeight: 700, fontSize: 12 }}>↗</div>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -0.2 }}>Drift</span>
      </div>
      <button style={{ display: 'flex', alignItems: 'center', gap: 8,
        background: sage.card, border: `1px solid ${sage.rule2}`, color: sage.ink,
        borderRadius: 8, padding: '8px 10px', fontWeight: 500, fontSize: 13,
        cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ color: sage.accent, fontSize: 15 }}>+</span> New trade
        <span style={{ marginLeft: 'auto', fontFamily: sage.mono, color: sage.ink3, fontSize: 11 }}>⌘ N</span>
      </button>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: 13 }}>
        {[
          ['Today',     '4'],
          ['All trades','127'],
          ['Open',      '1'],
          ['Tags',       null],
          ['Insights',   null],
        ].map(([n, c], i) => (
          <a key={n} href="#" style={{
            display: 'flex', alignItems: 'center', padding: '6px 8px',
            borderRadius: 6, color: i === active ? sage.ink : sage.ink2,
            background: i === active ? 'rgba(40,60,40,.06)' : 'transparent',
            fontWeight: i === active ? 600 : 400, textDecoration: 'none' }}>
            <span>{n}</span>
            {c && <span style={{ marginLeft: 'auto', color: sage.ink3, fontFamily: sage.mono, fontSize: 11 }}>{c}</span>}
          </a>
        ))}
      </nav>
      <div style={{ marginTop: 6, fontSize: 11, color: sage.ink3,
        textTransform: 'uppercase', letterSpacing: 1.2, padding: '0 8px' }}>Pairs</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: -10 }}>
        {['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'].map((n) => (
          <a key={n} href="#" style={{ padding: '5px 8px', borderRadius: 6,
            color: sage.ink2, textDecoration: 'none', fontFamily: sage.mono, fontSize: 12 }}>{n}</a>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px', borderRadius: 8, background: 'rgba(40,60,40,.04)' }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: sage.ink2 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Marin K.</div>
          <div style={{ fontSize: 11, color: sage.ink3 }}>Pro · Plan</div>
        </div>
      </div>
    </aside>
    {children}
  </div>
);

// ────────────────────────── Dashboard ──────────────────────────
function SageDashboard() {
  const { equity, trades, summary, pathFor, areaFor } = window.FX;
  return (
    <SageShell active={0}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* topbar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 28px',
          borderBottom: `1px solid ${sage.rule}`, gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Today</div>
          <div style={{ fontSize: 12, color: sage.ink3 }}>Sunday, May 17</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'inline-flex', gap: 0,
            border: `1px solid ${sage.rule2}`, borderRadius: 6, padding: 2, fontSize: 12 }}>
            {['Day', 'Week', 'Month', 'Year'].map((p, i) => (
              <span key={p} style={{ padding: '3px 10px', borderRadius: 4,
                background: i === 2 ? sage.card : 'transparent',
                color: i === 2 ? sage.ink : sage.ink2,
                fontWeight: i === 2 ? 600 : 400,
                boxShadow: i === 2 ? '0 1px 2px rgba(0,0,0,.04)' : 'none' }}>{p}</span>
            ))}
          </div>
        </div>

        <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18,
          flex: 1, overflow: 'hidden' }}>
          {/* equity card */}
          <div style={{ gridColumn: 'span 2', background: sage.card, border: `1px solid ${sage.rule}`,
            borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: sage.ink2, fontWeight: 500 }}>Account equity</span>
              <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5,
                fontFamily: sage.mono }}>${summary.balance.toLocaleString()}</span>
              <Tag tone="win">+${summary.monthPL.toLocaleString()} · 30d</Tag>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: sage.ink3 }}>Drawdown {summary.drawdown}%</span>
            </div>
            <svg viewBox="0 0 760 140" width="100%" height="140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sage-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={sage.accent} stopOpacity="0.18" />
                  <stop offset="1" stopColor={sage.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaFor(equity, 760, 140, 4)} fill="url(#sage-area)" />
              <path d={pathFor(equity, 760, 140, 4)} fill="none" stroke={sage.accent}
                strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>

          {/* stats grid */}
          {[
            { k: 'Win rate',  v: '70%', sub: '7 of 10', spark: [{d:0,v:60},{d:1,v:66},{d:2,v:64},{d:3,v:68},{d:4,v:70}] },
            { k: 'Avg R:R',   v: '1.6', sub: 'target 1.5', spark: [{d:0,v:1.2},{d:1,v:1.3},{d:2,v:1.4},{d:3,v:1.5},{d:4,v:1.6}] },
            { k: 'Streak',    v: '4', sub: 'green days',  spark: [{d:0,v:1},{d:1,v:2},{d:2,v:3},{d:3,v:4},{d:4,v:4}] },
            { k: 'Pips this month', v: '+251', sub: 'on 10 trades', spark: [{d:0,v:30},{d:1,v:80},{d:2,v:130},{d:3,v:190},{d:4,v:251}] },
          ].map((s) => (
            <div key={s.k} style={{ background: sage.card, border: `1px solid ${sage.rule}`,
              borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: sage.ink2, fontWeight: 500,
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{s.k}</div>
                <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4,
                  fontFamily: sage.mono }}>{s.v}</div>
                <div style={{ fontSize: 11, color: sage.ink3, marginTop: 4 }}>{s.sub}</div>
              </div>
              <svg viewBox="0 0 80 36" width="80" height="36">
                <path d={pathFor(s.spark, 80, 36, 2)} fill="none" stroke={sage.accent}
                  strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          ))}

          {/* recent trades preview */}
          <div style={{ gridColumn: 'span 2', background: sage.card, border: `1px solid ${sage.rule}`,
            borderRadius: 12, padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: sage.ink2, fontWeight: 600 }}>Recent</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: sage.accent }}>See all →</span>
            </div>
            {trades.slice(0, 3).map((t, i) => (
              <div key={t.id} style={{ display: 'grid',
                gridTemplateColumns: '70px 80px 1fr 70px 90px', gap: 12, alignItems: 'center',
                padding: '8px 0', borderTop: i ? `1px solid ${sage.rule}` : 'none', fontSize: 13 }}>
                <span style={{ fontFamily: sage.mono, color: sage.ink2, fontSize: 12 }}>{t.date.slice(5)}</span>
                <span style={{ fontFamily: sage.mono, fontWeight: 500 }}>{t.pair}</span>
                <span style={{ color: sage.ink2, fontSize: 12 }}>{t.tag}</span>
                <span style={{ fontSize: 12, color: sage.ink3 }}>{t.side}</span>
                <span style={{ textAlign: 'right', fontFamily: sage.mono, fontWeight: 600,
                  color: t.pl === 0 ? sage.ink3 : t.pl > 0 ? sage.win : sage.loss }}>
                  {t.pl > 0 ? '+' : t.pl < 0 ? '−' : ''}{t.pl === 0 ? '0' : `$${Math.abs(t.pl)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </SageShell>
  );
}

// ────────────────────────── Trade log ──────────────────────────
function SageTradeLog({ view }) {
  const { trades } = window.FX;
  const Pl = ({ pl }) => (
    <span style={{ fontFamily: sage.mono, fontWeight: 600,
      color: pl === 0 ? sage.ink3 : pl > 0 ? sage.win : sage.loss }}>
      {pl > 0 ? '+' : pl < 0 ? '−' : ''}{pl === 0 ? '0' : `$${Math.abs(pl)}`}
    </span>
  );
  return (
    <SageShell active={1}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 28px',
          borderBottom: `1px solid ${sage.rule}`, gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>All trades</div>
          <Tag tone="neutral">127</Tag>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center',
            background: sage.card, border: `1px solid ${sage.rule2}`, borderRadius: 6,
            padding: '5px 10px', fontSize: 12, color: sage.ink3, gap: 6, width: 220 }}>
            <span>⌕</span><span>Search · pair, tag, note</span>
          </div>
          <div style={{ display: 'inline-flex',
            border: `1px solid ${sage.rule2}`, borderRadius: 6, padding: 2, fontSize: 12 }}>
            {['List', 'Cards'].map((m) => (
              <span key={m} style={{ padding: '3px 10px', borderRadius: 4,
                background: (m === 'Cards' ? view === 'cards' : view === 'list') ? sage.card : 'transparent',
                color:      (m === 'Cards' ? view === 'cards' : view === 'list') ? sage.ink   : sage.ink2,
                fontWeight: (m === 'Cards' ? view === 'cards' : view === 'list') ? 600 : 400 }}>{m}</span>
            ))}
          </div>
        </div>

        {view === 'list' ? (
          <div style={{ padding: '4px 28px', flex: 1, overflow: 'hidden' }}>
            {/* header row */}
            <div style={{ display: 'grid',
              gridTemplateColumns: '60px 80px 90px 60px 70px 90px 1fr 80px 80px',
              gap: 12, padding: '10px 0', fontSize: 11, color: sage.ink3,
              textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${sage.rule}` }}>
              <span>#</span><span>Date</span><span>Pair</span><span>Side</span>
              <span style={{ textAlign: 'right' }}>Pips</span><span style={{ textAlign: 'right' }}>R</span>
              <span>Setup</span>
              <span style={{ textAlign: 'right' }}>Size</span>
              <span style={{ textAlign: 'right' }}>P&L</span>
            </div>
            {trades.map((t) => (
              <div key={t.id} style={{ display: 'grid',
                gridTemplateColumns: '60px 80px 90px 60px 70px 90px 1fr 80px 80px',
                gap: 12, padding: '11px 0', alignItems: 'center',
                borderBottom: `1px solid ${sage.rule}`, fontSize: 13 }}>
                <span style={{ fontFamily: sage.mono, color: sage.ink3, fontSize: 12 }}>#{t.id}</span>
                <span style={{ fontFamily: sage.mono, color: sage.ink2, fontSize: 12 }}>{t.date.slice(5)}</span>
                <span style={{ fontFamily: sage.mono, fontWeight: 500 }}>{t.pair}</span>
                <span><Tag tone={t.side === 'long' ? 'win' : 'loss'}>{t.side}</Tag></span>
                <span style={{ textAlign: 'right', fontFamily: sage.mono, color: sage.ink2 }}>
                  {t.pips > 0 ? '+' : ''}{t.pips}
                </span>
                <span style={{ textAlign: 'right', fontFamily: sage.mono, color: sage.ink2 }}>
                  {t.rr ? `${t.rr}R` : '—'}
                </span>
                <span style={{ color: sage.ink2, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' }}>{t.tag}</span>
                <span style={{ textAlign: 'right', fontFamily: sage.mono, color: sage.ink3, fontSize: 12 }}>{t.size}</span>
                <span style={{ textAlign: 'right' }}><Pl pl={t.pl}/></span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14, alignContent: 'start', overflow: 'hidden' }}>
            {trades.slice(0, 9).map((t) => (
              <div key={t.id} style={{ background: sage.card, border: `1px solid ${sage.rule}`,
                borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: sage.mono, fontWeight: 600, fontSize: 14 }}>{t.pair}</span>
                  <Tag tone={t.side === 'long' ? 'win' : 'loss'}>{t.side}</Tag>
                  <span style={{ marginLeft: 'auto', fontFamily: sage.mono, color: sage.ink3, fontSize: 11 }}>#{t.id}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3,
                  fontFamily: sage.mono,
                  color: t.pl === 0 ? sage.ink3 : t.pl > 0 ? sage.win : sage.loss }}>
                  {t.pl > 0 ? '+' : t.pl < 0 ? '−' : ''}{t.pl === 0 ? '0' : `$${Math.abs(t.pl)}`}
                </div>
                <div style={{ fontSize: 12, color: sage.ink2 }}>{t.tag}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11,
                  color: sage.ink3, fontFamily: sage.mono, paddingTop: 8,
                  borderTop: `1px solid ${sage.rule}` }}>
                  <span>{t.date.slice(5)} · {t.time}</span>
                  <span>{t.pips > 0 ? '+' : ''}{t.pips}p · {t.rr}R</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </SageShell>
  );
}

// ────────────────────────── Trade detail ──────────────────────────
function SageTradeDetail() {
  const { trades, pathFor } = window.FX;
  const t = trades[0];
  const pts = [
    { d: 0, v: 1.0830 }, { d: 1, v: 1.0835 }, { d: 2, v: 1.0828 }, { d: 3, v: 1.0842 },
    { d: 4, v: 1.0840 }, { d: 5, v: 1.0851 }, { d: 6, v: 1.0865 }, { d: 7, v: 1.0858 },
    { d: 8, v: 1.0876 }, { d: 9, v: 1.0884 }, { d:10, v: 1.0892 }, { d:11, v: 1.0901 },
    { d:12, v: 1.0898 },
  ];

  const Stat = ({ k, v, hint }) => (
    <div>
      <div style={{ fontSize: 11, color: sage.ink3, textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: 6 }}>{k}</div>
      <div style={{ fontFamily: sage.mono, fontSize: 17, fontWeight: 600 }}>{v}</div>
      {hint && <div style={{ fontSize: 11, color: sage.ink3, marginTop: 2 }}>{hint}</div>}
    </div>
  );

  return (
    <SageShell active={1}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 28px',
          borderBottom: `1px solid ${sage.rule}`, gap: 10, fontSize: 12 }}>
          <span style={{ color: sage.ink3 }}>← All trades</span>
          <span style={{ color: sage.ink3 }}>/</span>
          <span style={{ fontFamily: sage.mono, color: sage.ink2 }}>#{t.id}</span>
        </div>
        <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24,
          flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              <div style={{ fontFamily: sage.mono, fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
                {t.pair}
              </div>
              <Tag tone={t.side === 'long' ? 'win' : 'loss'}>{t.side}</Tag>
              <Tag tone="neutral">{t.tag}</Tag>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontFamily: sage.mono, fontSize: 30, fontWeight: 700,
                  color: sage.win, letterSpacing: -0.5, lineHeight: 1 }}>+${t.pl}</div>
                <div style={{ fontSize: 11, color: sage.ink3, marginTop: 4, fontFamily: sage.mono }}>
                  +{t.pips} pips · {t.rr}R
                </div>
              </div>
            </div>

            {/* chart */}
            <div style={{ background: sage.card, border: `1px solid ${sage.rule}`,
              borderRadius: 10, padding: 16 }}>
              <svg viewBox="0 0 720 200" width="100%" height="200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sage-d-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor={sage.accent} stopOpacity="0.16" />
                    <stop offset="1" stopColor={sage.accent} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((p) => (
                  <line key={p} x1={0} x2={720} y1={200 * p} y2={200 * p} stroke={sage.rule} />
                ))}
                <path d={`${pathFor(pts, 720, 200, 6)} L${720-6},${200-6} L6,${200-6} Z`} fill="url(#sage-d-area)" />
                <path d={pathFor(pts, 720, 200, 6)} fill="none" stroke={sage.accent}
                  strokeWidth="1.6" strokeLinejoin="round" />
                <circle cx={3*55+6} cy={200-50} r={3} fill={sage.ink} />
                <circle cx={11*55+6} cy={20} r={3} fill={sage.win} />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: 11, color: sage.ink3, fontFamily: sage.mono, marginTop: 8 }}>
                <span>09:30</span><span>10:00</span><span>10:30</span><span>11:00</span><span>11:30</span>
              </div>
            </div>

            {/* stat row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18,
              background: sage.card, border: `1px solid ${sage.rule}`, borderRadius: 10, padding: 16 }}>
              <Stat k="Entry"  v="1.0842" />
              <Stat k="Exit"   v="1.0901" hint="+59 pips" />
              <Stat k="Stop"   v="1.0820" hint="22 pip risk" />
              <Stat k="Size"   v="1.50 lots" />
              <Stat k="Risk"   v="0.8%" hint="of account" />
            </div>

            {/* notes */}
            <div style={{ background: sage.card, border: `1px solid ${sage.rule}`,
              borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 11, color: sage.ink3, textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 8 }}>Note</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: sage.ink }}>
                Patient entry after the retest. Held through the 9:55 wick — the level held
                exactly where it should have. Trailed stop after the second leg. Out at the
                daily pivot, which was the plan.
              </div>
            </div>
          </div>

          {/* sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: sage.card, border: `1px solid ${sage.rule}`,
              borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, color: sage.ink3, textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 12 }}>Context</div>
              {[
                ['Opened', '09:42'],
                ['Closed', '10:54'],
                ['Held',   '1h 12m'],
                ['Session', 'London'],
                ['Mood',   'Calm'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, padding: '6px 0', borderTop: k === 'Opened' ? 'none' : `1px solid ${sage.rule}` }}>
                  <span style={{ color: sage.ink2 }}>{k}</span>
                  <span style={{ fontFamily: sage.mono, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: sage.card, border: `1px solid ${sage.rule}`,
              borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, color: sage.ink3, textTransform: 'uppercase',
                letterSpacing: 1, marginBottom: 10 }}>Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Tag tone="neutral">london</Tag>
                <Tag tone="neutral">breakout</Tag>
                <Tag tone="neutral">eur-usd</Tag>
                <Tag tone="neutral">+a-grade</Tag>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </SageShell>
  );
}

// ────────────────────────── Add trade ──────────────────────────
function SageAddTrade() {
  const Row = ({ label, value, ph, mono = true }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: sage.ink3, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <div style={{ background: sage.card, border: `1px solid ${sage.rule2}`, borderRadius: 8,
        padding: '10px 12px', fontFamily: mono ? sage.mono : sage.sans, fontSize: 14,
        color: value ? sage.ink : sage.ink3 }}>
        {value || ph}
      </div>
    </label>
  );
  return (
    <SageShell active={1}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 28px',
          borderBottom: `1px solid ${sage.rule}`, gap: 10, fontSize: 12 }}>
          <span style={{ color: sage.ink3 }}>← All trades</span>
          <span style={{ color: sage.ink3 }}>/</span>
          <span style={{ color: sage.ink2 }}>New trade</span>
        </div>
        <div style={{ padding: 28, flex: 1, overflow: 'hidden' }}>
          <div style={{ maxWidth: 760 }}>
            <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4, margin: '0 0 4px' }}>New trade</h1>
            <p style={{ fontSize: 13, color: sage.ink2, margin: '0 0 24px' }}>
              Quick capture — you can always come back and fill in the rest.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 14 }}>
              <Row label="Pair"      value="EUR/USD" />
              <Row label="Direction" value="Long" mono={false} />
              <Row label="Date · Time" value="May 17 · 09:42" mono={false} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 14 }}>
              <Row label="Entry"   value="1.0842" />
              <Row label="Exit"    value="1.0901" />
              <Row label="Stop"    value="1.0820" />
              <Row label="Size"    value="1.50" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <Row label="Setup"   value="London breakout" mono={false} />
              <Row label="Mood"    value="Calm" mono={false} />
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22 }}>
              <span style={{ fontSize: 11, color: sage.ink3, textTransform: 'uppercase', letterSpacing: 1 }}>Note</span>
              <div style={{ background: sage.card, border: `1px solid ${sage.rule2}`, borderRadius: 8,
                padding: '12px 14px', fontSize: 13, color: sage.ink3, minHeight: 90 }}>
                Patient entry after the retest…
              </div>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={{ background: sage.accent, color: '#fff', border: 'none',
                borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Save trade
              </button>
              <button style={{ background: 'transparent', color: sage.ink2, border: `1px solid ${sage.rule2}`,
                borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Save & add another
              </button>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: sage.ink3,
                fontFamily: sage.mono }}>⌘↵ to save</div>
            </div>
          </div>
        </div>
      </main>
    </SageShell>
  );
}

window.Sage = { Dashboard: SageDashboard, TradeLog: SageTradeLog, TradeDetail: SageTradeDetail, AddTrade: SageAddTrade };
