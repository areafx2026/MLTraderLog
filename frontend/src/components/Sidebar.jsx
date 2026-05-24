import { FONTS } from '../theme.js';

const NAV_ITEMS = [
  { id: 'today',    label: 'Today'    },
  { id: 'trades',   label: 'Trades'   },
  { id: 'insights', label: 'Insights' },
  { id: 'settings', label: 'Settings' },
];

const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth',
  'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth',
  'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',
  'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth',
  'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth',
  'thirtieth', 'thirty-first'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function Sidebar({ t, screen, onNavigate, mode, theme, onSetTheme, trades, user }) {
  const isActive = (id) =>
    screen === id || (id === 'trades' && (screen === 'detail' || screen === 'add'));

  const today = new Date();
  const dayName = DAYS[today.getDay()];
  const dateOrd = ORDINALS[today.getDate()];
  const monthName = MONTHS[today.getMonth()];

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekISO = weekAgo.toISOString().slice(0, 10);
  const weekCount = trades.filter(tr => tr.date >= weekISO).length;

  const streakLine = weekCount > 0
    ? `${weekCount} trade${weekCount !== 1 ? 's' : ''} this week.`
    : 'Nothing logged yet.';

  const initial = ((user?.username || user?.email || '?')[0] || '?').toUpperCase();
  const displayName = user?.username || user?.email?.split('@')[0] || 'account';

  return (
    <aside style={{
      width: 208, flexShrink: 0,
      padding: '36px 28px 28px',
      borderRight: `1px solid ${t.rule}`,
      background: t.isGlass ? t.pane : (mode === 'light' ? t.paper : t.bg),
      display: 'flex', flexDirection: 'column', gap: 32,
      position: 'relative', zIndex: 1,
    }}>
      <img
        src={mode === 'light' ? '/lockup-light.png' : '/lockup-dark.png'}
        alt="FxLedger"
        style={{ height: 32, width: 'auto', display: 'block', alignSelf: 'flex-start', maxWidth: '100%' }}
      />

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id);
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: FONTS.sans, fontSize: 14, textAlign: 'left',
                color: active ? t.ink : t.ink2,
                fontWeight: active ? 600 : 400,
                padding: '7px 0 7px 12px', marginLeft: -12,
                borderLeft: `2px solid ${active ? t.accent : 'transparent'}`,
                transition: 'color .15s',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = t.ink; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = t.ink2; }}>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Avatar + username → profile */}
        <button onClick={() => onNavigate('profile')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '6px 0', display: 'flex', alignItems: 'center', gap: 10,
            borderRadius: 6, transition: 'opacity .15s', textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: t.accent, color: t.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONTS.sans, fontWeight: 700, fontSize: 13,
            flexShrink: 0,
          }}>
            {initial}
          </div>
          <span style={{
            fontFamily: FONTS.sans, fontSize: 12, color: t.ink2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {displayName}
          </span>
        </button>

        {/* Date + week info */}
        <div style={{
          fontSize: 12, color: t.ink3, lineHeight: 1.55,
          fontFamily: FONTS.serif, fontStyle: 'italic',
        }}>
          {dayName}, {dateOrd} of {monthName}.<br />
          {streakLine}
        </div>

        <ModeToggle t={t} theme={theme} onSetTheme={onSetTheme} />
      </div>
    </aside>
  );
}

const THEME_OPTIONS = [
  {
    id: 'light',
    label: 'Light',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="7" cy="7" r="2.6" />
        <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.7 2.7l1 1M10.3 10.3l1 1M2.7 11.3l1-1M10.3 3.7l1-1" />
      </svg>
    ),
  },
  {
    id: 'system',
    label: 'System',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="2" width="12" height="8" rx="1.2" />
        <path d="M4 13h6M7 10v3" />
      </svg>
    ),
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8.5A5.5 5.5 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z" />
      </svg>
    ),
  },
  {
    id: 'hyper',
    label: 'Hyper',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1L3 8h4l-1 5 6-7H8L8 1z" />
      </svg>
    ),
  },
];

export function ModeToggle({ t, theme, onSetTheme }) {
  return (
    <div aria-label="Theme" role="group"
      style={{
        background: 'transparent', border: `1px solid ${t.rule2}`,
        borderRadius: 999, padding: 3,
        display: 'inline-flex', alignSelf: 'flex-start',
      }}>
      {THEME_OPTIONS.map(({ id, label, icon }) => {
        const on = theme === id;
        const isHyperActive = on && id === 'hyper';
        return (
          <button key={id} onClick={() => onSetTheme(id)} aria-label={label}
            title={label}
            style={{
              width: 30, height: 26, borderRadius: 999, border: 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: isHyperActive
                ? 'linear-gradient(135deg, #a98bff, #5fdcf0)'
                : on ? t.ink : 'transparent',
              color: on ? (t.isGlass ? '#fff' : t.inkInk) : t.ink2,
              cursor: 'pointer',
              transition: 'background .18s, color .18s',
            }}>
            {icon}
          </button>
        );
      })}
    </div>
  );
}
