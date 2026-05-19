// Direction 3 — Paper
// Warm paper with faint rules. Everything as a ledger — generous serif,
// monospace numbers. The trading day as a hand-kept journal page.

const paper = {
  bg: '#ede4d2',
  page: '#f4ecd9',
  ink: '#1c1813',
  ink2: '#5d5448',
  ink3: '#8e8675',
  rule: 'rgba(50,35,15,.18)',
  rule2: 'rgba(50,35,15,.30)',
  win: '#5d6e4f',
  loss: '#8e3d22',
  accent: '#8e3d22',
  serif: '"Fraunces", "Source Serif Pro", Georgia, serif',
  display: '"Instrument Serif", "Newsreader", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

const PaperShell = ({ active, children }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex',
    background: paper.bg, color: paper.ink, fontFamily: paper.serif, fontSize: 14,
    backgroundImage: `repeating-linear-gradient(0deg, transparent 0, transparent 31px, rgba(50,35,15,.05) 31px, rgba(50,35,15,.05) 32px)` }}>
    <aside style={{ width: 196, padding: '40px 0 32px',
      borderRight: `1px solid ${paper.rule2}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 28px 28px',
        borderBottom: `1px solid ${paper.rule}`, marginBottom: 22 }}>
        <div style={{ fontFamily: paper.display, fontSize: 28, lineHeight: 1, letterSpacing: -0.4 }}>
          The Trading
        </div>
        <div style={{ fontFamily: paper.display, fontStyle: 'italic', fontSize: 28, lineHeight: 1,
          color: paper.accent, letterSpacing: -0.4 }}>Journal</div>
        <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
          textTransform: 'uppercase', letterSpacing: 2, marginTop: 14 }}>
          Vol. III · Quarto
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {[
          { n: 'Day book',    p: 'I'   },
          { n: 'The ledger',  p: 'II'  },
          { n: 'A single hand', p: 'III' },
          { n: 'On reflection', p: 'IV' },
          { n: 'House rules', p: 'V'   },
        ].map((it, i) => (
          <a key={it.n} href="#" style={{
            display: 'flex', alignItems: 'baseline', gap: 14,
            padding: '8px 28px', textDecoration: 'none',
            color: i === active ? paper.ink : paper.ink2,
            background: i === active ? 'rgba(50,35,15,.06)' : 'transparent' }}>
            <span style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
              width: 18 }}>{it.p}</span>
            <span style={{ fontFamily: paper.serif, fontStyle: i === active ? 'italic' : 'normal',
              fontSize: 15, fontWeight: i === active ? 600 : 400 }}>{it.n}</span>
          </a>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '0 28px',
        fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
        textTransform: 'uppercase', letterSpacing: 1.5 }}>
        Folio MMXXVI · 17.V
      </div>
    </aside>
    {children}
  </div>
);

// ────────────────────────── Dashboard ──────────────────────────
function PaperDashboard() {
  const { equity, summary, pathFor } = window.FX;
  return (
    <PaperShell active={0}>
      <main style={{ flex: 1, padding: '48px 64px 32px', overflow: 'hidden',
        background: paper.page, position: 'relative' }}>
        {/* page-edge double rule */}
        <div style={{ position: 'absolute', inset: 0, padding: '16px',
          pointerEvents: 'none', border: `1px solid ${paper.rule}` }} />
        <div style={{ position: 'absolute', inset: '20px', pointerEvents: 'none',
          border: `1px solid ${paper.rule}` }} />

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          paddingBottom: 18, borderBottom: `1px solid ${paper.rule2}`, marginBottom: 30,
          position: 'relative' }}>
          <div>
            <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              The Day Book · Sunday the seventeenth
            </div>
            <h1 style={{ fontFamily: paper.display, fontSize: 56, fontWeight: 400,
              letterSpacing: -1, margin: 0, lineHeight: 0.95 }}>
              Of a week <span style={{ fontStyle: 'italic', color: paper.accent }}>well kept</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
              textTransform: 'uppercase', letterSpacing: 2 }}>Account</div>
            <div style={{ fontFamily: paper.mono, fontSize: 22, fontWeight: 500, marginTop: 4 }}>
              ${summary.balance.toLocaleString()}.00
            </div>
            <div style={{ fontFamily: paper.serif, fontStyle: 'italic', fontSize: 13,
              color: paper.win, marginTop: 4 }}>
              +${summary.monthPL.toLocaleString()} this month
            </div>
          </div>
        </header>

        {/* two-column body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1px 1fr', gap: 36,
          position: 'relative' }}>
          {/* equity column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: paper.display, fontStyle: 'italic', fontSize: 22 }}>
                Equity, thirty days
              </span>
              <span style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3, letterSpacing: 1.5 }}>
                APR.17 — MAY.17
              </span>
            </div>
            <svg viewBox="0 0 600 220" width="100%" height="220" preserveAspectRatio="none">
              {[0.25, 0.5, 0.75].map((p) => (
                <line key={p} x1={0} x2={600} y1={220 * p} y2={220 * p} stroke={paper.rule} strokeDasharray="1 5" />
              ))}
              <path d={pathFor(equity, 600, 220, 8)} fill="none" stroke={paper.ink}
                strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={596} cy={20} r={3.5} fill={paper.accent} />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8,
              fontFamily: paper.mono, fontSize: 10, color: paper.ink3, letterSpacing: 1 }}>
              <span>17 APR</span><span>24 APR</span><span>1 MAY</span><span>8 MAY</span><span>17 MAY</span>
            </div>

            <div style={{ marginTop: 26, fontFamily: paper.display, fontSize: 19,
              fontStyle: 'italic', color: paper.ink2, lineHeight: 1.6, maxWidth: '52ch' }}>
              "Four greens and a scratch — and one wound from Wednesday that I've
              chosen not to bleed over. The plan held; mostly so did I."
            </div>
          </div>

          <div style={{ background: paper.rule2 }} />

          {/* numbers column */}
          <div>
            <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>The numbers</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: paper.serif }}>
              <tbody>
                {[
                  ['Trades',     summary.trades, ''],
                  ['Won',        '7',  '70%'],
                  ['Lost',       '2',  '20%'],
                  ['Scratched',  '1',  '10%'],
                  ['Avg. R:R',   summary.avgRR, ''],
                  ['Best pair',  'EUR/USD', '+$1,095'],
                  ['Worst day',  'Friday',  '−$156'],
                  ['Drawdown',   summary.drawdown + '%', 'in plan'],
                ].map(([k, v, s], i, arr) => (
                  <tr key={k} style={{ borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${paper.rule}` }}>
                    <td style={{ padding: '11px 0', color: paper.ink2, fontStyle: 'italic',
                      fontFamily: paper.display, fontSize: 16 }}>{k}</td>
                    <td style={{ padding: '11px 0', fontFamily: paper.mono, fontSize: 14,
                      textAlign: 'right', fontWeight: 500 }}>{v}</td>
                    <td style={{ padding: '11px 0', fontFamily: paper.mono, fontSize: 11,
                      color: paper.ink3, textAlign: 'right', width: 70 }}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </PaperShell>
  );
}

