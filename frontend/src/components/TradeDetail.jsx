import { usd } from '../chartUtils.js';

function TradeSchematicChart({ t, trade, height = 220 }) {
  const W = 760, H = height;
  if (!trade.exit || trade.status === 'OPEN') {
    return (
      <div style={{
        height: H, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.ink3,
      }}>
        Trade still open — no exit yet.
      </div>
    );
  }

  const isJpy = (trade.pair || '').includes('JPY');
  const isWin = trade.pl > 0;
  const lineColor = isWin ? t.win : t.loss;

  const entryY_pct = isWin ? 0.7 : 0.3;
  const exitY_pct  = isWin ? 0.2 : 0.8;
  const entryX = W * 0.28, exitX = W * 0.72;
  const pad = 16;

  const points = [
    [pad, H * entryY_pct + (Math.random() - 0.5) * 20],
    [entryX * 0.6, H * entryY_pct + (Math.random() - 0.5) * 10],
    [entryX, H * entryY_pct],
    [W * 0.5, H * (entryY_pct + exitY_pct) / 2 + (Math.random() - 0.5) * 15],
    [exitX, H * exitY_pct],
    [W - pad, H * exitY_pct + (Math.random() - 0.5) * 10],
  ];
  const pathD = points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  const fmt = (p) => p ? p.toFixed(isJpy ? 2 : 4) : '';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={0} x2={W} y1={H * p} y2={H * p} stroke={t.rule} strokeDasharray="2 5" />
      ))}
      <line x1={entryX} x2={entryX} y1={0} y2={H} stroke={t.ink3} strokeDasharray="3 3" strokeWidth="0.8" />
      <line x1={exitX}  x2={exitX}  y1={0} y2={H} stroke={lineColor} strokeDasharray="3 3" strokeWidth="0.8" opacity="0.7" />
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <text x={entryX + 6} y={20} fill={t.ink2} fontSize="11" fontFamily={t.serif} fontStyle="italic">
        entry {fmt(trade.entry)}
      </text>
      <text x={exitX + 6} y={20} fill={lineColor} fontSize="11" fontFamily={t.serif} fontStyle="italic">
        exit {fmt(trade.exit)}
      </text>
    </svg>
  );
}

export default function TradeDetail({ t, trade, onBack, onEdit, onDelete }) {
  if (!trade) {
    return (
      <div style={{ flex: 1, padding: '40px 72px', color: t.ink3, fontFamily: t.serif, fontStyle: 'italic' }}>
        Trade not found.
      </div>
    );
  }

  const isWin = trade.pl > 0;
  const isLoss = trade.pl < 0;
  const plColor = trade.pl === 0 ? t.ink3 : isWin ? t.win : t.loss;
  const plText = trade.pl === 0 ? '—'
    : isWin ? `+$${usd(trade.pl)}` : `–$${usd(Math.abs(trade.pl))}`;

  const rows = [
    ['Setup',      trade.tag || '—'],
    ['Direction',  `${trade.side.charAt(0).toUpperCase() + trade.side.slice(1)}${trade.size ? ' · ' + trade.size + ' lots' : ''}`],
    ['Entry',      trade.entry ? trade.entry.toFixed((trade.pair || '').includes('JPY') ? 2 : 4) : '—'],
    ['Exit',       trade.exit  ? trade.exit.toFixed((trade.pair || '').includes('JPY') ? 2 : 4) : 'open'],
    ['Stop',       trade.sl ? trade.sl.toFixed((trade.pair || '').includes('JPY') ? 2 : 4) : '—'],
    ['R-multiple', trade.rr ? `${trade.rr > 0 ? '+' : ''}${trade.rr} R` : '—'],
    ['Mood',       trade.mood ? trade.mood.charAt(0).toUpperCase() + trade.mood.slice(1) : '—'],
    ['Status',     trade.status || '—'],
  ];

  return (
    <div style={{ flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0 }}>
      {/* back + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button onClick={onBack}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 13, color: t.ink3, padding: 0, fontFamily: t.sans,
          }}>
          ← Trades
        </button>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => onEdit(trade)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13, color: t.ink2, fontFamily: t.sans,
            }}>
            Edit
          </button>
          <button onClick={() => onDelete(trade.id)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13, color: t.loss, fontFamily: t.sans, opacity: 0.7,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}>
            Delete
          </button>
        </div>
      </div>

      {/* header */}
      <header style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        paddingBottom: 22, marginBottom: 28, borderBottom: `1px solid ${t.rule2}`, gap: 24,
      }}>
        <div>
          <div style={{
            fontFamily: t.serif, fontStyle: 'italic', color: t.ink2,
            fontSize: 14, marginBottom: 6,
          }}>
            Trade #{trade.id} · {trade.date.slice(5)}{trade.time && trade.time !== '00:00' ? ', ' + trade.time : ''}
          </div>
          <h1 style={{
            fontFamily: t.serif, fontWeight: 400, fontSize: 48, margin: 0,
            letterSpacing: -0.8, lineHeight: 1, color: t.ink,
          }}>
            {trade.pair}{' '}
            <span style={{ fontStyle: 'italic', color: t.ink2 }}>{trade.side}</span>
          </h1>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontFamily: t.serif, fontWeight: 500, fontSize: 44,
            color: plColor, letterSpacing: -0.5, lineHeight: 1,
          }}>
            {plText}
          </div>
          <div style={{ fontSize: 13, color: t.ink2, marginTop: 6 }}>
            {trade.pips ? `${trade.pips > 0 ? '+' : ''}${trade.pips} pips` : ''}
            {trade.rr ? ` · ${trade.rr}R` : ''}
            {trade.size ? ` · ${trade.size} lots` : ''}
          </div>
        </div>
      </header>

      {/* body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48 }}>
        <div>
          <div style={{
            background: t.paper, border: `1px solid ${t.rule}`,
            borderRadius: 4, padding: 24, marginBottom: 24,
          }}>
            <TradeSchematicChart t={t} trade={trade} height={220} />
          </div>

          {trade.note && (
            <div>
              <div style={{
                fontFamily: t.serif, fontStyle: 'italic', fontSize: 14,
                color: t.ink2, marginBottom: 12,
              }}>Reflection</div>
              <p style={{
                fontFamily: t.serif, fontSize: 19, lineHeight: 1.6, margin: 0,
                color: t.ink, maxWidth: '60ch',
              }}>
                {trade.note}
              </p>
            </div>
          )}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              borderBottom: `1px solid ${t.rule}`, paddingBottom: 10, gap: 12,
            }}>
              <span style={{
                color: t.ink2, fontFamily: t.serif, fontStyle: 'italic',
                fontSize: 13, whiteSpace: 'nowrap',
              }}>{k}</span>
              <span style={{
                color: t.ink, fontFamily: t.serif, fontWeight: 500,
                fontSize: 13, whiteSpace: 'nowrap', textAlign: 'right',
              }}>{v}</span>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
