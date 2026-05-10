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
  result_eur: '',
  result_status: 'OPEN',
  duration_days: '',
  notes: '',
  screenshot_1: null,
  screenshot_2: null,
};

const PAIRS = ['EURGBP', 'GBPNZD', 'GBPAUD', 'EURCAD', 'EURJPY', 'GBPJPY', 'CADJPY', 'USDCAD', 'WTI', 'ANDERE'];

export default function TradeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    ...defaults,
    ...initial,
    trade_date: initial.trade_date ? initial.trade_date.slice(0, 10) : defaults.trade_date,
  } : defaults);

  const [screenshots, setScreenshots] = useState({
    s1: initial?.screenshot_1 || null,
    s2: initial?.screenshot_2 || null,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef1 = useRef();
  const fileRef2 = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k) => setForm(f => ({ ...f, [k]: !f[k] }));

  // Computed R:R
  const rr = (() => {
    const e = parseFloat(form.entry_price);
    const sl = parseFloat(form.sl_price);
    const tp = parseFloat(form.tp_price);
    if (!e || !sl || !tp) return null;
    const risk = Math.abs(e - sl);
    const reward = Math.abs(tp - e);
    if (!risk) return null;
    return (reward / risk).toFixed(2);
  })();

  const uploadFile = async (file, slot) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('screenshots', file);
    const res = await fetch(`${API}/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    const filename = data.files[0];
    setScreenshots(s => ({ ...s, [slot]: filename }));
    set(slot === 's1' ? 'screenshot_1' : 'screenshot_2', filename);
    setUploading(false);
  };

  const removeScreenshot = (slot) => {
    setScreenshots(s => ({ ...s, [slot]: null }));
    set(slot === 's1' ? 'screenshot_1' : 'screenshot_2', null);
  };

  const handleSubmit = async () => {
    if (!form.pair || !form.trade_date || !form.direction) return;
    setSaving(true);
    await onSave(form, initial?.id);
    setSaving(false);
  };

  return (
    <div className="trade-form">
      <div className="form-title">
        {initial ? 'Trade bearbeiten' : 'Neuer Trade'}
      </div>

      {/* ── Basis ─────────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Basis</div>
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
      </section>

      {/* ── Kontext ───────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Daily-Kontext</div>
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

      {/* ── Anlauf ────────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Anlauf-Charakter zur Zone</div>
        <div className="field">
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
      </section>

      {/* ── H1-Verhalten ──────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">H1-Verhalten an der Zone</div>
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
      </section>

      {/* ── Entry-Trigger ─────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Entry</div>
        <div className="field" style={{ marginBottom: '0.75rem' }}>
          <label>Entry-Trigger (was hat dich einsteigen lassen?)</label>
          <textarea placeholder="z.B. Erste grüne H1-Kerze nach Abbremsen an der Zonenkante, Wick über 0.8615…" value={form.entry_trigger} onChange={e => set('entry_trigger', e.target.value)} />
        </div>
        <div className="form-row-4">
          <div className="field">
            <label>Entry-Kurs</label>
            <input type="number" step="0.00001" placeholder="0.86200" value={form.entry_price} onChange={e => set('entry_price', e.target.value)} />
          </div>
          <div className="field">
            <label>Stop Loss</label>
            <input type="number" step="0.00001" placeholder="0.86100" value={form.sl_price} onChange={e => set('sl_price', e.target.value)} />
          </div>
          <div className="field">
            <label>Take Profit</label>
            <input type="number" step="0.00001" placeholder="0.87200" value={form.tp_price} onChange={e => set('tp_price', e.target.value)} />
          </div>
          <div className="field">
            <label>R:R (errechnet)</label>
            <div className="computed-field">{rr ? `1 : ${rr}` : '—'}</div>
          </div>
        </div>
      </section>

      {/* ── Ergebnis ──────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Ergebnis</div>
        <div className="form-row-3">
          <div className="field">
            <label>Status</label>
            <div className="seg-control">
              {['OPEN', 'WIN', 'LOSS', 'BE'].map(s => (
                <button key={s} className={form.result_status === s ? 'active' : ''} onClick={() => set('result_status', s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>P&L (EUR)</label>
            <input type="number" step="0.01" placeholder="+180.00" value={form.result_eur} onChange={e => set('result_eur', e.target.value)} />
          </div>
          <div className="field">
            <label>Dauer (Tage)</label>
            <input type="number" min="0" placeholder="7" value={form.duration_days} onChange={e => set('duration_days', e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── Screenshots ───────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Screenshots (max. 2)</div>
        <div className="screenshot-row">
          {['s1', 's2'].map((slot, i) => (
            <div key={slot} className="screenshot-slot">
              {screenshots[slot] ? (
                <div className="screenshot-preview">
                  <img src={`/uploads/${screenshots[slot]}`} alt={`Screenshot ${i + 1}`} />
                  <button className="screenshot-remove" onClick={() => removeScreenshot(slot)}>✕</button>
                </div>
              ) : (
                <div className="screenshot-upload" onClick={() => (slot === 's1' ? fileRef1 : fileRef2).current.click()}>
                  <span>+</span>
                  <span className="upload-label">Screenshot {i + 1}</span>
                  {uploading && <span className="upload-hint">Lädt…</span>}
                </div>
              )}
              <input
                ref={slot === 's1' ? fileRef1 : fileRef2}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => e.target.files[0] && uploadFile(e.target.files[0], slot)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Notizen ───────────────────────────────────── */}
      <section className="form-section">
        <div className="section-label">Notizen</div>
        <textarea placeholder="Weitere Beobachtungen, Lernpunkte, Marktkontext…" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ minHeight: '100px' }} />
      </section>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>Abbrechen</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving || uploading}>
          {saving ? 'Speichert…' : initial ? 'Aktualisieren' : 'Trade speichern'}
        </button>
      </div>
    </div>
  );
}
