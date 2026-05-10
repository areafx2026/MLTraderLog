import { useState, useRef } from 'react';
import './TradeForm.css';

const API = '/api';

const defaults = {
  pair: 'EURGBP',
  trade_date: new Date().toISOString().slice(0, 10),
  direction: 'LONG',
  daily_context: 'RANGE',
  zone_tests: '',
  zone_last_test_days: '',
  approach_character: 'IMPULSIV',
  h1_slowing: false,
  h1_wicks: false,
  h1_stabilization: false,
  h1_rejection: false,
  entry_trigger: '',
  entry_price: '',
  sl_price: '',
  tp_price: '',
  lot_size: '',
  gross_eur: '',
  commission: '',
  swap: '',
  result_eur: '',
  result_status: 'OPEN',
  duration_days: '',
  notes: '',
  ctrader_screenshot: null,
  screenshot_1: null,
  screenshot_2: null,
  screenshot_3: null,
};

const PAIRS = ['EURGBP', 'GBPNZD', 'GBPAUD', 'EURCAD', 'EURJPY', 'GBPJPY', 'CADJPY', 'USDCAD', 'WTI', 'ANDERE'];

export default function TradeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    ...defaults,
    ...initial,
    trade_date: initial.trade_date ? initial.trade_date.slice(0, 10) : defaults.trade_date,
  } : defaults);

  const [ctraderFile, setCtraderFile] = useState(null);
  const [ctraderPreview, setCtraderPreview] = useState(initial?.ctrader_screenshot || null);
  const [chartFiles, setChartFiles] = useState([null, null, null]);
  const [chartPreviews, setChartPreviews] = useState([
    initial?.screenshot_1 || null,
    initial?.screenshot_2 || null,
    initial?.screenshot_3 || null,
  ]);

  const [analyzingCtrader, setAnalyzingCtrader] = useState(false);
  const [analyzingCharts, setAnalyzingCharts] = useState(false);
  const [chartsReasoning, setChartsReasoning] = useState(null);
  const [saving, setSaving] = useState(false);

  const ctraderRef = useRef();
  const chartRefs = [useRef(), useRef(), useRef()];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k) => setForm(f => ({ ...f, [k]: !f[k] }));

  // ── cTrader upload & analyze ─────────────────────────────────────────────
  const handleCtraderFile = (file) => {
    setCtraderFile(file);
    setCtraderPreview(URL.createObjectURL(file));
  };

  const analyzeCtrader = async () => {
    if (!ctraderFile) return;
    setAnalyzingCtrader(true);
    try {
      const fd = new FormData();
      fd.append('screenshot', ctraderFile);
      const res = await fetch(`${API}/analyze/ctrader`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const e = data.extracted;
      setForm(f => ({
        ...f,
        pair: e.pair || f.pair,
        direction: e.direction || f.direction,
        trade_date: e.trade_date || f.trade_date,
        entry_price: e.entry_price ?? f.entry_price,
        lot_size: e.lot_size ?? f.lot_size,
        gross_eur: e.gross_eur ?? f.gross_eur,
        commission: e.commission ?? f.commission,
        swap: e.swap ?? f.swap,
        result_eur: e.result_eur ?? f.result_eur,
        result_status: e.result_status || f.result_status,
        duration_days: e.duration_days ?? f.duration_days,
        ctrader_screenshot: data.filename,
      }));
    } catch (err) {
      alert('Analyse fehlgeschlagen: ' + err.message);
    }
    setAnalyzingCtrader(false);
  };

  // ── Chart upload & analyze ───────────────────────────────────────────────
  const handleChartFile = (file, idx) => {
    const newFiles = [...chartFiles];
    newFiles[idx] = file;
    setChartFiles(newFiles);
    const newPreviews = [...chartPreviews];
    newPreviews[idx] = URL.createObjectURL(file);
    setChartPreviews(newPreviews);
  };

  const removeChart = (idx) => {
    const newFiles = [...chartFiles];
    newFiles[idx] = null;
    setChartFiles(newFiles);
    const newPreviews = [...chartPreviews];
    newPreviews[idx] = null;
    setChartPreviews(newPreviews);
    const keys = ['screenshot_1', 'screenshot_2', 'screenshot_3'];
    set(keys[idx], null);
  };

  const analyzeCharts = async () => {
    const files = chartFiles.filter(Boolean);
    if (!files.length) return;
    setAnalyzingCharts(true);
    setChartsReasoning(null);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('screenshots', f));
      const res = await fetch(`${API}/analyze/charts`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const e = data.extracted;
      const keys = ['screenshot_1', 'screenshot_2', 'screenshot_3'];
      const newScreenshots = {};
      data.filenames.forEach((fn, i) => { newScreenshots[keys[i]] = fn; });
      setForm(f => ({
        ...f,
        daily_context: e.daily_context || f.daily_context,
        zone_tests: e.zone_tests ?? f.zone_tests,
        approach_character: e.approach_character || f.approach_character,
        h1_slowing: e.h1_slowing ?? f.h1_slowing,
        h1_wicks: e.h1_wicks ?? f.h1_wicks,
        h1_stabilization: e.h1_stabilization ?? f.h1_stabilization,
        h1_rejection: e.h1_rejection ?? f.h1_rejection,
        ...newScreenshots,
      }));
      setChartsReasoning({
        daily: e.daily_context_reasoning,
        approach: e.approach_reasoning,
      });
    } catch (err) {
      alert('Analyse fehlgeschlagen: ' + err.message);
    }
    setAnalyzingCharts(false);
  };

  const handleSubmit = async () => {
    if (!form.pair || !form.trade_date) return;
    setSaving(true);
    await onSave(form, initial?.id);
    setSaving(false);
  };

  return (
    <div className="trade-form">
      <div className="form-title">
        {initial ? 'Trade bearbeiten' : 'Neuer Trade'}
      </div>

      {/* ── cTrader Screenshot ────────────────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">cTrader Deal Screenshot</div>
        <div className="ctrader-area">
          {ctraderPreview ? (
            <div className="ctrader-preview">
              <img
                src={ctraderPreview.startsWith('blob:') ? ctraderPreview : `/uploads/${ctraderPreview}`}
                alt="cTrader"
                onClick={() => window.open(ctraderPreview.startsWith('blob:') ? ctraderPreview : `/uploads/${ctraderPreview}`)}
              />
              <div className="ctrader-actions">
                <button className="btn-primary" onClick={analyzeCtrader} disabled={analyzingCtrader || !ctraderFile}>
                  {analyzingCtrader ? '⏳ Analysiere…' : '🔍 Analysieren'}
                </button>
                <button className="btn-secondary" onClick={() => { setCtraderFile(null); setCtraderPreview(null); set('ctrader_screenshot', null); }}>
                  Entfernen
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-zone" onClick={() => ctraderRef.current.click()}>
              <span className="upload-icon">📊</span>
              <span>cTrader Deal Screenshot hochladen</span>
              <span className="upload-hint">PNG oder JPG · max. 15 MB</span>
            </div>
          )}
          <input ref={ctraderRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => e.target.files[0] && handleCtraderFile(e.target.files[0])} />
        </div>
      </section>

      {/* ── Basis ─────────────────────────────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">
          Basis
          {form.ctrader_screenshot && <span className="ai-filled">✓ KI vorausgefüllt</span>}
        </div>
        <div className="form-row-3">
          <div className="field">
            <label>Datum</label>
            <input type="date" value={form.trade_date} onChange={e => set('trade_date', e.target.value)} />
          </div>
          <div className="field">
            <label>Pair</label>
            <select value={form.pair} onChange={e => set('pair', e.target.value)}>
              {PAIRS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Richtung</label>
            <div className="seg-control">
              {['LONG', 'SHORT'].map(d => (
                <button key={d} className={form.direction === d ? 'active' : ''} onClick={() => set('direction', d)}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row-4" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>Entry-Kurs</label>
            <input type="number" step="0.00001" placeholder="1.35563" value={form.entry_price} onChange={e => set('entry_price', e.target.value)} />
          </div>
          <div className="field">
            <label>Stop Loss</label>
            <input type="number" step="0.00001" placeholder="1.35000" value={form.sl_price} onChange={e => set('sl_price', e.target.value)} />
          </div>
          <div className="field">
            <label>Take Profit</label>
            <input type="number" step="0.00001" placeholder="1.37000" value={form.tp_price} onChange={e => set('tp_price', e.target.value)} />
          </div>
          <div className="field">
            <label>Positionsgröße (Lots)</label>
            <input type="number" step="0.01" placeholder="0.20" value={form.lot_size} onChange={e => set('lot_size', e.target.value)} />
          </div>
        </div>

        <div className="cost-row" style={{ marginTop: '0.75rem' }}>
          <div className="field">
            <label>Brutto (EUR)</label>
            <input type="number" step="0.01" placeholder="173.30" value={form.gross_eur} onChange={e => set('gross_eur', e.target.value)} />
          </div>
          <div className="field">
            <label>Commission (EUR)</label>
            <input type="number" step="0.01" placeholder="-1.19" value={form.commission} onChange={e => set('commission', e.target.value)} />
          </div>
          <div className="field">
            <label>Swap (EUR)</label>
            <input type="number" step="0.01" placeholder="2.55" value={form.swap} onChange={e => set('swap', e.target.value)} />
          </div>
          <div className="field">
            <label>Netto P&L (EUR)</label>
            <input type="number" step="0.01" placeholder="174.66" value={form.result_eur} onChange={e => set('result_eur', e.target.value)} />
          </div>
          <div className="field">
            <label>Status</label>
            <div className="seg-control">
              {['OPEN', 'WIN', 'LOSS', 'BE'].map(s => (
                <button key={s} className={form.result_status === s ? 'active' : ''} onClick={() => set('result_status', s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Dauer (Tage)</label>
            <input type="number" min="0" placeholder="7" value={form.duration_days} onChange={e => set('duration_days', e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── Chart Screenshots ──────────────────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Chart Screenshots (H1, D1, optional W1/H4)</div>
        <div className="chart-uploads">
          {[0, 1, 2].map(idx => (
            <div key={idx} className="chart-slot">
              {chartPreviews[idx] ? (
                <div className="chart-preview">
                  <img
                    src={chartPreviews[idx].startsWith('blob:') ? chartPreviews[idx] : `/uploads/${chartPreviews[idx]}`}
                    alt={`Chart ${idx + 1}`}
                    onClick={() => window.open(chartPreviews[idx].startsWith('blob:') ? chartPreviews[idx] : `/uploads/${chartPreviews[idx]}`)}
                  />
                  <button className="chart-remove" onClick={() => removeChart(idx)}>✕</button>
                </div>
              ) : (
                <div className="upload-zone small" onClick={() => chartRefs[idx].current.click()}>
                  <span className="upload-icon">📈</span>
                  <span>Chart {idx + 1}</span>
                </div>
              )}
              <input ref={chartRefs[idx]} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && handleChartFile(e.target.files[0], idx)} />
            </div>
          ))}
        </div>
        {chartFiles.some(Boolean) && (
          <button className="btn-primary analyze-charts-btn" onClick={analyzeCharts} disabled={analyzingCharts}>
            {analyzingCharts ? '⏳ Analysiere Charts…' : '🔍 Charts analysieren'}
          </button>
        )}
        {chartsReasoning && (
          <div className="ai-reasoning">
            <div><span>Kontext:</span> {chartsReasoning.daily}</div>
            <div><span>Anlauf:</span> {chartsReasoning.approach}</div>
          </div>
        )}
      </section>

      {/* ── Kontext ───────────────────────────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">
          Daily-Kontext & Zone
          {chartsReasoning && <span className="ai-filled">✓ KI vorausgefüllt</span>}
        </div>
        <div className="form-row-3">
          <div className="field">
            <label>Marktstruktur</label>
            <div className="seg-control">
              {['RANGE', 'UPTREND', 'DOWNTREND'].map(c => (
                <button key={c} className={form.daily_context === c ? 'active' : ''} onClick={() => set('daily_context', c)}>
                  {c === 'RANGE' ? 'Range' : c === 'UPTREND' ? '↑ Up' : '↓ Down'}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Zone — Anzahl Tests</label>
            <input type="number" min="1" max="20" placeholder="z.B. 3" value={form.zone_tests} onChange={e => set('zone_tests', e.target.value)} />
          </div>
          <div className="field">
            <label>Letzter Test (vor X Tagen)</label>
            <input type="number" min="1" placeholder="z.B. 14" value={form.zone_last_test_days} onChange={e => set('zone_last_test_days', e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── Anlauf & H1 ───────────────────────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Anlauf-Charakter & H1-Verhalten</div>
        <div className="field" style={{ marginBottom: '0.75rem' }}>
          <label>Anlauf zur Zone</label>
          <div className="seg-control approach-seg">
            {[
              { v: 'IMPULSIV', label: '⚡ Impulsiv' },
              { v: 'MEANDERND', label: '〜 Meandernd' },
              { v: 'LANGSAM', label: '● Langsam' },
            ].map(({ v, label }) => (
              <button key={v} className={form.approach_character === v ? 'active' : ''} onClick={() => set('approach_character', v)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>H1-Verhalten an der Zone</label>
          <div className="checkbox-group">
            {[
              { key: 'h1_slowing', label: 'Abbremsen' },
              { key: 'h1_wicks', label: 'Wicks / Ablehnung' },
              { key: 'h1_stabilization', label: 'Stabilisierung' },
              { key: 'h1_rejection', label: 'Rejection Candle' },
            ].map(({ key, label }) => (
              <label key={key} className={`checkbox-item ${form[key] ? 'checked' : ''}`} onClick={() => toggle(key)}>
                <input type="checkbox" checked={form[key]} readOnly />
                {form[key] ? '✓ ' : ''}{label}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ── Entry-Trigger & Notizen ───────────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Entry-Trigger & Notizen</div>
        <div className="field" style={{ marginBottom: '0.75rem' }}>
          <label>Entry-Trigger (was hat dich einsteigen lassen?)</label>
          <textarea placeholder="z.B. Erste grüne H1-Kerze nach Abbremsen an der Zonenkante…" value={form.entry_trigger} onChange={e => set('entry_trigger', e.target.value)} />
        </div>
        <div className="field">
          <label>Notizen</label>
          <textarea placeholder="Weitere Beobachtungen, Lernpunkte, Marktkontext…" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ minHeight: '80px' }} />
        </div>
      </section>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>Abbrechen</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Speichert…' : initial ? 'Aktualisieren' : 'Trade speichern'}
        </button>
      </div>
    </div>
  );
}
