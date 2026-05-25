import { usd, formatMonthYear } from '../chartUtils.js';

function PrimaryButton({ t, children, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background: t.ink, color: t.inkInk, border: 'none',
        padding: '12px 22px', borderRadius: 999, fontFamily: t.sans,
        fontWeight: 500, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
      {children}
    </button>
  );
}

function Pnl({ t, pl }) {
  const color = pl === 0 ? t.ink3 : pl > 0 ? t.win : t.loss;
  const txt = pl === 0 ? '—' : pl > 0 ? `+$${usd(pl)}` : `–$${usd(Math.abs(pl))}`;
  return (
    <span style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 500, color, letterSpacing: -0.3 }}>
      {txt}
    </span>
  );
}

function SegmentedToggle({ t, value, options, onChange }) {
  return (
    <span style={{
      display: 'inline-flex', borderRadius: 999,
      border: `1px solid ${t.rule2}`, padding: 2,
    }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(o)}
            style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12,
              fontFamily: t.sans, border: 'none', cursor: 'pointer',
              background: on ? t.ink : 'transparent',
              color: on ? t.inkInk : t.ink2,
              textTransform: 'capitalize',
            }}>{o}</button>
        );
      })}
    </span>
  );
}

export default function TradeList({ t, trades, view, onChangeView, onNavigate, onAddTrade }) {
  const monthStr = formatMonthYear();
  const monthTotal = trades.reduce((s, tr) => s + (tr.pl || 0), 0);
  const subtitle = `${monthStr} · ${trades.length} trade${trades.length !== 1 ? 's' : ''} · ${monthTotal >= 0 ? '+' : '–'}$${usd(Math.abs(monthTotal))}`;

  return (
    <div style={{
      flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0,
      display: 'flex', flexDirection: 'column',
    }}>
      <header style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 24, marginBottom: 40,
      }}>
        <h1 style={{
          fontFamily: t.serif, fontWeight: 400, fontSize: 44, margin: 0,
          letterSpacing: -0.8, lineHeight: 1.05, color: t.ink,
        }}>Trades</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13, color: t.ink2 }}>
          <span style={{ fontStyle: 'italic', fontFamily: t.serif, whiteSpace: 'nowrap' }}>
            {subtitle}
          </span>
          <SegmentedToggle t={t} value={view} options={['list', 'cards']} onChange={onChangeView} />
          <PrimaryButton t={t} onClick={onAddTrade}>Log a trade</PrimaryButton>
        </div>
      </header>

      {trades.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 18, color: t.ink3,
        }}>
          No trades yet — log your first one.
        </div>
      ) : view === 'list' ? (
        <ListView t={t} trades={trades} onNavigate={onNavigate} />
      ) : (
        <CardsView t={t} trades={trades} onNavigate={onNavigate} />
      )}
    </div>
  );
}

function ListView({ t, trades, onNavigate }) {
  return (
    <div style={{ borderTop: `1px solid ${t.rule}` }}>
      {trades.map((tr) => (
        <button key={tr.id} onClick={() => onNavigate('detail', tr.id)}
          style={{
            display: 'grid', width: '100%',
            gridTemplateColumns: '64px 92px 110px 70px 1fr 80px 100px',
            gap: 24, alignItems: 'center', padding: '18px 0',
            background: 'transparent', border: 'none',
            borderBottom: `1px solid ${t.rule}`,
            cursor: 'pointer', textAlign: 'left',
            color: 'inherit', fontFamily: 'inherit',
            transition: 'background .12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t.paper)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
          <span style={{ fontFamily: t.serif, fontStyle: 'italic', color: t.ink3, fontSize: 13 }}>
            #{tr.id}
          </span>
          <span style={{ color: t.ink2, fontSize: 13 }}>{tr.date.slice(5)}</span>
          <span style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 500, color: t.ink }}>
            {tr.pair}
          </span>
          <span style={{
            fontFamily: t.serif, fontStyle: 'italic', fontSize: 13,
            color: tr.side === 'long' ? t.win : t.loss,
          }}>{tr.side}</span>
          <span style={{
            color: t.ink2, fontSize: 13, fontStyle: 'italic', fontFamily: t.serif,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{tr.tag || '—'}</span>
          <span style={{ color: t.ink3, fontSize: 13, textAlign: 'right' }}>
            {tr.pips ? `${tr.pips > 0 ? '+' : ''}${tr.pips} pips` : '—'}
          </span>
          <span style={{ textAlign: 'right' }}>
            <Pnl t={t} pl={tr.pl} />
          </span>
        </button>
      ))}
    </div>
  );
}

function CardsView({ t, trades, onNavigate }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, alignContent: 'start' }}>
      {trades.map((tr) => (
        <button key={tr.id} onClick={() => onNavigate('detail', tr.id)}
          style={{
            background: t.paper, border: `1px solid ${t.rule}`,
            borderRadius: 4, padding: 20, minHeight: 140,
            display: 'flex', flexDirection: 'column', gap: 10,
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            color: 'inherit', transition: 'transform .12s, border-color .12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = t.rule2;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.rule;
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, color: t.ink }}>
              {tr.pair}
            </span>
            <Pnl t={t} pl={tr.pl} />
          </div>
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.ink2 }}>
            {tr.tag || tr.note?.slice(0, 60) || '—'}
          </div>
          <div style={{
            marginTop: 'auto', display: 'flex', justifyContent: 'space-between',
            fontSize: 12, color: t.ink3,
            paddingTop: 12, borderTop: `1px solid ${t.rule}`,
          }}>
            <span>{tr.date.slice(5)} · {tr.side}</span>
            <span>
              {tr.pips ? `${tr.pips > 0 ? '+' : ''}${tr.pips} pips` : '—'}
              {tr.rr ? ` · ${tr.rr}R` : ''}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