// ────────────────────────── Trade log (the ledger) ──────────────────────────
function PaperTradeLog({ view }) {
  const { trades } = window.FX;
  return (
    <PaperShell active={1}>
      <main style={{ flex: 1, padding: '48px 64px 32px', overflow: 'hidden',
        background: paper.page, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 16, border: `1px solid ${paper.rule}`,
          pointerEvents: 'none' }} />
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingBottom: 18, marginBottom: 18,
          borderBottom: `1px solid ${paper.rule2}` }}>
          <div>
            <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
              The Ledger · folio II
            </div>
            <h1 style={{ fontFamily: paper.display, fontSize: 48, fontWeight: 400, margin: 0,
              letterSpacing: -0.8, lineHeight: 1 }}>
              May, in <span style={{ fontStyle: 'italic' }}>full</span>.
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14,
            fontFamily: paper.mono, fontSize: 11, color: paper.ink3, letterSpacing: 1 }}>
            <span>10 ENTRIES</span><span>·</span><span>+$2,115</span><span>·</span><span>+251 PIPS</span>
            <span style={{ marginLeft: 14, display: 'inline-flex', border: `1px solid ${paper.rule2}` }}>
              {['List', 'Cards'].map((m) => (
                <span key={m} style={{ padding: '5px 11px', fontFamily: paper.mono, fontSize: 10,
                  letterSpacing: 1.5,
                  background: (m === 'Cards' ? view === 'cards' : view === 'list') ? paper.ink : 'transparent',
                  color:      (m === 'Cards' ? view === 'cards' : view === 'list') ? paper.page : paper.ink2 }}>
                  {m.toUpperCase()}
                </span>
              ))}
            </span>
          </div>
        </header>

        {view === 'list' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: paper.serif }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${paper.rule2}` }}>
                {['№', 'Date', 'Hour', 'Pair', 'Side', 'Entry', 'Exit', 'Pips', 'R', 'Setup', 'P & L'].map((h, i) => (
                  <th key={h} style={{ fontFamily: paper.mono, fontSize: 9.5, color: paper.ink3,
                    textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 500,
                    padding: '10px 8px', textAlign: i >= 5 ? 'right' : 'left',
                    width: i === 9 ? 'auto' : undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${paper.rule}` }}>
                  <td style={{ fontFamily: paper.mono, fontSize: 11, color: paper.ink3, padding: '12px 8px' }}>{t.id}</td>
                  <td style={{ fontFamily: paper.mono, fontSize: 12, color: paper.ink2, padding: '12px 8px' }}>{t.date.slice(5)}</td>
                  <td style={{ fontFamily: paper.mono, fontSize: 12, color: paper.ink3, padding: '12px 8px' }}>{t.time}</td>
                  <td style={{ fontFamily: paper.display, fontSize: 17, padding: '12px 8px' }}>{t.pair}</td>
                  <td style={{ fontFamily: paper.serif, fontStyle: 'italic', fontSize: 13,
                    padding: '12px 8px',
                    color: t.side === 'long' ? paper.win : paper.loss }}>{t.side}</td>
                  <td style={{ fontFamily: paper.mono, fontSize: 12, color: paper.ink2,
                    padding: '12px 8px', textAlign: 'right' }}>{t.entry.toFixed(t.pair.includes('JPY') ? 2 : 4)}</td>
                  <td style={{ fontFamily: paper.mono, fontSize: 12, color: paper.ink2,
                    padding: '12px 8px', textAlign: 'right' }}>{t.exit.toFixed(t.pair.includes('JPY') ? 2 : 4)}</td>
                  <td style={{ fontFamily: paper.mono, fontSize: 12, color: paper.ink2,
                    padding: '12px 8px', textAlign: 'right' }}>
                    {t.pips > 0 ? `+${t.pips}` : t.pips}
                  </td>
                  <td style={{ fontFamily: paper.mono, fontSize: 12, color: paper.ink3,
                    padding: '12px 8px', textAlign: 'right' }}>{t.rr ? `${t.rr}R` : '—'}</td>
                  <td style={{ fontFamily: paper.display, fontStyle: 'italic', fontSize: 14,
                    color: paper.ink2, padding: '12px 8px', textAlign: 'right' }}>{t.tag}</td>
                  <td style={{ fontFamily: paper.mono, fontSize: 13, fontWeight: 600,
                    padding: '12px 8px', textAlign: 'right',
                    color: t.pl === 0 ? paper.ink3 : t.pl > 0 ? paper.win : paper.loss }}>
                    {t.pl === 0 ? '—' : t.pl > 0 ? `+${t.pl}` : `(${Math.abs(t.pl)})`}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${paper.rule2}` }}>
                <td colSpan={7}></td>
                <td style={{ fontFamily: paper.mono, fontSize: 11, color: paper.ink3,
                  padding: '12px 8px', textAlign: 'right',
                  textTransform: 'uppercase', letterSpacing: 1.5 }}>Sum.</td>
                <td colSpan={2}></td>
                <td style={{ fontFamily: paper.mono, fontSize: 14, fontWeight: 600,
                  padding: '12px 8px', textAlign: 'right', color: paper.win }}>+2,115</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
            alignContent: 'start' }}>
            {trades.slice(0, 9).map((t, i) => (
              <div key={t.id} style={{ padding: 22,
                borderRight: i % 3 === 2 ? 'none' : `1px solid ${paper.rule}`,
                borderBottom: i < 6 ? `1px solid ${paper.rule}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: paper.display, fontSize: 22 }}>{t.pair}</span>
                  <span style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3, letterSpacing: 1.5 }}>
                    №{t.id}
                  </span>
                </div>
                <div style={{ fontFamily: paper.display, fontSize: 28, fontWeight: 500,
                  marginTop: 8, lineHeight: 1,
                  color: t.pl === 0 ? paper.ink3 : t.pl > 0 ? paper.win : paper.loss }}>
                  {t.pl === 0 ? '—' : t.pl > 0 ? `+ $${t.pl}` : `– $${Math.abs(t.pl)}`}
                </div>
                <div style={{ fontFamily: paper.display, fontStyle: 'italic', fontSize: 14,
                  color: paper.ink2, marginTop: 6 }}>{t.tag}</div>
                <div style={{ marginTop: 14, fontFamily: paper.mono, fontSize: 10,
                  color: paper.ink3, letterSpacing: 1.2, display: 'flex',
                  justifyContent: 'space-between' }}>
                  <span>{t.date.slice(5)} · {t.time} · {t.side.toUpperCase()}</span>
                  <span>{t.pips > 0 ? `+${t.pips}` : t.pips}p</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </PaperShell>
  );
}

