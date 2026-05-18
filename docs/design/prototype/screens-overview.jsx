// Forex Log — Today + Trades screens (theme-aware).

// ────────────────────────── Today (Dashboard) ──────────────────────────
function TodayScreen({ t, onNavigate, onAddTrade }) {
  const { trades, summary, usd } = window.FX;
  const ranges = ['30 d', '3 mo', '1 yr', 'All'];
  return (
    <div style={{ flex: 1, padding: '56px 72px 40px', overflow: 'auto', minWidth: 0 }}>
      <Header t={t}
        eyebrow="Sunday, the seventeenth of May"
        title="A steady week."
        italicTail="Four greens, one scratch."
        action={<PrimaryButton t={t} onClick={onAddTrade}>Log a trade</PrimaryButton>} />

      {/* equity */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: FONTS.serif, fontSize: 16, fontStyle: 'italic', color: t.ink2 }}>
            Equity, last thirty days
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: t.ink2 }}>
            {ranges.map((n, i) => (
              <span key={n} style={{ color: i === 0 ? t.ink : t.ink3,
                fontWeight: i === 0 ? 600 : 400,
                borderBottom: i === 0 ? `1px solid ${t.ink}` : 'none',
                paddingBottom: 2, cursor: 'pointer' }}>{n}</span>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <EquityChart t={t} height={220} />
          <div style={{ position: 'absolute', right: 0, top: -4, textAlign: 'right',
            background: t.bg, padding: '0 4px' }}>
            <div style={{ fontFamily: FONTS.serif, fontSize: 36, fontWeight: 500, letterSpacing: -0.5,
              color: t.ink }}>
              ${usd(summary.balance)}
            </div>
            <div style={{ fontSize: 12, color: t.win, fontWeight: 500 }}>
              +${usd(summary.monthPL)} · this month
            </div>
          </div>
        </div>
      </section>

      {/* numbers row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48,
        padding: '28px 0', borderTop: `1px solid ${t.rule2}`,
        borderBottom: `1px solid ${t.rule}` }}>
        <Stat t={t} label="Win rate"   value="70%"   sub="of 10 trades" />
        <Stat t={t} label="Avg R:R"    value="1.6"   sub="against 1.5 plan" />
        <Stat t={t} label="Win streak" value="4"     sub="and counting" />
        <Stat t={t} label="Drawdown"   value="–1.8%" sub="within plan" />
      </section>

      {/* recent — quiet list, click to drill in */}
      <section style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 14 }}>
          <div style={{ fontFamily: FONTS.serif, fontSize: 16, fontStyle: 'italic', color: t.ink2 }}>
            Recent
          </div>
          <button onClick={() => onNavigate('trades')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: FONTS.sans, fontSize: 13, color: t.accent }}>
            See all →
          </button>
        </div>
        {trades.slice(0, 4).map((tr) => (
          <button key={tr.id} onClick={() => onNavigate('detail', tr.id)}
            style={{ display: 'grid', width: '100%',
              gridTemplateColumns: '64px 100px 1fr 80px 100px',
              gap: 24, alignItems: 'center', padding: '14px 0',
              borderBottom: `1px solid ${t.rule}`,
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              textAlign: 'left', color: 'inherit', fontFamily: 'inherit' }}>
            <span style={{ color: t.ink2, fontSize: 13 }}>{tr.date.slice(5)}</span>
            <span style={{ fontFamily: FONTS.serif, fontSize: 18, fontWeight: 500, color: t.ink }}>
              {tr.pair}
            </span>
            <span style={{ color: t.ink2, fontSize: 13, fontStyle: 'italic', fontFamily: FONTS.serif,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.tag}</span>
            <span style={{ color: t.ink3, fontSize: 13, textAlign: 'right' }}>
              {tr.pips > 0 ? '+' : ''}{tr.pips} pips
            </span>
            <span style={{ textAlign: 'right' }}><Pnl t={t} pl={tr.pl} /></span>
          </button>
        ))}
      </section>
    </div>
  );
}

