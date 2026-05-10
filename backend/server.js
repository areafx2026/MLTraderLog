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
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Upload screenshots ──────────────────────────────────────────────────────
app.post('/api/upload', upload.array('screenshots', 2), (req, res) => {
  const files = req.files.map(f => f.filename);
  res.json({ files });
});

// ── GET all trades ──────────────────────────────────────────────────────────
app.get('/api/trades', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades ORDER BY trade_date DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
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
    screenshot_1, screenshot_2,
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
        screenshot_1, screenshot_2, notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      ) RETURNING *
    `, [
      pair, trade_date, direction,
      daily_context, zone_tests || null, zone_last_test_days || null,
      approach_character,
      h1_slowing || false, h1_wicks || false, h1_stabilization || false, h1_rejection || false,
      entry_trigger || null, entry_price || null, sl_price || null, tp_price || null,
      result_eur || null, result_status || 'OPEN', duration_days || null,
      screenshot_1 || null, screenshot_2 || null,
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
    screenshot_1, screenshot_2,
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
        screenshot_1=$19, screenshot_2=$20, notes=$21
      WHERE id=$22 RETURNING *
    `, [
      pair, trade_date, direction,
      daily_context, zone_tests || null, zone_last_test_days || null,
      approach_character,
      h1_slowing || false, h1_wicks || false, h1_stabilization || false, h1_rejection || false,
      entry_trigger || null, entry_price || null, sl_price || null, tp_price || null,
      result_eur || null, result_status || 'OPEN', duration_days || null,
      screenshot_1 || null, screenshot_2 || null,
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
    const trade = await pool.query('SELECT screenshot_1, screenshot_2 FROM trades WHERE id=$1', [req.params.id]);
    if (trade.rows.length) {
      const { screenshot_1, screenshot_2 } = trade.rows[0];
      [screenshot_1, screenshot_2].forEach(f => {
        if (f) {
          const fp = path.join('/app/uploads', f);
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
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
