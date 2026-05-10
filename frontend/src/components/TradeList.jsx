import './TradeList.css';

const fmt = (n) => n != null ? (n >= 0 ? '+' : '') + Number(n).toFixed(2) + ' €' : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

export default function TradeList({ trades, onSelect }) {
  if (!trades.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">◎</div>
        <p>Noch keine Trades erfasst.</p>
        <p className="empty-sub">Klicke auf „+ Neuer Trade" um zu beginnen.</p>
      </div>
    );
  }

  return (
    <div className="trade-list">
      <div className="list-header">
        <span>{trades.length} Trade{trades.length !== 1 ? 's' : ''}</span>
        <span className="list-total" style={{
          color: trades.reduce((s, t) => s + (parseFloat(t.result_eur) || 0), 0) >= 0 ? 'var(--win)' : 'var(--loss)'
        }}>
          Gesamt: {fmt(trades.reduce((s, t) => s + (parseFloat(t.result_eur) || 0), 0))}
        </span>
      </div>

      <div className="trade-table">
        <div className="table-head">
          <span>Datum</span>
          <span>Pair</span>
          <span>Dir</span>
          <span>Kontext</span>
          <span>Anlauf</span>
          <span>Status</span>
          <span>P&L</span>
          <span>Tage</span>
        </div>
        {trades.map(t => (
          <div key={t.id} className="table-row" onClick={() => onSelect(t)}>
            <span className="mono text-dim">{fmtDate(t.trade_date)}</span>
            <span className="pair-cell">{t.pair}</span>
            <span><span className={`badge badge-${t.direction}`}>{t.direction}</span></span>
            <span className="text-dim">{t.daily_context}</span>
            <span className="text-dim approach">{t.approach_character}</span>
            <span><span className={`badge badge-${t.result_status}`}>{t.result_status}</span></span>
            <span className={`mono ${t.result_eur > 0 ? 'pnl-pos' : t.result_eur < 0 ? 'pnl-neg' : 'pnl-zero'}`}>
              {fmt(t.result_eur)}
            </span>
            <span className="mono text-dim">{t.duration_days ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
