import { pathFor, areaFor } from '../chartUtils.js';

export default function EquityChart({ t, points, height = 220, withAxes = true }) {
  const W = 800, H = height;
  const gid = 'eq-grad-' + t.name;

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

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
      preserveAspectRatio="none" style={{ overflow: 'visible' }}>
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
      <path d={areaFor(points, W, H, 8)} fill={`url(#${gid})`} />
      <path d={pathFor(points, W, H, 8)} fill="none" stroke={t.win}
        strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={W - 8} cy={8} r={4} fill={t.win} />
    </svg>
  );
}
