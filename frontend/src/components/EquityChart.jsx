import { useState, useRef } from 'react';
import { pathFor, areaFor, usd } from '../chartUtils.js';

const PAD = 8;
const W = 800;

const CURRENCY_SYMBOL = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥',
  CHF: 'Fr', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', SGD: 'S$', HKD: 'HK$',
};

function fmtDate(d) {
  // YYYY-MM-DD → DD.MM.YY
  return `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(2, 4)}`;
}

export default function EquityChart({ t, points, height = 220, withAxes = true, accountCurrency = 'USD', accountBalance = 0 }) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const H = height;
  const gid = 'eq-grad-' + t.name;
  const symbol = CURRENCY_SYMBOL[accountCurrency] || accountCurrency;

  if (!points || points.length < 2) {
    return (
      <div style={{
        height: H, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.ink3,
      }}>
        Log some trades to see your equity curve.
      </div>
    );
  }

  // Precompute scale — must match pathFor / areaFor exactly
  const xs = points.map(p => p.d);
  const ys = points.map(p => p.v);
  const xmin = Math.min(...xs), xmax = Math.max(...xs);
  const ymin = Math.min(...ys), ymax = Math.max(...ys);
  const dx = xmax - xmin || 1;
  const dy = ymax - ymin || 1;
  const sx = (x) => PAD + (W - PAD * 2) * (x - xmin) / dx;
  const sy = (y) => H - PAD - (H - PAD * 2) * (y - ymin) / dy;

  function handleMouseMove(e) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const dataX = xmin + (svgX - PAD) / (W - PAD * 2) * dx;

    let nearest = points[0];
    let minDist = Infinity;
    for (const p of points) {
      const dist = Math.abs(p.d - dataX);
      if (dist < minDist) { minDist = dist; nearest = p; }
    }

    const pct = sx(nearest.d) / W; // 0–1, used for CSS left %
    setHover({ pct, svgX: sx(nearest.d), svgY: sy(nearest.v), point: nearest });
  }

  const v = hover?.point.v ?? 0;
  const isBalance = accountBalance > 0;
  const displayVal = isBalance
    ? `${symbol}${usd(Math.round(v))}`
    : `${v >= 0 ? '+' : '–'}${symbol}${usd(Math.abs(Math.round(v)))}`;

  // Tooltip horizontal alignment: flip left near right edge
  const tooltipAlign = !hover ? 'translateX(-50%)'
    : hover.pct > 0.75 ? 'translateX(calc(-100% + 8px))'
    : hover.pct < 0.15 ? 'translateX(-8px)'
    : 'translateX(-50%)';

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}
        viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        preserveAspectRatio="none"
        style={{ overflow: 'visible', display: 'block', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={t.win} stopOpacity={t.name === 'dark' ? 0.22 : 0.18} />
            <stop offset="1" stopColor={t.win} stopOpacity="0" />
          </linearGradient>
        </defs>

        {withAxes && [0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1={0} x2={W} y1={H * p} y2={H * p}
            stroke={t.rule} strokeDasharray="2 5" />
        ))}

        <path d={areaFor(points, W, H, PAD)} fill={`url(#${gid})`} />
        <path d={pathFor(points, W, H, PAD)} fill="none" stroke={t.win}
          strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />

        {hover && (
          <>
            <line
              x1={hover.svgX} x2={hover.svgX} y1={0} y2={H}
              stroke={t.rule2 || t.rule} strokeWidth={1} />
            <circle
              cx={hover.svgX} cy={hover.svgY} r={4.5}
              fill={t.win} stroke={t.isGlass ? 'rgba(0,0,0,.3)' : t.paper || '#111'} strokeWidth={1.5} />
          </>
        )}
      </svg>

      {hover && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: `${hover.pct * 100}%`,
          transform: tooltipAlign,
          pointerEvents: 'none',
          background: t.pane || (t.name === 'dark' ? 'rgba(20,20,20,.92)' : 'rgba(255,255,255,.92)'),
          border: `1px solid ${t.rule}`,
          borderRadius: 8,
          padding: '6px 10px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: t.shadowMd || '0 2px 10px rgba(0,0,0,.18)',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            fontFamily: t.serif, fontStyle: 'italic',
            fontSize: 11, color: t.ink2, marginBottom: 3,
          }}>
            {fmtDate(hover.point.date)}
          </div>
          <div style={{
            fontFamily: t.serif, fontSize: 16, fontWeight: 500,
            letterSpacing: -0.3, color: t.ink,
          }}>
            {displayVal}
          </div>
        </div>
      )}
    </div>
  );
}