// ────────────────────────── Trades (List + Cards) ──────────────────────────
function TradesScreen({ t, view, onChangeView, onNavigate, onAddTrade }) {
  const { trades } = window.FX;
  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0,
      display: 'flex', flexDirection: 'column' }}>
      <Header t={t}
        title="Trades"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13, color: t.ink2 }}>
            <span style={{ fontStyle: 'italic', fontFamily: FONTS.serif }}>
              May 2026 · 10 trades · +$2,115
            </span>
            <span style={{ display: 'inline-flex', borderRadius: 999,
              border: `1px solid ${t.rule2}`, padding: 2 }}>
              {['list', 'cards'].map((m) => {
                const on = view === m;
                return (
                  <button key={m} onClick={() => onChangeView(m)}
                    style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12,
                      fontFamily: FONTS.sans, border: 'none', cursor: 'pointer',
                      background: on ? t.ink : 'transparent',
                      color:      on ? t.inkInk : t.ink2,
                      textTransform: 'capitalize' }}>{m}</button>
                );
              })}
            </span>
            <PrimaryButton t={t} onClick={onAddTrade}>Log a trade</PrimaryButton>
          </div>
        } />

      {view === 'list' ? (
        <div style={{ borderTop: `1px solid ${t.rule}`, marginTop: -16 }}>
          {trades.map((tr) => (
            <button key={tr.id} onClick={() => onNavigate('detail', tr.id)}
              style={{ display: 'grid', width: '100%',
                gridTemplateColumns: '64px 92px 110px 70px 1fr 80px 100px',
                gap: 24, alignItems: 'center', padding: '18px 0',
                borderBottom: `1px solid ${t.rule}`,
                background: 'transparent',
                border: 'none', borderBottom: `1px solid ${t.rule}`,
                cursor: 'pointer', textAlign: 'left',
                color: 'inherit', fontFamily: 'inherit',
                transition: 'background .12s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.paper)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontFamily: FONTS.serif, fontStyle: 'italic',
                color: t.ink3, fontSize: 13 }}>#{tr.id}</span>
              <span style={{ color: t.ink2, fontSize: 13 }}>{tr.date.slice(5)}</span>
              <span style={{ fontFamily: FONTS.serif, fontSize: 18, fontWeight: 500, color: t.ink }}>
                {tr.pair}
              </span>
              <span style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 13,
                color: tr.side === 'long' ? t.win : t.loss }}>{tr.side}</span>
              <span style={{ color: t.ink2, fontSize: 13, fontStyle: 'italic', fontFamily: FONTS.serif,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.tag}</span>
              <span style={{ color: t.ink3, fontSize: 13, textAlign: 'right' }}>
                {tr.pips > 0 ? `+${tr.pips}` : tr.pips} pips
              </span>
              <span style={{ textAlign: 'right' }}><Pnl t={t} pl={tr.pl} size="md" /></span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
          alignContent: 'start' }}>
          {trades.map((tr) => (
            <button key={tr.id} onClick={() => onNavigate('detail', tr.id)}
              style={{ background: t.paper, border: `1px solid ${t.rule}`,
                borderRadius: 4, padding: 20, minHeight: 156,
                display: 'flex', flexDirection: 'column', gap: 10,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                color: 'inherit', transition: 'transform .12s, border-color .12s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.rule2; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.rule; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: FONTS.serif, fontSize: 22, fontWeight: 500, color: t.ink }}>
                  {tr.pair}
                </span>
                <Pnl t={t} pl={tr.pl} />
              </div>
              <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14, color: t.ink2 }}>
                {tr.tag}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between',
                fontSize: 12, color: t.ink3, paddingTop: 12, borderTop: `1px solid ${t.rule}` }}>
                <span>{tr.date.slice(5)} · {tr.side}</span>
                <span>{tr.pips > 0 ? '+' : ''}{tr.pips} pips · {tr.rr}R</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TodayScreen, TradesScreen });
