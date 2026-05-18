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

export default function Sidebar({ t, screen, onNavigate, mode, onToggleMode, trades }) {
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

  return (
    <aside style={{
      width: 208, flexShrink: 0,
      padding: '36px 28px 28px',
      borderRight: `1px solid ${t.rule}`,
      background: t.bg,
      display: 'flex', flexDirection: 'column', gap: 32,
    }}>
      <div style={{
        fontFamily: FONTS.serif, fontSize: 24, fontStyle: 'italic',
        fontWeight: 500, lineHeight: 1, letterSpacing: -0.3, color: t.ink,
      }}>
        FxLedger<span style={{ color: t.accent }}>.</span>
      </div>

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
        <div style={{
          fontSize: 12, color: t.ink3, lineHeight: 1.55,
          fontFamily: FONTS.serif, fontStyle: 'italic',
        }}>
          {dayName}, {dateOrd} of {monthName}.<br />
          {streakLine}
        </div>
        <ModeToggle t={t} mode={mode} onToggle={onToggleMode} />
      </div>
    </aside>
  );
}

function ModeToggle({ t, mode, onToggle }) {
  return (
    <button onClick={onToggle} aria-label="Toggle theme"
      style={{
        background: 'transparent', border: `1px solid ${t.rule2}`,
        borderRadius: 999, padding: 3, cursor: 'pointer',
        display: 'inline-flex', alignSelf: 'flex-start',
      }}>
      {['light', 'dark'].map((m) => {
        const on = mode === m;
        return (
          <span key={m} style={{
            width: 30, height: 26, borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: on ? t.ink : 'transparent',
            color: on ? t.inkInk : t.ink2,
            transition: 'background .18s, color .18s',
          }}>
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
