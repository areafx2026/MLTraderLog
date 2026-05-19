// Direction 1 — Linen
// Warm cream + soft terracotta. Editorial: serif display, generous whitespace,
// numbers as quiet typography rather than dashboards-of-stats. Personality:
// a notebook you'd keep at a kitchen table.

const linen = {
  bg: '#f4ede1',
  paper: '#fbf6ec',
  ink: '#2a2620',
  ink2: '#6b6358',
  ink3: '#a39c8e',
  rule: 'rgba(60,50,30,.10)',
  rule2: 'rgba(60,50,30,.18)',
  win: '#6b7f5e',       // muted sage
  loss: '#b5613f',      // clay
  accent: '#b5613f',
  serif: '"Newsreader", "Source Serif Pro", Georgia, serif',
  sans:  '"Inter", system-ui, sans-serif',
};

const LinenShell = ({ active, children }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex',
    background: linen.bg, color: linen.ink, fontFamily: linen.sans, fontSize: 14 }}>
    {/* nav */}
    <aside style={{ width: 200, padding: '36px 28px', borderRight: `1px solid ${linen.rule}`,
      display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ fontFamily: linen.serif, fontSize: 22, fontStyle: 'italic',
        fontWeight: 500, letterSpacing: -0.2, lineHeight: 1 }}>
        Ledger<span style={{ color: linen.accent }}>.</span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
        {['Today', 'Trades', 'Journal', 'Insights', 'Settings'].map((n, i) => (
          <a key={n} href="#"
            style={{ color: i === active ? linen.ink : linen.ink2,
              fontWeight: i === active ? 600 : 400,
              padding: '6px 0', textDecoration: 'none',
              borderLeft: i === active ? `2px solid ${linen.accent}` : '2px solid transparent',
              paddingLeft: 10, marginLeft: -10 }}>{n}</a>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', fontSize: 12, color: linen.ink3, lineHeight: 1.55 }}>
        Sunday, 17 May<br/>You've journaled<br/>4 weeks in a row.
      </div>
    </aside>
    {children}
  </div>
);

// ────────────────────────── Dashboard ──────────────────────────
function LinenDashboard() {
  const { equity, summary, pathFor, areaFor } = window.FX;
  const W = 760, H = 220;
  return (
    <LinenShell active={0}>
      <main style={{ flex: 1, padding: '56px 72px 40px', overflow: 'hidden' }}>
        <header style={{ marginBottom: 44, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: linen.ink2, marginBottom: 8, fontStyle: 'italic',
              fontFamily: linen.serif }}>Sunday, the seventeenth of May</div>
            <h1 style={{ fontFamily: linen.serif, fontWeight: 400, fontSize: 44, margin: 0,
              letterSpacing: -0.8, lineHeight: 1.05 }}>
              A steady week.<br />
              <span style={{ fontStyle: 'italic', color: linen.ink2 }}>Four greens, one scratch.</span>
            </h1>
          </div>
          <button style={{ background: linen.ink, color: linen.paper, border: 'none',
            padding: '12px 22px', borderRadius: 999, fontFamily: linen.sans, fontWeight: 500,
            fontSize: 14, letterSpacing: 0.1, cursor: 'pointer' }}>
            Log a trade
          </button>
        </header>

        {/* equity */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontFamily: linen.serif, fontSize: 16, fontStyle: 'italic', color: linen.ink2 }}>
              Equity, last thirty days
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: linen.ink2 }}>
              {['30 d', '3 mo', '1 yr', 'All'].map((n, i) => (
                <span key={n} style={{ color: i === 0 ? linen.ink : linen.ink3,
                  fontWeight: i === 0 ? 600 : 400, borderBottom: i === 0 ? `1px solid ${linen.ink}` : 'none',
                  paddingBottom: 2 }}>{n}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: H }}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
              <defs>
                <linearGradient id="lin-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={linen.win} stopOpacity="0.20" />
                  <stop offset="1" stopColor={linen.win} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((p) => (
                <line key={p} x1={0} x2={W} y1={H * p} y2={H * p} stroke={linen.rule} strokeDasharray="2 4" />
              ))}
              <path d={areaFor(equity, W, H, 8)} fill="url(#lin-area)" />
              <path d={pathFor(equity, W, H, 8)} fill="none" stroke={linen.win} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={W - 8} cy={8} r={3.5} fill={linen.win} />
            </svg>
            <div style={{ position: 'absolute', right: 0, top: -4, textAlign: 'right' }}>
              <div style={{ fontFamily: linen.serif, fontSize: 36, fontWeight: 500, letterSpacing: -0.5 }}>
                ${summary.balance.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: linen.win, fontWeight: 500 }}>
                +${summary.monthPL.toLocaleString()} · this month
              </div>
            </div>
          </div>
        </section>

        {/* numbers row */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48,
          paddingTop: 28, borderTop: `1px solid ${linen.rule2}` }}>
          {[
            { k: 'Win rate',  v: '70%',  s: 'of 10 trades' },
            { k: 'Avg R:R',   v: '1.6',  s: 'per setup'    },
            { k: 'Win streak',v: '4',    s: 'and counting' },
            { k: 'Drawdown',  v: '–1.8%', s: 'within plan' },
          ].map((s) => (
            <div key={s.k}>
              <div style={{ fontSize: 12, color: linen.ink2, fontStyle: 'italic',
                fontFamily: linen.serif, marginBottom: 8, letterSpacing: 0.2 }}>{s.k}</div>
              <div style={{ fontFamily: linen.serif, fontSize: 34, fontWeight: 500, letterSpacing: -0.5, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: linen.ink3, marginTop: 6 }}>{s.s}</div>
            </div>
          ))}
        </section>
      </main>
    </LinenShell>
  );
}

