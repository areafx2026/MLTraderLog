import { useState, useEffect, useCallback } from 'react';
import { FONTS } from '../theme.js';

const MOODS = ['calm', 'focused', 'patient', 'rushed', 'distracted'];

function today() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export default function TradeForm({ t, trade, onSave, onCancel }) {
  const isEdit = !!trade;

  const [form, setForm] = useState({
    pair: '',
    side: 'Long',
    date: today(),
    time: nowTime(),
    entry: '',
    exit: '',
    stop: '',
    size: '',
    tag: '',
    mood: 'calm',
    note: '',
    result_eur: '',
  });

  useEffect(() => {
    if (trade) {
      setForm({
        pair: trade.pair || '',
        side: trade.side ? trade.side.charAt(0).toUpperCase() + trade.side.slice(1) : 'Long',
        date: trade.date || today(),
        time: trade.time || nowTime(),
        entry: trade.entry ? String(trade.entry) : '',
        exit: trade.exit ? String(trade.exit) : '',
        stop: trade.sl ? String(trade.sl) : '',
        size: trade.size ? String(trade.size) : '',
        tag: trade.tag || '',
        mood: trade.mood || 'calm',
        note: trade.note || '',
        result_eur: trade.pl !== undefined ? String(trade.pl) : '',
      });
    }
  }, [trade]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = useCallback(() => {
    if (!form.pair.trim() || !form.date || !form.side) return;
    onSave({
      id: trade?.id,
      pair: form.pair.trim().replace(/\s/g, '').toUpperCase().replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2'),
      direction: form.side.toUpperCase(),
      trade_date: form.date,
      trade_time: form.time || null,
      entry_price: form.entry || null,
      exit_price: form.exit || null,
      sl_price: form.stop || null,
      lot_size: form.size || null,
      tag: form.tag || null,
      mood: form.mood || null,
      notes: form.note || null,
      result_eur: form.result_eur !== '' ? form.result_eur : null,
    });
  }, [form, trade, onSave]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const Field = ({ k, label, sub, placeholder = '' }) => (
    <div style={{ borderBottom: `1px solid ${t.rule2}`, paddingBottom: 14 }}>
      <div style={{
        fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12,
        color: t.ink2, marginBottom: 8, letterSpacing: 0.2,
      }}>{label}</div>
      <input
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder || 'add'}
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          fontFamily: FONTS.serif, fontSize: 26, letterSpacing: -0.3, width: '100%', padding: 0,
          color: form[k] ? t.ink : t.ink3,
          fontStyle: form[k] ? 'normal' : 'italic',
        }}
      />
      {sub && <div style={{ fontSize: 11, color: t.ink3, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const SelectField = ({ k, label, options }) => (
    <div style={{ borderBottom: `1px solid ${t.rule2}`, paddingBottom: 14 }}>
      <div style={{
        fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12,
        color: t.ink2, marginBottom: 8, letterSpacing: 0.2,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((o) => {
          const on = form[k].toLowerCase() === o.toLowerCase();
          return (
            <button key={o} onClick={() => set(k, o)}
              style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 13,
                fontFamily: FONTS.sans, cursor: 'pointer', border: `1px solid ${on ? t.ink : t.rule2}`,
                background: on ? t.ink : 'transparent',
                color: on ? t.inkInk : t.ink2,
                textTransform: 'capitalize',
              }}>{o}</button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{
      flex: 1, padding: '40px 72px', overflow: 'auto', minWidth: 0,
      display: 'flex', flexDirection: 'column',
    }}>
      <button onClick={onCancel}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, color: t.ink3, padding: 0, marginBottom: 18,
          fontFamily: FONTS.sans, alignSelf: 'flex-start',
        }}>
        ← Trades
      </button>

      <h1 style={{
        fontFamily: FONTS.serif, fontWeight: 400, fontSize: 44,
        margin: '0 0 6px', letterSpacing: -0.8, color: t.ink,
      }}>
        {isEdit ? 'Edit trade.' : 'A new trade.'}
      </h1>
      <p style={{
        fontFamily: FONTS.serif, fontStyle: 'italic', color: t.ink2,
        fontSize: 16, margin: '0 0 36px',
      }}>
        {isEdit ? 'Update the details below.' : 'Tell me about it.'}
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 64px', maxWidth: 820,
      }}>
        <Field k="pair"  label="Pair" placeholder="EUR/USD" />
        <SelectField k="side" label="Direction" options={['Long', 'Short']} />
        <Field k="date"  label="Date" />
        <Field k="time"  label="Time" placeholder="09:42" />
        <Field k="entry" label="Entry" placeholder="1.0842" />
        <Field k="exit"  label="Exit"  placeholder="1.0901" sub="leave blank if still open" />
        <Field k="stop"  label="Stop"  placeholder="1.0820" />
        <Field k="size"  label="Size"  placeholder="1.50" sub="in lots" />
        <Field k="tag"   label="Setup" placeholder="London breakout" />
        <SelectField k="mood" label="Mood" options={MOODS} />
        <Field k="result_eur" label="Result ($)" placeholder="optional — computed from entry/exit if blank" />
      </div>

      <div style={{
        marginTop: 28, paddingTop: 24, borderTop: `1px solid ${t.rule2}`, maxWidth: 820,
      }}>
        <div style={{
          fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12,
          color: t.ink2, marginBottom: 12, letterSpacing: 0.2,
        }}>A few notes</div>
        <textarea
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
          placeholder="What were you watching? How did it feel?…"
          rows={4}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: FONTS.serif, fontSize: 19, lineHeight: 1.6, width: '100%',
            resize: 'none', padding: 0,
            color: form.note ? t.ink : t.ink3,
            fontStyle: form.note ? 'normal' : 'italic',
          }}
        />
      </div>

      <div style={{
        marginTop: 'auto', display: 'flex', gap: 12, paddingTop: 28, alignItems: 'center',
      }}>
        <button onClick={handleSave}
          style={{
            background: t.ink, color: t.inkInk, border: 'none',
            padding: '12px 22px', borderRadius: 999, fontFamily: FONTS.sans,
            fontWeight: 500, fontSize: 14, cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
          {isEdit ? 'Update trade' : 'Save trade'}
        </button>
        <button onClick={onCancel}
          style={{
            background: 'transparent', color: t.ink2, border: 'none',
            padding: '12px 16px', fontFamily: FONTS.sans, fontSize: 14, cursor: 'pointer',
          }}>
          Cancel
        </button>
        <span style={{
          marginLeft: 'auto', fontSize: 11, color: t.ink3,
          fontFamily: FONTS.serif, fontStyle: 'italic',
        }}>⌘↵ to save</span>
      </div>
    </div>
  );
}
