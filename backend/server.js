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

// Multer storage
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

// ── Upload screenshots ──────────────────────────────────────────────────────
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
              text: `This is a cTrader deal details screenshot. Extract the following data and return ONLY valid JSON, no markdown, no explanation:
{
  "pair": "currency pair symbol e.g. USDCAD",
  "direction": "LONG or SHORT — use Opening direction field: Buy=LONG, Sell=SHORT",
  "entry_price": number,
  "close_price": number,
  "trade_date": "YYYY-MM-DD (use Opening time date)",
  "duration_days": number (difference between opening and closing date in calendar days),
  "result_eur": number (use Net realised value, negative if loss),
  "result_status": "WIN if positive, LOSS if negative, BE if zero",
  "lot_size": number
}
Return only the JSON object, nothing else.`,
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
    res.status(500).json({ error: 'Analysis failed', detail: err.message });
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
              text: `These are TradingView chart screenshots (H1, D1, possibly W1/H4) for a forex trade.

CRITICAL ZONE IDENTIFICATION:
- Purple/violet shaded rectangles WITH a dashed horizontal center line = Support/Resistance zones (analyze these)
- Teal/green or pink/red shaded areas = TradingView position visualization (IGNORE completely)
- Plain horizontal dashed lines = key price levels

Analyze and return ONLY valid JSON, no markdown, no explanation:
{
  "daily_context": "RANGE, UPTREND, or DOWNTREND (from D1 chart)",
  "daily_context_reasoning": "one sentence explanation",
  "zone_tests": number (how many times the purple S/R zone was tested, 0 if unclear),
  "zone_last_test_days": number (approximate days since last test before this trade, 0 if unclear),
  "approach_character": "IMPULSIV (fast directional move), MEANDERND (sideways drift), or LANGSAM (slow gradual)",
  "approach_reasoning": "one sentence explanation",
  "h1_slowing": true or false (momentum visibly slowed approaching zone on H1),
  "h1_wicks": true or false (rejection wicks visible at zone on H1),
  "h1_stabilization": true or false (price consolidated at zone before moving),
  "h1_rejection": true or false (clear rejection candle at zone on H1)
}
Return only the JSON object, nothing else.`,
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
    res.status(500).json({ error: 'Analysis failed', detail: err.message });
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
        result_eur, result_status, duration_days,
        ctrader_screenshot, screenshot_1, screenshot_2, screenshot_3, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING *
    `, [
      pair, trade_date, direction,
      daily_context, zone_tests || null, zone_last_test_days || null,
      approach_character,
      h1_slowing || false, h1_wicks || false, h1_stabilization || false, h1_rejection || false,
      entry_trigger || null, entry_price || null, sl_price || null, tp_price || null,
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
        result_eur=$16, result_status=$17, duration_days=$18,
        ctrader_screenshot=$19, screenshot_1=$20, screenshot_2=$21, screenshot_3=$22, notes=$23
      WHERE id=$24 RETURNING *
    `, [
      pair, trade_date, direction,
      daily_context, zone_tests || null, zone_last_test_days || null,
      approach_character,
      h1_slowing || false, h1_wicks || false, h1_stabilization || false, h1_rejection || false,
      entry_trigger || null, entry_price || null, sl_price || null, tp_price || null,
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