// ────────────────────────── Trade log ──────────────────────────
function LinenTradeLog({ view }) {
  const { trades } = window.FX;
  const Win = ({ pl }) => pl === 0
    ? <span style={{ color: linen.ink3, fontWeight: 500 }}>—</span>
    : pl > 0
      ? <span style={{ color: linen.win,  fontWeight: 500 }}>+${pl}</span>
      : <span style={{ color: linen.loss, fontWeight: 500 }}>–${Math.abs(pl)}</span>;

  return (
    <LinenShell active={1}>
      <main style={{ flex: 1, padding: '40px 72px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
          <h1 style={{ fontFamily: linen.serif, fontSize: 38, fontWeight: 400, margin: 0, letterSpacing: -0.6 }}>
            Trades
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13, color: linen.ink2 }}>
            <span style={{ fontStyle: 'italic', fontFamily: linen.serif }}>May 2026 · 10 trades · +$2,115</span>
            <span style={{ display: 'inline-flex', borderRadius: 999, border: `1px solid ${linen.rule2}`, padding: 2 }}>
              {['List', 'Cards'].map((m) => (
                <span key={m} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12,
                  background: (m === 'Cards' ? view === 'cards' : view === 'list') ? linen.ink : 'transparent',
                  color:      (m === 'Cards' ? view === 'cards' : view === 'list') ? linen.paper : linen.ink2 }}>
                  {m}
                </span>
              ))}
            </span>
          </div>
        </header>

        {view === 'list' ? (
          <div style={{ borderTop: `1px solid ${linen.rule}`, flex: 1, overflow: 'hidden' }}>
            {trades.slice(0, 9).map((t) => (
              <div key={t.id} style={{ display: 'grid',
                gridTemplateColumns: '64px 92px 110px 70px 1fr 80px 100px',
                gap: 24, alignItems: 'center', padding: '18px 0',
                borderBottom: `1px solid ${linen.rule}` }}>
                <span style={{ fontFamily: linen.serif, fontStyle: 'italic', color: linen.ink3, fontSize: 13 }}>#{t.id}</span>
                <span style={{ color: linen.ink2, fontSize: 13 }}>{t.date.slice(5)}</span>
                <span style={{ fontFamily: linen.serif, fontSize: 18, fontWeight: 500 }}>{t.pair}</span>
                <span style={{ fontFamily: linen.serif, fontStyle: 'italic', fontSize: 13,
                  color: t.side === 'long' ? linen.win : linen.loss }}>{t.side}</span>
                <span style={{ color: linen.ink2, fontSize: 13, fontStyle: 'italic', fontFamily: linen.serif,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tag}</span>
                <span style={{ color: linen.ink3, fontSize: 13, textAlign: 'right' }}>{t.pips > 0 ? `+${t.pips}` : t.pips} pips</span>
                <span style={{ fontFamily: linen.serif, fontSize: 19, textAlign: 'right' }}><Win pl={t.pl}/></span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, alignContent: 'start' }}>
            {trades.slice(0, 9).map((t) => (
              <div key={t.id} style={{ background: linen.paper, border: `1px solid ${linen.rule}`,
                borderRadius: 4, padding: 20, minHeight: 150,
                display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: linen.serif, fontSize: 20, fontWeight: 500 }}>{t.pair}</span>
                  <span style={{ fontFamily: linen.serif, fontSize: 19 }}><Win pl={t.pl}/></span>
                </div>
                <div style={{ fontFamily: linen.serif, fontStyle: 'italic', fontSize: 13, color: linen.ink2 }}>
                  {t.tag}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: linen.ink3, paddingTop: 12, borderTop: `1px solid ${linen.rule}` }}>
                  <span>{t.date.slice(5)} · {t.side}</span>
                  <span>{t.pips > 0 ? '+' : ''}{t.pips} pips</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </LinenShell>
  );
}

// ────────────────────────── Trade detail ──────────────────────────
function LinenTradeDetail() {
  const { trades, pathFor } = window.FX;
  const t = trades[0];
  // synthetic price path through entry/exit
  const pts = [
    { d: 0, v: 1.0830 }, { d: 1, v: 1.0835 }, { d: 2, v: 1.0828 }, { d: 3, v: 1.0842 },
    { d: 4, v: 1.0840 }, { d: 5, v: 1.0851 }, { d: 6, v: 1.0865 }, { d: 7, v: 1.0858 },
    { d: 8, v: 1.0876 }, { d: 9, v: 1.0884 }, { d:10, v: 1.0892 }, { d:11, v: 1.0901 },
    { d:12, v: 1.0898 },
  ];
  return (
    <LinenShell active={1}>
      <main style={{ flex: 1, padding: '40px 72px', overflow: 'hidden' }}>
        <div style={{ fontSize: 12, color: linen.ink3, marginBottom: 14 }}>
          ← Trades · May
        </div>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingBottom: 22, marginBottom: 28, borderBottom: `1px solid ${linen.rule2}` }}>
          <div>
            <div style={{ fontFamily: linen.serif, fontStyle: 'italic', color: linen.ink2,
              fontSize: 14, marginBottom: 6 }}>Trade #{t.id} · 17 May, 09:42</div>
            <h1 style={{ fontFamily: linen.serif, fontWeight: 400, fontSize: 48, margin: 0,
              letterSpacing: -0.8, lineHeight: 1 }}>
              {t.pair} <span style={{ fontStyle: 'italic', color: linen.ink2 }}>long</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: linen.serif, fontWeight: 500, fontSize: 44,
              color: linen.win, letterSpacing: -0.5, lineHeight: 1 }}>+${t.pl}</div>
            <div style={{ fontSize: 13, color: linen.ink2, marginTop: 6 }}>
              +{t.pips} pips · {t.rr}R · {t.size} lots
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48 }}>
          <div>
            {/* chart */}
            <div style={{ background: linen.paper, border: `1px solid ${linen.rule}`,
              borderRadius: 4, padding: 24, marginBottom: 24 }}>
              <svg viewBox="0 0 700 220" width="100%" height="220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lind-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor={linen.win} stopOpacity="0.18" />
                    <stop offset="1" stopColor={linen.win} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((p) => (
                  <line key={p} x1={0} x2={700} y1={220 * p} y2={220 * p} stroke={linen.rule} strokeDasharray="2 4" />
                ))}
                {/* entry & exit lines */}
                <line x1={3*54+8} x2={3*54+8} y1={0} y2={220} stroke={linen.ink3} strokeDasharray="3 3" strokeWidth="0.8" />
                <line x1={11*54+8} x2={11*54+8} y1={0} y2={220} stroke={linen.ink3} strokeDasharray="3 3" strokeWidth="0.8" />
                <path d={`${pathFor(pts, 700, 220, 8)} L${700-8},${220-8} L8,${220-8} Z`} fill="url(#lind-area)" />
                <path d={pathFor(pts, 700, 220, 8)} fill="none" stroke={linen.win} strokeWidth="1.6" strokeLinejoin="round" />
                <text x={3*54+14} y={18} fill={linen.ink2} fontSize="11" fontFamily={linen.serif} fontStyle="italic">entry 1.0842</text>
                <text x={11*54+14} y={18} fill={linen.win} fontSize="11" fontFamily={linen.serif} fontStyle="italic">exit 1.0901</text>
              </svg>
            </div>

            {/* notes — editorial */}
            <div>
              <div style={{ fontFamily: linen.serif, fontStyle: 'italic', fontSize: 14,
                color: linen.ink2, marginBottom: 12 }}>Reflection</div>
              <p style={{ fontFamily: linen.serif, fontSize: 19, lineHeight: 1.6, margin: 0,
                color: linen.ink, maxWidth: '60ch' }}>
                Patient entry after the retest. The 9:55 wick was uncomfortable but the level
                held — and I watched it from the kitchen rather than from the chair. Trailed
                stop above the previous high once the second leg was in. Out at the daily
                pivot, which was the plan.
              </p>
              <p style={{ fontFamily: linen.serif, fontSize: 19, lineHeight: 1.6,
                color: linen.ink2, fontStyle: 'italic', maxWidth: '60ch', marginTop: 14 }}>
                Note for next week: don't add to a winner that's already at target.
              </p>
            </div>
          </div>

          {/* meta */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 22, fontSize: 13 }}>
            {[
              ['Setup',    'London breakout'],
              ['Direction','Long · 1.50 lots'],
              ['Entry',    '1.0842'],
              ['Exit',     '1.0901'],
              ['Stop',     '1.0820 · 22 pips'],
              ['Risk',     '0.8% of account'],
              ['R-multiple', '+2.3 R'],
              ['Mood',     'Calm'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                borderBottom: `1px solid ${linen.rule}`, paddingBottom: 10 }}>
                <span style={{ color: linen.ink2, fontFamily: linen.serif, fontStyle: 'italic' }}>{k}</span>
                <span style={{ color: linen.ink, fontFamily: linen.serif, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </LinenShell>
  );
}

// ────────────────────────── Add trade ──────────────────────────
function LinenAddTrade() {
  const Field = ({ label, value, sub }) => (
    <div style={{ borderBottom: `1px solid ${linen.rule2}`, paddingBottom: 14 }}>
      <div style={{ fontFamily: linen.serif, fontStyle: 'italic', fontSize: 12,
        color: linen.ink2, marginBottom: 8, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ fontFamily: linen.serif, fontSize: 26, color: value ? linen.ink : linen.ink3,
        letterSpacing: -0.3 }}>{value || 'add'}</div>
      {sub && <div style={{ fontSize: 11, color: linen.ink3, marginTop: 4 }}>{sub}</div>}
    </div>
  );
  return (
    <LinenShell active={1}>
      <main style={{ flex: 1, padding: '40px 72px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: linen.ink3, marginBottom: 14 }}>
          ← Trades · May
        </div>
        <h1 style={{ fontFamily: linen.serif, fontWeight: 400, fontSize: 44, margin: '0 0 8px',
          letterSpacing: -0.8 }}>
          A new trade.
        </h1>
        <p style={{ fontFamily: linen.serif, fontStyle: 'italic', color: linen.ink2,
          fontSize: 16, margin: '0 0 36px' }}>Tell me about it.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 64px', maxWidth: 820 }}>
          <Field label="Pair"      value="EUR / USD" />
          <Field label="Direction" value="Long" />
          <Field label="Entry"     value="1.0842" />
          <Field label="Exit"      value="1.0901" sub="or leave blank if still open" />
          <Field label="Stop"      value="1.0820" sub="22 pips of risk" />
          <Field label="Size"      value="1.50 lots" />
          <Field label="Setup"     value="London breakout" />
          <Field label="Mood"      value="Calm" />
        </div>

        <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${linen.rule2}`, maxWidth: 820 }}>
          <div style={{ fontFamily: linen.serif, fontStyle: 'italic', fontSize: 12,
            color: linen.ink2, marginBottom: 12, letterSpacing: 0.2 }}>A few notes</div>
          <div style={{ fontFamily: linen.serif, fontSize: 19, lineHeight: 1.6, color: linen.ink3,
            fontStyle: 'italic' }}>
            What were you watching? How did it feel?…
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 12, paddingTop: 28 }}>
          <button style={{ background: linen.ink, color: linen.paper, border: 'none',
            padding: '12px 24px', borderRadius: 999, fontFamily: linen.sans, fontWeight: 500,
            fontSize: 14, cursor: 'pointer' }}>Save trade</button>
          <button style={{ background: 'transparent', color: linen.ink2, border: 'none',
            padding: '12px 16px', fontFamily: linen.sans, fontSize: 14, cursor: 'pointer' }}>
            Save draft
          </button>
        </div>
      </main>
    </LinenShell>
  );
}

window.Linen = { Dashboard: LinenDashboard, TradeLog: LinenTradeLog, TradeDetail: LinenTradeDetail, AddTrade: LinenAddTrade };
