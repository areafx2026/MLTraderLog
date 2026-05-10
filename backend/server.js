require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('/app/uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/app/uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

const toBase64 = (filepath, originalname) => {
  const imgData = fs.readFileSync(filepath);
  const base64 = imgData.toString('base64');
  const ext = path.extname(originalname).toLowerCase();
  const mediaType = ext === '.png' ? 'image/png' : 'image/jpeg';
  return { base64, mediaType };
};

// ── Upload ──────────────────────────────────────────────────────────────────
app.post('/api/upload', upload.array('screenshots', 4), (req, res) => {
  const files = req.files.map(f => f.filename);
  res.json({ files });
});

// ── Analyze cTrader screenshot ──────────────────────────────────────────────
app.post('/api/analyze/ctrader', upload.single('screenshot'), async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }
  try {
    const { base64, mediaType } = toBase64(req.file.path, req.file.originalname);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            {
              type: 'text',
              text: `Dies ist ein cTrader Deal-Details Screenshot. Extrahiere die folgenden Daten und gib NUR valides JSON zurück, kein Markdown, keine Erklärung:
{
  "pair": "Währungspaar z.B. USDCAD",
  "direction": "LONG oder SHORT — Opening direction: Buy=LONG, Sell=SHORT",
  "entry_price": Zahl,
  "close_price": Zahl,
  "trade_date": "YYYY-MM-DD (Opening time Datum)",
  "duration_days": Zahl (Kalendertage zwischen Opening time und Closing time, also alle Tage inklusive Wochenenden),
  "lot_size": Zahl (Closing Quantity in Lots),
  "gross_eur": Zahl (Gross realised Wert, negativ wenn Verlust),
  "commission": Zahl (Realised broker commission, negativ wenn Kosten),
  "swap": Zahl (Realised swaps, kann positiv oder negativ sein),
  "result_eur": Zahl (Net realised Wert, negativ wenn Verlust),
  "result_status": "WIN wenn positiv, LOSS wenn negativ, BE wenn null"
}
Nur das JSON-Objekt zurückgeben, nichts sonst.`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(clean);
    res.json({ filename: req.file.filename, extracted });
  } catch (err) {
    console.error('cTrader analyze error:', err);
    res.status(500).json({ error: 'Analyse fehlgeschlagen', detail: err.message });
  }
});

// ── Analyze chart screenshots ───────────────────────────────────────────────
app.post('/api/analyze/charts', upload.array('screenshots', 3), async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }
  try {
    const imageBlocks = req.files.map(f => {
      const { base64, mediaType } = toBase64(f.path, f.originalname);
      return { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } };
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            ...imageBlocks,
            {
              type: 'text',
              text: `Dies sind TradingView Chart-Screenshots (H1, D1, ggf. W1/H4) eines Forex-Trades.

WICHTIGE ZONEN-ERKENNUNG:
- Lila/violette Rechtecke MIT einer gestrichelten horizontalen Mittellinie = Support/Resistance Zonen (diese analysieren)
- Türkis/grüne oder rosa/rote Flächen = TradingView Positionsanzeige (KOMPLETT IGNORIEREN)
- Horizontale gestrichelte Linien = wichtige Preislevel

Analysiere und gib NUR valides JSON zurück, kein Markdown, keine Erklärung:
{
  "daily_context": "RANGE, UPTREND oder DOWNTREND (aus dem D1 Chart)",
  "daily_context_reasoning": "Ein Satz Begründung auf Deutsch",
  "zone_tests": Zahl (wie oft wurde die lila S/R Zone getestet, 0 wenn unklar),
  "approach_character": "IMPULSIV (schnelle gerichtete Bewegung), MEANDERND (seitliche Drift) oder LANGSAM (langsam graduell)",
  "approach_reasoning": "Ein Satz Begründung auf Deutsch",
  "h1_slowing": true oder false (Momentum verlangsamte sich sichtbar beim Annähern an die Zone im H1),
  "h1_wicks": true oder false (Ablehnungs-Wicks an der Zone im H1 sichtbar),
  "h1_stabilization": true oder false (Kurs konsolidierte an der Zone vor Weiterbewegung),
  "h1_rejection": true oder false (klare Rejection-Kerze an der Zone im H1)
}
Nur das JSON-Objekt zurückgeben, nichts sonst.`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(clean);
    const filenames = req.files.map(f => f.filename);
    res.json({ filenames, extracted });
  } catch (err) {
    console.error('Chart analyze error:', err);
    res.status(500).json({ error: 'Analyse fehlgeschlagen', detail: err.message });
  }
});

