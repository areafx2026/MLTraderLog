import './TradeStats.css';

const fmt = (n) => (n >= 0 ? '+' : '') + Number(n).toFixed(2) + ' €';
const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) + '%' : '—';

export default function TradeStats({ stats: s, trades }) {
  const total = parseInt(s.total_closed) || 0;
  const wins = parseInt(s.wins) || 0;
  const losses = parseInt(s.losses) || 0;
  const bes = parseInt(s.breakevens) || 0;
  const open = parseInt(s.open_trades) || 0;
  const pnl = parseFloat(s.total_pnl) || 0;
  const avgWin = parseFloat(s.avg_win) || 0;
  const avgLoss = parseFloat(s.avg_loss) || 0;
  const avgDur = parseFloat(s.avg_duration) || 0;
  const winRate = total > 0 ? (wins / total * 100).toFixed(1) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '—';

  // Monthly P&L
  const monthly = {};
  trades.forEach(t => {
    if (!t.trade_date || !t.result_eur || t.result_status === 'OPEN') return;
    const key = t.trade_date.slice(0, 7);
    monthly[key] = (monthly[key] || 0) + parseFloat(t.result_eur);
  });
  const months = Object.entries(monthly).sort();

  // Approach breakdown
  const approaches = {};
  trades.forEach(t => {
    if (t.result_status === 'OPEN') return;
    const a = t.approach_character;
    if (!approaches[a]) approaches[a] = { win: 0, loss: 0 };
    if (t.result_status === 'WIN') approaches[a].win++;
    else if (t.result_status === 'LOSS') approaches[a].loss++;
  });

  return (
    <div className="trade-stats">
      <div className="stats-title">Statistik</div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-val mono" style={{ color: pnl >= 0 ? 'var(--win)' : 'var(--loss)' }}>{fmt(pnl)}</div>
          <div className="kpi-label">Gesamt P&L</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono">{winRate}%</div>
          <div className="kpi-label">Win Rate</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono">{profitFactor}</div>
          <div className="kpi-label">Profit Factor</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono">{total}</div>
          <div className="kpi-label">Abgeschlossen</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono" style={{ color: 'var(--win)' }}>{wins}</div>
          <div className="kpi-label">Wins</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono" style={{ color: 'var(--loss)' }}>{losses}</div>
          <div className="kpi-label">Losses</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono" style={{ color: 'var(--be)' }}>{bes}</div>
          <div className="kpi-label">Break Even</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono" style={{ color: 'var(--open)' }}>{open}</div>
          <div className="kpi-label">Offen</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono" style={{ color: 'var(--win)' }}>+{avgWin.toFixed(0)} €</div>
          <div className="kpi-label">Ø Win</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono" style={{ color: 'var(--loss)' }}>-{avgLoss.toFixed(0)} €</div>
          <div className="kpi-label">Ø Loss</div>
        </div>
        <div className="kpi">
          <div className="kpi-val mono">{avgDur.toFixed(1)}</div>
          <div className="kpi-label">Ø Tage</div>
        </div>
      </div>

      {months.length > 0 && (
        <div className="stats-card">
          <div className="card-title">Monatlicher P&L</div>
          <div className="monthly-bars">
            {months.map(([m, val]) => (
              <div key={m} className="month-bar">
                <div className="month-label mono">{m.slice(5)}/{m.slice(2, 4)}</div>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${val >= 0 ? 'bar-win' : 'bar-loss'}`}
                    style={{ width: Math.min(100, Math.abs(val) / Math.max(...months.map(([, v]) => Math.abs(v))) * 100) + '%' }}
                  />
                </div>
                <div className={`month-val mono ${val >= 0 ? 'pnl-pos' : 'pnl-neg'}`}>{fmt(val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(approaches).length > 0 && (
        <div className="stats-card">
          <div className="card-title">Win Rate nach Anlauf-Charakter</div>
          {Object.entries(approaches).map(([a, { win, loss }]) => {
            const t = win + loss;
            const wr = t > 0 ? Math.round(win / t * 100) : 0;
            return (
              <div key={a} className="approach-stat">
                <div className="approach-label">{a}</div>
                <div className="approach-bar">
                  <div className="bar-track">
                    <div className="bar-fill bar-win" style={{ width: wr + '%' }} />
                  </div>
                  <span className="mono">{wr}% ({win}/{t})</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
