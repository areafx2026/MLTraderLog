import './TradeDetail.css';

const fmt = (n) => n != null ? (n >= 0 ? '+' : '') + Number(n).toFixed(2) + ' €' : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const fmtPrice = (p) => p != null ? Number(p).toFixed(5) : '—';

export default function TradeDetail({ trade: t, onEdit, onDelete, onBack }) {
  const rr = (() => {
    const e = parseFloat(t.entry_price);
    const sl = parseFloat(t.sl_price);
    const tp = parseFloat(t.tp_price);
    if (!e || !sl || !tp) return null;
    const risk = Math.abs(e - sl);
    const reward = Math.abs(tp - e);
    if (!risk) return null;
    return (reward / risk).toFixed(2);
  })();

  const h1checks = [
    { key: 'h1_slowing', label: 'Abbremsen' },
    { key: 'h1_wicks', label: 'Wicks / Ablehnung' },
    { key: 'h1_stabilization', label: 'Stabilisierung' },
    { key: 'h1_rejection', label: 'Rejection Candle' },
  ];

  return (
    <div className="trade-detail">
      <div className="detail-topbar">
        <button className="btn-secondary back-btn" onClick={onBack}>← Zurück</button>
        <div className="detail-actions">
          <button className="btn-secondary" onClick={() => onEdit(t)}>Bearbeiten</button>
          <button className="btn-danger" onClick={() => onDelete(t.id)}>Löschen</button>
        </div>
      </div>

      <div className="detail-header">
        <div className="detail-pair">{t.pair}</div>
        <span className={`badge badge-${t.direction}`}>{t.direction}</span>
        <span className={`badge badge-${t.result_status}`}>{t.result_status}</span>
        <div className={`detail-pnl mono ${t.result_eur > 0 ? 'pnl-pos' : t.result_eur < 0 ? 'pnl-neg' : 'pnl-zero'}`}>
          {fmt(t.result_eur)}
        </div>
        <div className="detail-date mono">{fmtDate(t.trade_date)}{t.duration_days ? ` · ${t.duration_days} Tage` : ''}</div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="card-title">Kontext</div>
          <div className="card-row"><span>Marktstruktur</span><span>{t.daily_context}</span></div>
          <div className="card-row"><span>Anlauf</span><span>{t.approach_character}</span></div>
          <div className="card-row"><span>Zone Tests</span><span>{t.zone_tests ?? '—'}</span></div>
          <div className="card-row"><span>Letzter Test</span><span>{t.zone_last_test_days ? `vor ${t.zone_last_test_days} Tagen` : '—'}</span></div>
        </div>

        <div className="detail-card">
          <div className="card-title">H1-Verhalten</div>
          <div className="h1-checks">
            {h1checks.map(({ key, label }) => (
              <div key={key} className={`h1-check ${t[key] ? 'active' : ''}`}>
                <span>{t[key] ? '✓' : '○'}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-card">
          <div className="card-title">Levels</div>
          <div className="card-row"><span>Entry</span><span className="mono">{fmtPrice(t.entry_price)}</span></div>
          <div className="card-row"><span>Stop Loss</span><span className="mono" style={{color:'var(--loss)'}}>{fmtPrice(t.sl_price)}</span></div>
          <div className="card-row"><span>Take Profit</span><span className="mono" style={{color:'var(--win)'}}>{fmtPrice(t.tp_price)}</span></div>
          <div className="card-row"><span>R:R</span><span className="mono" style={{color:'var(--accent)'}}>{rr ? `1 : ${rr}` : '—'}</span></div>
        </div>
      </div>

      {t.entry_trigger && (
        <div className="detail-card detail-card-full">
          <div className="card-title">Entry-Trigger</div>
          <p className="detail-text">{t.entry_trigger}</p>
        </div>
      )}

      {t.notes && (
        <div className="detail-card detail-card-full">
          <div className="card-title">Notizen</div>
          <p className="detail-text">{t.notes}</p>
        </div>
      )}

      {(t.screenshot_1 || t.screenshot_2) && (
        <div className="detail-card detail-card-full">
          <div className="card-title">Screenshots</div>
          <div className="detail-screenshots">
            {t.screenshot_1 && <img src={`/uploads/${t.screenshot_1}`} alt="Screenshot 1" onClick={() => window.open(`/uploads/${t.screenshot_1}`)} />}
            {t.screenshot_2 && <img src={`/uploads/${t.screenshot_2}`} alt="Screenshot 2" onClick={() => window.open(`/uploads/${t.screenshot_2}`)} />}
          </div>
        </div>
      )}
    </div>
  );
}