// ────────────────────────── Trade detail ──────────────────────────
function PaperTradeDetail() {
  const { trades, pathFor } = window.FX;
  const t = trades[0];
  const pts = [
    { d: 0, v: 1.0830 }, { d: 1, v: 1.0835 }, { d: 2, v: 1.0828 }, { d: 3, v: 1.0842 },
    { d: 4, v: 1.0840 }, { d: 5, v: 1.0851 }, { d: 6, v: 1.0865 }, { d: 7, v: 1.0858 },
    { d: 8, v: 1.0876 }, { d: 9, v: 1.0884 }, { d:10, v: 1.0892 }, { d:11, v: 1.0901 },
    { d:12, v: 1.0898 },
  ];
  return (
    <PaperShell active={2}>
      <main style={{ flex: 1, padding: '48px 64px 32px', overflow: 'hidden',
        background: paper.page, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 16, border: `1px solid ${paper.rule}`, pointerEvents: 'none' }} />

        <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
          A Single Hand · folio III · entry №{t.id}
        </div>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          paddingBottom: 22, marginBottom: 28,
          borderBottom: `1px solid ${paper.rule2}` }}>
          <h1 style={{ fontFamily: paper.display, fontSize: 60, fontWeight: 400, margin: 0,
            letterSpacing: -1, lineHeight: 0.95 }}>
            EUR / USD,<br/>
            <span style={{ fontStyle: 'italic' }}>at length</span>.
          </h1>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
              textTransform: 'uppercase', letterSpacing: 2 }}>Result</div>
            <div style={{ fontFamily: paper.display, fontSize: 48, fontWeight: 500,
              color: paper.win, letterSpacing: -0.8, lineHeight: 1 }}>+ $442</div>
            <div style={{ fontFamily: paper.mono, fontSize: 11, color: paper.ink3, marginTop: 4, letterSpacing: 1.2 }}>
              +59 PIPS · 2.3 R
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40 }}>
          {/* left: chart + ledger row */}
          <div>
            <svg viewBox="0 0 580 200" width="100%" height="200" preserveAspectRatio="none">
              {[0.25, 0.5, 0.75].map((p) => (
                <line key={p} x1={0} x2={580} y1={200 * p} y2={200 * p} stroke={paper.rule} strokeDasharray="1 5" />
              ))}
              <line x1={3*45+8} x2={3*45+8} y1={0} y2={200} stroke={paper.ink2} strokeDasharray="2 3" strokeWidth="0.8" />
              <line x1={11*45+8} x2={11*45+8} y1={0} y2={200} stroke={paper.ink2} strokeDasharray="2 3" strokeWidth="0.8" />
              <path d={pathFor(pts, 580, 200, 8)} fill="none" stroke={paper.ink}
                strokeWidth="1.4" strokeLinejoin="round" />
              <text x={3*45+12} y={16} fill={paper.ink2} fontSize="10"
                fontFamily={paper.mono} letterSpacing="1">ENTRY 1.0842</text>
              <text x={11*45+12} y={16} fill={paper.win} fontSize="10"
                fontFamily={paper.mono} letterSpacing="1">EXIT 1.0901</text>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6,
              fontFamily: paper.mono, fontSize: 10, color: paper.ink3, letterSpacing: 1.5 }}>
              <span>09:30</span><span>10:00</span><span>10:30</span><span>11:00</span><span>11:30</span>
            </div>

            <table style={{ width: '100%', marginTop: 28, borderCollapse: 'collapse', fontFamily: paper.serif }}>
              <tbody>
                {[
                  ['Date',       '17 May, 2026 · Saturday',  ''],
                  ['Opened',     '09:42',  ''],
                  ['Closed',     '10:54',  '1h 12m'],
                  ['Direction',  'Long',   '1.50 lots'],
                  ['Entry',      '1.0842', ''],
                  ['Stop',       '1.0820', '22 pip risk'],
                  ['Exit',       '1.0901', '+59 pips'],
                  ['Risk',       '0.8% of account', ''],
                ].map(([k, v, s], i, arr) => (
                  <tr key={k} style={{ borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${paper.rule}` }}>
                    <td style={{ padding: '9px 0', color: paper.ink2, fontStyle: 'italic',
                      fontFamily: paper.display, fontSize: 14, width: '38%' }}>{k}</td>
                    <td style={{ padding: '9px 0', fontFamily: paper.mono, fontSize: 12,
                      fontWeight: 500 }}>{v}</td>
                    <td style={{ padding: '9px 0', fontFamily: paper.mono, fontSize: 10,
                      color: paper.ink3, textAlign: 'right', letterSpacing: 1 }}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* right: reflection */}
          <div style={{ paddingLeft: 32, borderLeft: `1px solid ${paper.rule2}`,
            position: 'relative' }}>
            <div style={{ position: 'absolute', left: -10, top: -2, width: 20, height: 20,
              background: paper.page, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: paper.display, fontSize: 16, color: paper.accent }}>§</div>
            <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Reflection</div>
            <p style={{ fontFamily: paper.display, fontStyle: 'italic',
              fontSize: 28, lineHeight: 1.2, margin: 0, color: paper.ink, letterSpacing: -0.4 }}>
              "Patient entry after the retest."
            </p>
            <p style={{ fontFamily: paper.serif, fontSize: 14, lineHeight: 1.65,
              color: paper.ink2, marginTop: 18 }}>
              The 9:55 wick was uncomfortable but the level held — and I watched it from the
              kitchen rather than from the chair. Trailed stop above the previous high once
              the second leg was in. Out at the daily pivot, which was the plan.
            </p>
            <p style={{ fontFamily: paper.display, fontStyle: 'italic',
              fontSize: 16, color: paper.accent, marginTop: 22, lineHeight: 1.4 }}>
              — for next week, don't add to a winner already at target.
            </p>
            <div style={{ marginTop: 22, fontFamily: paper.mono, fontSize: 10,
              color: paper.ink3, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Mood · Calm · Session · London
            </div>
          </div>
        </div>
      </main>
    </PaperShell>
  );
}

// ────────────────────────── Add trade ──────────────────────────
function PaperAddTrade() {
  const FormLine = ({ label, value, sub, w = 1 }) => (
    <div style={{ gridColumn: `span ${w}`, borderBottom: `1px solid ${paper.rule2}`,
      paddingBottom: 10 }}>
      <div style={{ fontFamily: paper.mono, fontSize: 9.5, color: paper.ink3,
        textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div>
      <div style={{ fontFamily: paper.display, fontStyle: value ? 'normal' : 'italic',
        fontSize: 26, color: value ? paper.ink : paper.ink3, marginTop: 4, letterSpacing: -0.3 }}>
        {value || '— '}
      </div>
      {sub && <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
        letterSpacing: 1, marginTop: 2 }}>{sub}</div>}
    </div>
  );
  return (
    <PaperShell active={1}>
      <main style={{ flex: 1, padding: '48px 64px 32px', overflow: 'hidden',
        background: paper.page, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 16, border: `1px solid ${paper.rule}`, pointerEvents: 'none' }} />

        <div style={{ fontFamily: paper.mono, fontSize: 10, color: paper.ink3,
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
          The Ledger · entering a new line
        </div>
        <h1 style={{ fontFamily: paper.display, fontSize: 56, fontWeight: 400, margin: 0,
          letterSpacing: -1, lineHeight: 1 }}>
          A <span style={{ fontStyle: 'italic' }}>fresh</span> entry.
        </h1>
        <div style={{ marginTop: 8, fontFamily: paper.display, fontStyle: 'italic',
          fontSize: 18, color: paper.ink2 }}>
          To be entered by hand, in the order it happened.
        </div>

        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          columnGap: 32, rowGap: 26, maxWidth: 880 }}>
          <FormLine label="Pair"     value="EUR / USD" />
          <FormLine label="Side"     value="Long" />
          <FormLine label="Date"     value="17 May" />
          <FormLine label="Time"     value="09:42" />
          <FormLine label="Entry"    value="1.0842" />
          <FormLine label="Stop"     value="1.0820" sub="22 PIP RISK" />
          <FormLine label="Exit"     value="1.0901" sub="OR LEAVE OPEN" />
          <FormLine label="Size"     value="1.50 lots" />
          <FormLine label="Setup"    value="London breakout" w={2} />
          <FormLine label="Mood"     value="Calm" />
          <FormLine label="Risk"     value="0.8 %" />
        </div>

        <div style={{ marginTop: 32, paddingTop: 18,
          borderTop: `1px solid ${paper.rule2}`, maxWidth: 880 }}>
          <div style={{ fontFamily: paper.mono, fontSize: 9.5, color: paper.ink3,
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Note</div>
          <div style={{ fontFamily: paper.display, fontStyle: 'italic',
            fontSize: 22, color: paper.ink3, lineHeight: 1.4 }}>
            What were you watching? How did it feel? …
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'flex', gap: 16, alignItems: 'center' }}>
          <button style={{ background: paper.ink, color: paper.page, border: 'none',
            padding: '10px 22px', fontFamily: paper.display, fontStyle: 'italic',
            fontSize: 18, cursor: 'pointer', letterSpacing: -0.2 }}>
            Enter into ledger
          </button>
          <button style={{ background: 'transparent', color: paper.ink2, border: `1px solid ${paper.rule2}`,
            padding: '10px 18px', fontFamily: paper.display, fontStyle: 'italic',
            fontSize: 16, cursor: 'pointer' }}>
            Save & next
          </button>
        </div>
      </main>
    </PaperShell>
  );
}

window.Paper = { Dashboard: PaperDashboard, TradeLog: PaperTradeLog, TradeDetail: PaperTradeDetail, AddTrade: PaperAddTrade };
