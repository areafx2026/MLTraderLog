require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool, initDb, mapTrade } = require('./db');

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
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Helpers ─────────────────────────────────────────────────────────────────

function calcPips(pair, direction, entryPrice, exitPrice) {
  const entry = parseFloat(entryPrice);
  const exit = parseFloat(exitPrice);
  if (!entry || !exit) return 0;
  const isJpy = (pair || '').toUpperCase().includes('JPY');
  const factor = isJpy ? 100 : 10000;
  const diff = direction === 'LONG' ? (exit - entry) : (entry - exit);
  return Math.round(diff * factor * 10) / 10;
}

function calcRR(pips, entryPrice, slPrice, pair) {
  const entry = parseFloat(entryPrice);
  const sl = parseFloat(slPrice);
  if (!entry || !sl || !pips) return 0;
  const isJpy = (pair || '').toUpperCase().includes('JPY');
  const factor = isJpy ? 100 : 10000;
  const riskPips = Math.abs(entry - sl) * factor;
  return riskPips > 0 ? Math.round((pips / riskPips) * 10) / 10 : 0;
}

function calcStatus(resultEur, exitPrice, pips) {
  const hasExit = exitPrice && parseFloat(exitPrice) > 0;
  if (!hasExit && (resultEur === null || resultEur === undefined || resultEur === '')) return 'OPEN';
  const pl = resultEur !== null && resultEur !== undefined && resultEur !== ''
    ? parseFloat(resultEur)
    : pips;
  if (pl > 0) return 'WIN';
  if (pl < 0) return 'LOSS';
  return 'BE';
}

// ── Upload ───────────────────────────────────────────────────────────────────

app.post('/api/upload', upload.array('screenshots', 2), (req, res) => {
  const files = req.files.map(f => f.filename);
  res.json({ files });
});

// ── GET all trades ───────────────────────────────────────────────────────────

app.get('/api/trades', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades ORDER BY trade_date DESC, created_at DESC'
    );
    res.json(result.rows.map(mapTrade));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET single trade ─────────────────────────────────────────────────────────

app.get('/api/trades/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trades WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(mapTrade(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── POST create trade ─────────────────────────────────────────────────────────

app.post('/api/trades', async (req, res) => {
  const {
    pair, direction, trade_date, trade_time,
    entry_price, exit_price, sl_price, lot_size,
    tag, mood, notes, result_eur,
  } = req.body;

  const dir = (direction || 'LONG').toUpperCase();
  const pips = calcPips(pair, dir, entry_price, exit_price);
  const rr = calcRR(pips, entry_price, sl_price, pair);
  const status = calcStatus(result_eur, exit_price, pips);

  try {
    const result = await pool.query(`
      INSERT INTO trades (
        pair, trade_date, trade_time, direction,
        entry_price, exit_price, sl_price, lot_size,
        pips, rr_multiple, tag, mood, notes,
        result_eur, result_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
    `, [
      pair, trade_date, trade_time || null, dir,
      entry_price || null, exit_price || null, sl_price || null,
      lot_size || null,
      pips || null, rr || null,
      tag || null, mood || null, notes || null,
      result_eur !== '' ? result_eur || null : null,
      status,
    ]);
    res.status(201).json(mapTrade(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error', detail: err.message });
  }
});

// ── PUT update trade ──────────────────────────────────────────────────────────

app.put('/api/trades/:id', async (req, res) => {
  const {
    pair, direction, trade_date, trade_time,
    entry_price, exit_price, sl_price, lot_size,
    tag, mood, notes, result_eur,
  } = req.body;

  const dir = (direction || 'LONG').toUpperCase();
  const pips = calcPips(pair, dir, entry_price, exit_price);
  const rr = calcRR(pips, entry_price, sl_price, pair);
  const status = calcStatus(result_eur, exit_price, pips);

  try {
    const result = await pool.query(`
      UPDATE trades SET
        pair=$1, trade_date=$2, trade_time=$3, direction=$4,
        entry_price=$5, exit_price=$6, sl_price=$7, lot_size=$8,
        pips=$9, rr_multiple=$10, tag=$11, mood=$12, notes=$13,
        result_eur=$14, result_status=$15
      WHERE id=$16 RETURNING *
    `, [
      pair, trade_date, trade_time || null, dir,
      entry_price || null, exit_price || null, sl_price || null,
      lot_size || null,
      pips || null, rr || null,
      tag || null, mood || null, notes || null,
      result_eur !== '' ? result_eur || null : null,
      status,
      req.params.id,
    ]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(mapTrade(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ── DELETE trade ──────────────────────────────────────────────────────────────

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

// ── GET stats ─────────────────────────────────────────────────────────────────

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
        COALESCE(AVG(rr_multiple) FILTER (WHERE result_status = 'WIN'), 0) AS avg_rr,
        COALESCE(SUM(result_eur) FILTER (
          WHERE result_status != 'OPEN'
          AND trade_date >= DATE_TRUNC('month', CURRENT_DATE)
        ), 0) AS month_pnl,
        COUNT(*) FILTER (
          WHERE result_status != 'OPEN'
          AND trade_date >= DATE_TRUNC('month', CURRENT_DATE)
        ) AS month_trades
      FROM trades
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET equity curve ──────────────────────────────────────────────────────────

app.get('/api/equity', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT trade_date, SUM(result_eur) AS daily_pl
      FROM trades
      WHERE result_status != 'OPEN' AND result_eur IS NOT NULL
      GROUP BY trade_date
      ORDER BY trade_date
    `);
    let cumulative = 0;
    const points = result.rows.map((row, i) => {
      cumulative += parseFloat(row.daily_pl) || 0;
      return {
        d: i,
        v: cumulative,
        date: String(row.trade_date).slice(0, 10),
      };
    });
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── Export CSV ────────────────────────────────────────────────────────────────

app.get('/api/export', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades ORDER BY trade_date DESC, created_at DESC'
    );
    const cols = ['id', 'trade_date', 'trade_time', 'pair', 'direction', 'entry_price',
      'exit_price', 'sl_price', 'lot_size', 'pips', 'rr_multiple', 'tag', 'mood',
      'result_eur', 'result_status', 'notes'];
    const header = cols.join(',');
    const rows = result.rows.map(r =>
      cols.map(c => {
        const v = r[c] ?? '';
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
      }).join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="forexlog-trades.csv"');
    res.send([header, ...rows].join('\n'));
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

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
  app.listen(PORT, () => console.log(`ForexLog backend running on port ${PORT}`));
};

start();
