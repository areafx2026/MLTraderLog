// Forex Log — shared components (theme-aware).
// Every component reads color from the `t` prop (the active theme object) so
// the same JSX renders correctly in both light and dark.

// ── Sidebar nav ────────────────────────────────────────────────
function Sidebar({ t, screen, onNavigate, mode, onToggleMode }) {
  const items = [
    { id: 'today',    label: 'Today'    },
    { id: 'trades',   label: 'Trades'   },
    { id: 'insights', label: 'Insights' },
    { id: 'settings', label: 'Settings' },
  ];
  const isActive = (id) =>
    screen === id || (id === 'trades' && (screen === 'detail' || screen === 'add'));

  return (
    <aside style={{ width: 208, padding: '36px 28px 28px',
      borderRight: `1px solid ${t.rule}`,
      display: 'flex', flexDirection: 'column', gap: 32, flexShrink: 0 }}>
      {/* wordmark */}
      <div style={{ fontFamily: FONTS.serif, fontSize: 24, fontStyle: 'italic',
        fontWeight: 500, lineHeight: 1, letterSpacing: -0.3 }}>
        Ledger<span style={{ color: t.accent }}>.</span>
      </div>

      {/* primary nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => {
          const active = isActive(it.id);
          return (
            <button key={it.id} onClick={() => onNavigate(it.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: FONTS.sans, fontSize: 14, textAlign: 'left',
                color: active ? t.ink : t.ink2,
                fontWeight: active ? 600 : 400,
                padding: '7px 0 7px 12px', marginLeft: -12,
                borderLeft: `2px solid ${active ? t.accent : 'transparent'}`,
                transition: 'color .15s' }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = t.ink; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = t.ink2; }}>
              {it.label}
            </button>
          );
        })}
      </nav>

      {/* footer: streak note + mode toggle */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12, color: t.ink3, lineHeight: 1.55,
          fontFamily: FONTS.serif, fontStyle: 'italic' }}>
          Sunday, 17 May.<br/>
          You've journaled four weeks in a row.
        </div>
        <ModeToggle t={t} mode={mode} onToggle={onToggleMode} />
      </div>
    </aside>
  );
}

// ── Mode toggle (sun ↔ moon) ────────────────────────────────────
function ModeToggle({ t, mode, onToggle }) {
  return (
    <button onClick={onToggle} aria-label="Toggle theme"
      style={{ background: 'transparent', border: `1px solid ${t.rule2}`,
        borderRadius: 999, padding: 3, cursor: 'pointer',
        display: 'inline-flex', alignSelf: 'flex-start', gap: 0 }}>
      {['light', 'dark'].map((m) => {
        const on = mode === m;
        return (
          <span key={m} style={{ width: 30, height: 26, borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: on ? t.ink : 'transparent',
            color:      on ? t.inkInk : t.ink2,
            transition: 'background .18s, color .18s' }}>
            {m === 'light' ? (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="7" cy="7" r="2.6" />
                <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.7 2.7l1 1M10.3 10.3l1 1M2.7 11.3l1-1M10.3 3.7l1-1" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8.5A5.5 5.5 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z" />
              </svg>
            )}
          </span>
        );
      })}
    </button>
  );
}

// ── Header (page title + actions) ────────────────────────────────
function Header({ t, eyebrow, title, italicTail, action, right }) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 24, marginBottom: 40 }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14,
            color: t.ink2, marginBottom: 8 }}>{eyebrow}</div>
        )}
        <h1 style={{ fontFamily: FONTS.serif, fontWeight: 400, fontSize: 44, margin: 0,
          letterSpacing: -0.8, lineHeight: 1.05, color: t.ink }}>
          {title}
          {italicTail && <><br/><span style={{ fontStyle: 'italic', color: t.ink2 }}>{italicTail}</span></>}
        </h1>
      </div>
      {right}
      {action}
    </header>
  );
}

// ── Buttons ────────────────────────────────────────────────────
function PrimaryButton({ t, children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: t.ink, color: t.inkInk, border: 'none',
        padding: '12px 22px', borderRadius: 999, fontFamily: FONTS.sans, fontWeight: 500,
        fontSize: 14, letterSpacing: 0.1, cursor: 'pointer',
        transition: 'transform .12s, opacity .12s' }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
      {children}
    </button>
  );
}
function GhostButton({ t, children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: 'transparent', color: t.ink2, border: `1px solid ${t.rule2}`,
        padding: '11px 16px', borderRadius: 999, fontFamily: FONTS.sans, fontWeight: 500,
        fontSize: 14, cursor: 'pointer' }}>
      {children}
    </button>
  );
}

