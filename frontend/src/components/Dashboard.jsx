import { useState } from 'react';
import { usd, formatDateLong } from '../chartUtils.js';
import EquityChart from './EquityChart.jsx';

const RANGES = [
  { label: '30d',  days: 30  },
  { label: '3mo',  days: 90  },
  { label: '1yr',  days: 365 },
  { label: 'All',  days: null },
];

function filterEquity(equity, days) {
  if (!days || equity.length === 0) return equity;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const filtered = equity.filter(p => p.date >= cutoffStr);
  return filtered.map((p, i) => ({ ...p, d: i }));
}

function Stat({ t, label, value, sub, subColor }) {
  return (
    <div>
      <div style={{
        fontFamily: t.serif, fontStyle: 'italic', fontSize: 12,
        color: t.ink2, marginBottom: 8, letterSpacing: 0.2,
      }}>{label}</div>
      <div style={{
        fontFamily: t.serif, fontSize: 34, fontWeight: 500,
        letterSpacing: -0.5, lineHeight: 1, color: t.ink,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: subColor || t.ink3, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function getTodayTitle(trades) {
  const recent = trades.slice(0, 5);
  const wins = recent.filter(t => t.pl > 0).length;
  const losses = recent.filter(t => t.pl < 0).length;
  if (trades.length === 0) return 'Welcome back.';
  if (wins >= 4) return 'A strong week.';
  if (wins > losses * 1.5) return 'A steady week.';
  if (losses > wins * 1.5) return 'A harder week.';
  if (losses === 0 && wins > 0) return 'Clean streak.';
  return 'A mixed week.';
}

function getTodayTail(trades) {
  const recent = trades.slice(0, 5);
  const wins = recent.filter(t => t.pl > 0).length;
  const losses = recent.filter(t => t.pl < 0).length;
  const scratches = recent.filter(t => t.pl === 0 && t.status !== 'OPEN').length;
  const nums = ['zero', 'one', 'two', 'three', 'four', 'five'];
  const n = (x) => nums[x] || String(x);
  const parts = [];
  if (wins > 0) parts.push(`${n(wins)} green${wins > 1 ? 's' : ''}`);
  if (losses > 0) parts.push(`${n(losses)} red${losses > 1 ? 's' : ''}`);
  if (scratches > 0) parts.push(`${n(scratches)} scratch${scratches > 1 ? 'es' : ''}`);
  return parts.length > 0 ? parts.join(', ') + '.' : null;
}

export default function Dashboard({ t, trades, stats, equity, loading, onNavigate, onAddTrade, accountCurrency, accountBalance }) {
  const [activeRange, setActiveRange] = useState(0); // index into RANGES
  const eyebrow = formatDateLong();
  const title = getTodayTitle(trades);
  const tail = getTodayTail(trades);
  const visibleEquity = filterEquity(equity, RANGES[activeRange].days);

  const totalPL = stats.totalPL || 0;
  const monthPL = stats.monthPL || 0;

  return (
    <div style={{ flex: 1, padding: '56px 72px 40px', overflow: 'auto', minWidth: 0 }}>
      {/* header */}
      <header style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 24, marginBottom: 40,
      }}>
        <div>
          <div style={{
            fontFamily: t.serif, fontStyle: 'italic', fontSize: 14,
            color: t.ink2, marginBottom: 8,
          }}>{eyebrow}</div>
          <h1 style={{
            fontFamily: t.serif, fontWeight: 400, fontSize: 44, margin: 0,
            letterSpacing: -0.8, lineHeight: 1.05, color: t.ink,
          }}>
            {title}
            {tail && (
              <><br /><span style={{ fontStyle: 'italic', color: t.ink2 }}>{tail}</span></>
            )}
          </h1>
        </div>
        <PrimaryButton t={t} onClick={onAddTrade}>Log a trade</PrimaryButton>
      </header>

      {/* equity chart */}
      <section style={{ marginBottom: 40 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'end', marginBottom: 18,
        }}>
          <div style={{
            fontFamily: t.serif, fontSize: 16, fontStyle: 'italic', color: t.ink2,
          }}>
            Equity curve
          </div>
          {equity.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: t.serif, fontSize: 36, fontWeight: 500,
                letterSpacing: -0.5, color: t.ink, lineHeight: 1,
              }}>
                {totalPL >= 0 ? '+' : '–'}${usd(Math.abs(totalPL))}
              </div>
              <div style={{ fontSize: 12, color: monthPL >= 0 ? t.win : t.loss, fontWeight: 500, marginTop: 2 }}>
                {monthPL >= 0 ? '+' : '–'}${usd(Math.abs(monthPL))} · this month
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, fontSize: 13, justifyContent: 'flex-end' }}>
            {RANGES.map((r, i) => (
              <span key={r.label} onClick={() => setActiveRange(i)}
                style={{
                  color: i === activeRange ? t.ink : t.ink3,
                  fontWeight: i === activeRange ? 600 : 400,
                  borderBottom: i === activeRange ? `1px solid ${t.ink}` : 'none',
                  paddingBottom: 2, cursor: 'pointer',
                  transition: 'color .15s',
                }}>{r.label}</span>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          {loading ? (
            <div style={{
              height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.ink3,
            }}>Loading…</div>
          ) : (
            <EquityChart t={t} points={visibleEquity} height={220} />
          )}
        </div>
      </section>

      {/* stats row */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32,
        ...(t.isGlass ? {
          padding: '28px 32px',
          background: t.pane,
          border: `1px solid ${t.rule}`,
          borderRadius: 18,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          marginBottom: 28,
          ...(t.shadowMd ? { boxShadow: t.shadowMd } : {}),
        } : {
          padding: '28px 0',
          borderTop: `1px solid ${t.rule2}`,
          borderBottom: `1px solid ${t.rule}`,
        }),
      }}>
        <Stat t={t} label="Win rate"
          value={stats.totalClosed > 0 ? `${stats.winRate}%` : '—'}
          sub={stats.totalClosed > 0 ? `of ${stats.totalClosed} trades` : 'no trades yet'} />
        <Stat t={t} label="Avg R:R"
          value={stats.avgRR > 0 ? stats.avgRR : '—'}
          sub={stats.avgRR > 0 ? 'on winning trades' : 'no winners yet'} />
        <Stat t={t} label="Current Win streak"
          value={stats.streak > 0 ? stats.streak : '—'}
          sub={stats.streak > 0 ? 'and counting' : 'start one'} />
        <Stat t={t} label="Highest Win streak"
          value={stats.highestStreak > 0 ? stats.highestStreak : '—'}
          sub={stats.highestStreak > 0 ? `best run` : 'no winners yet'} />
        <Stat t={t} label="Drawdown"
          value={stats.drawdown < 0 && accountBalance > 0 ? `${stats.drawdown}%` : '—'}
          sub={accountBalance > 0 ? (stats.drawdown < 0 ? 'from peak' : 'none') : 'set balance in settings'}
          subColor={accountBalance === 0 ? t.loss : undefined} />
      </section>

      {/* recent trades */}
      <section style={{ marginTop: t.isGlass ? 0 : 28 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: t.serif, fontSize: 16, fontStyle: 'italic', color: t.ink2,
          }}>Recent</div>
          <button onClick={() => onNavigate('trades')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: t.sans, fontSize: 13, color: t.accent,
            }}>
            See all →
          </button>
        </div>

        {trades.length === 0 ? (
          <div style={{
            padding: '32px 0', fontFamily: t.serif, fontStyle: 'italic',
            fontSize: 16, color: t.ink3,
          }}>
            No trades logged yet.
          </div>
        ) : (
          trades.slice(0, 5).map((tr) => (
            <button key={tr.id} onClick={() => onNavigate('detail', tr.id)}
              style={{
                display: 'grid', width: '100%',
                gridTemplateColumns: '80px 100px 1fr 80px 100px',
                gap: 24, alignItems: 'center', padding: '14px 0',
                borderBottom: `1px solid ${t.rule}`,
                background: 'transparent', border: 'none',
                borderBottom: `1px solid ${t.rule}`,
                cursor: 'pointer', textAlign: 'left',
                color: 'inherit', fontFamily: 'inherit',
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.isGlass ? t.pane : t.paper)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ color: t.ink2, fontSize: 13 }}>{tr.date.slice(8)}.{tr.date.slice(5,7)}.{tr.date.slice(2,4)}</span>
              <span style={{
                fontFamily: t.serif, fontSize: 18, fontWeight: 500, color: t.ink,
              }}>{tr.pair}</span>
              <span style={{
                color: t.ink2, fontSize: 13, fontStyle: 'italic', fontFamily: t.serif,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{tr.tag || tr.note?.slice(0, 40) || '—'}</span>
              <span style={{ color: t.ink3, fontSize: 13, textAlign: 'right' }}>
                {tr.pips > 0 ? '+' : ''}{tr.pips ? tr.pips + ' pips' : '—'}
              </span>
              <span style={{ textAlign: 'right' }}>
                <Pnl t={t} pl={tr.pl} />
              </span>
            </button>
          ))
        )}
      </section>
    </div>
  );
}

function PrimaryButton({ t, children, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background: t.gradientPrimary || t.ink,
        color: t.gradientPrimary ? '#fff' : t.inkInk,
        border: 'none',
        padding: '12px 22px', borderRadius: 999, fontFamily: t.sans,
        fontWeight: 600, fontSize: 14, letterSpacing: 0.1, cursor: 'pointer',
        whiteSpace: 'nowrap', flexShrink: 0,
        ...(t.shadowGlow ? { boxShadow: t.shadowGlow } : {}),
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
      {children}
    </button>
  );
}

function Pnl({ t, pl }) {
  const color = pl === 0 ? t.ink3 : pl > 0 ? t.win : t.loss;
  const txt = pl === 0 ? '—' : pl > 0 ? `+$${usd(pl)}` : `–$${usd(Math.abs(pl))}`;
  return (
    <span style={{
      fontFamily: t.isGlass ? t.mono : t.serif,
      fontSize: 18, fontWeight: 500,
      color, letterSpacing: t.isGlass ? 0 : -0.3,
    }}>{txt}</span>
  );
}