// ── GET all trades ──────────────────────────────────────────────────────────
app.get('/api/trades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trades ORDER BY trade_date DESC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET single trade ────────────────────────────────────────────────────────
app.get('/api/trades/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trades WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── POST create trade ───────────────────────────────────────────────────────
app.post('/api/trades', async (req, res) => {
  const {
    pair, trade_date, direction,
    daily_context, zone_tests, zone_last_test_days,
    approach_character,
    h1_slowing, h1_wicks, h1_stabilization, h1_rejection,
    entry_trigger, entry_price, sl_price, tp_price,
    lot_size, gross_eur, commission, swap,
    result_eur, result_status, duration_days,
    ctrader_screenshot, screenshot_1, screenshot_2, screenshot_3,
    notes,
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO trades (
        pair, trade_date, direction,
        daily_context, zone_tests, zone_last_test_days,
        approach_character,
        h1_slowing, h1_wicks, h1_stabilization, h1_rejection,
        entry_trigger, entry_price, sl_price, tp_price,
        lot_size, gross_eur, commission, swap,
        result_eur, result_status, duration_days,
        ctrader_screenshot, screenshot_1, screenshot_2, screenshot_3, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
      RETURNING *
    `, [
      pair, trade_date, direction,
      daily_context, zone_tests || null, zone_last_test_days || null,
      approach_character,
      h1_slowing || false, h1_wicks || false, h1_stabilization || false, h1_rejection || false,
      entry_trigger || null, entry_price || null, sl_price || null, tp_price || null,
      lot_size || null, gross_eur || null, commission || null, swap || null,
      result_eur || null, result_status || 'OPEN', duration_days || null,
      ctrader_screenshot || null, screenshot_1 || null, screenshot_2 || null, screenshot_3 || null,
      notes || null,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error', detail: err.message });
  }
});

// ── PUT update trade ────────────────────────────────────────────────────────
app.put('/api/trades/:id', async (req, res) => {
  const {
    pair, trade_date, direction,
    daily_context, zone_tests, zone_last_test_days,
    approach_character,
    h1_slowing, h1_wicks, h1_stabilization, h1_rejection,
    entry_trigger, entry_price, sl_price, tp_price,
    lot_size, gross_eur, commission, swap,
    result_eur, result_status, duration_days,
    ctrader_screenshot, screenshot_1, screenshot_2, screenshot_3,
    notes,
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE trades SET
        pair=$1, trade_date=$2, direction=$3,
        daily_context=$4, zone_tests=$5, zone_last_test_days=$6,
        approach_character=$7,
        h1_slowing=$8, h1_wicks=$9, h1_stabilization=$10, h1_rejection=$11,
        entry_trigger=$12, entry_price=$13, sl_price=$14, tp_price=$15,
        lot_size=$16, gross_eur=$17, commission=$18, swap=$19,
        result_eur=$20, result_status=$21, duration_days=$22,
        ctrader_screenshot=$23, screenshot_1=$24, screenshot_2=$25, screenshot_3=$26, notes=$27
      WHERE id=$28 RETURNING *
    `, [
      pair, trade_date, direction,
      daily_context, zone_tests || null, zone_last_test_days || null,
      approach_character,
      h1_slowing || false, h1_wicks || false, h1_stabilization || false, h1_rejection || false,
      entry_trigger || null, entry_price || null, sl_price || null, tp_price || null,
      lot_size || null, gross_eur || null, commission || null, swap || null,
      result_eur || null, result_status || 'OPEN', duration_days || null,
      ctrader_screenshot || null, screenshot_1 || null, screenshot_2 || null, screenshot_3 || null,
      notes || null,
      req.params.id,
    ]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ── DELETE trade ────────────────────────────────────────────────────────────
app.delete('/api/trades/:id', async (req, res) => {
  try {
    const trade = await pool.query(
      'SELECT ctrader_screenshot, screenshot_1, screenshot_2, screenshot_3 FROM trades WHERE id=$1',
      [req.params.id]
    );
    if (trade.rows.length) {
      const { ctrader_screenshot, screenshot_1, screenshot_2, screenshot_3 } = trade.rows[0];
      [ctrader_screenshot, screenshot_1, screenshot_2, screenshot_3].forEach(f => {
        if (f) { try { fs.unlinkSync(path.join('/app/uploads', f)); } catch {} }
      });
    }
    await pool.query('DELETE FROM trades WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET stats ───────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE result_status != 'OPEN') AS total_closed,
        COUNT(*) FILTER (WHERE result_status = 'WIN') AS wins,
        COUNT(*) FILTER (WHERE result_status = 'LOSS') AS losses,
        COUNT(*) FILTER (WHERE result_status = 'BE') AS breakevens,
        COUNT(*) FILTER (WHERE result_status = 'OPEN') AS open_trades,
        COALESCE(SUM(result_eur) FILTER (WHERE result_status != 'OPEN'), 0) AS total_pnl,
        COALESCE(SUM(gross_eur) FILTER (WHERE result_status != 'OPEN'), 0) AS total_gross,
        COALESCE(SUM(commission) FILTER (WHERE result_status != 'OPEN'), 0) AS total_commission,
        COALESCE(SUM(swap) FILTER (WHERE result_status != 'OPEN'), 0) AS total_swap,
        COALESCE(AVG(result_eur) FILTER (WHERE result_status = 'WIN'), 0) AS avg_win,
        COALESCE(AVG(ABS(result_eur)) FILTER (WHERE result_status = 'LOSS'), 0) AS avg_loss,
        COALESCE(AVG(duration_days) FILTER (WHERE result_status != 'OPEN'), 0) AS avg_duration
      FROM trades
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── Start ───────────────────────────────────────────────────────────────────
const start = async () => {
  let retries = 10;
  while (retries > 0) {
    try {
      await initDb();
      break;
    } catch (err) {
      console.log(`DB not ready, retrying... (${retries})`);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`MLTraderLog backend running on port ${PORT}`));
};

start();