// ── Pl pill ────────────────────────────────────────────────────
function Pnl({ t, pl, size = 'md', bold = true }) {
  const color = pl === 0 ? t.ink3 : pl > 0 ? t.win : t.loss;
  const txt = pl === 0 ? '—' : pl > 0 ? `+$${pl}` : `–$${Math.abs(pl)}`;
  const fs = size === 'lg' ? 32 : size === 'md' ? 20 : 16;
  return (
    <span style={{ fontFamily: FONTS.serif, fontSize: fs, fontWeight: bold ? 500 : 400,
      color, letterSpacing: -0.3 }}>{txt}</span>
  );
}

// ── Sparkline ──────────────────────────────────────────────────
function Sparkline({ t, points, w = 80, h = 28, stroke }) {
  const { pathFor } = window.FX;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <path d={pathFor(points, w, h, 2)} fill="none"
        stroke={stroke || t.win} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Equity curve (large) ───────────────────────────────────────
function EquityChart({ t, height = 220, withAxes = true }) {
  const { equity, pathFor, areaFor } = window.FX;
  const W = 800, H = height;
  const gid = 'eq-grad-' + t.name;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none"
      style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0"  stopColor={t.win} stopOpacity={t.name === 'dark' ? 0.22 : 0.18} />
          <stop offset="1"  stopColor={t.win} stopOpacity="0" />
        </linearGradient>
      </defs>
      {withAxes && [0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={0} x2={W} y1={H * p} y2={H * p} stroke={t.rule} strokeDasharray="2 5" />
      ))}
      <path d={areaFor(equity, W, H, 8)} fill={`url(#${gid})`} />
      <path d={pathFor(equity, W, H, 8)} fill="none" stroke={t.win}
        strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={W - 8} cy={8} r={4} fill={t.win} />
    </svg>
  );
}

// ── Trade-price chart (single trade detail) ────────────────────
function TradeChart({ t, height = 220 }) {
  const { pathFor, areaFor } = window.FX;
  const pts = [
    { d: 0, v: 1.0830 }, { d: 1, v: 1.0835 }, { d: 2, v: 1.0828 }, { d: 3, v: 1.0842 },
    { d: 4, v: 1.0840 }, { d: 5, v: 1.0851 }, { d: 6, v: 1.0865 }, { d: 7, v: 1.0858 },
    { d: 8, v: 1.0876 }, { d: 9, v: 1.0884 }, { d:10, v: 1.0892 }, { d:11, v: 1.0901 },
    { d:12, v: 1.0898 },
  ];
  const W = 760, H = height;
  const step = (W - 16) / 12;
  const entryX = 3 * step + 8;
  const exitX  = 11 * step + 8;
  const gid = 'tr-grad-' + t.name;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={t.win} stopOpacity={t.name === 'dark' ? 0.18 : 0.16} />
          <stop offset="1" stopColor={t.win} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={0} x2={W} y1={H * p} y2={H * p} stroke={t.rule} strokeDasharray="2 5" />
      ))}
      <line x1={entryX} x2={entryX} y1={0} y2={H} stroke={t.ink3} strokeDasharray="3 3" strokeWidth="0.8" />
      <line x1={exitX}  x2={exitX}  y1={0} y2={H} stroke={t.win} strokeDasharray="3 3" strokeWidth="0.8" opacity="0.7" />
      <path d={areaFor(pts, W, H, 8)} fill={`url(#${gid})`} />
      <path d={pathFor(pts, W, H, 8)} fill="none" stroke={t.win} strokeWidth="1.6" strokeLinejoin="round" />
      <text x={entryX + 6} y={20} fill={t.ink2} fontSize="11"
        fontFamily={FONTS.serif} fontStyle="italic">entry 1.0842</text>
      <text x={exitX + 6}  y={20} fill={t.win}  fontSize="11"
        fontFamily={FONTS.serif} fontStyle="italic">exit 1.0901</text>
    </svg>
  );
}

// ── Stat (big serif number with caption) ───────────────────────
function Stat({ t, label, value, sub }) {
  return (
    <div>
      <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12,
        color: t.ink2, marginBottom: 8, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ fontFamily: FONTS.serif, fontSize: 34, fontWeight: 500,
        letterSpacing: -0.5, lineHeight: 1, color: t.ink }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: t.ink3, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

Object.assign(window, {
  Sidebar, ModeToggle, Header,
  PrimaryButton, GhostButton,
  Pnl, Sparkline, EquityChart, TradeChart, Stat,
});
