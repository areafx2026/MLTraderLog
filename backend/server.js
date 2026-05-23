require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, initDb, mapTrade } = require('./db');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'forexlog-dev-secret-change-in-prod';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('/app/uploads'));

// ── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Upload ───────────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = req.user ? path.join('/app/uploads', req.user.userId) : '/app/uploads';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/upload', requireAuth, upload.array('screenshots', 2), (req, res) => {
  const files = req.files.map(f => path.join(req.user.userId, f.filename));
  res.json({ files });
});

// ── Auth routes ──────────────────────────────────────────────────────────────

// Normalize username: NFC, trim, collapse inner whitespace
function normalizeUsername(raw) {
  return raw.normalize('NFC').trim().replace(/\s+/g, ' ');
}

function validateUsername(raw) {
  if (!raw || raw.trim().length < 2) return 'At least 2 characters required';
  if (raw.trim().length > 20) return 'Maximum 20 characters';
  // Reject control characters and null bytes
  if (/[\x00-\x1F\x7F]/.test(raw)) return 'Invalid characters';
  return null;
}

app.post('/api/auth/check-username', async (req, res) => {
  const { username } = req.body;
  const err = validateUsername(username);
  if (err) return res.status(400).json({ available: false, error: err });
  const normalized = normalizeUsername(username);
  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE lower(username) = lower($1)',
      [normalized]
    );
    res.json({ available: result.rows.length === 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ available: false, error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and password (min 8 chars) required' });
  }
  const usernameErr = validateUsername(username);
  if (usernameErr) return res.status(400).json({ error: usernameErr });
  const normalizedUsername = normalizeUsername(username);
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, theme',
      [email.toLowerCase().trim(), hash, normalizedUsername]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET, { expiresIn: '30d' }
    );
    res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username, theme: user.theme || 'dark' } });
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint?.includes('username')) return res.status(409).json({ error: 'Username already taken' });
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await pool.query(
      'SELECT id, email, username, password_hash, theme FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET, { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, theme: user.theme || 'dark' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, theme FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    res.json({ id: u.id, email: u.email, username: u.username, theme: u.theme || 'dark' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/theme', requireAuth, async (req, res) => {
  const { theme } = req.body;
  if (!['light', 'dark', 'system'].includes(theme)) return res.status(400).json({ error: 'Invalid theme' });
  try {
    await pool.query('UPDATE users SET theme = $1 WHERE id = $2', [theme, req.user.userId]);
    res.json({ ok: true, theme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/email', requireAuth, async (req, res) => {
  const { newEmail, password } = req.body;
  if (!newEmail?.includes('@')) return res.status(400).json({ error: 'Invalid email address' });
  if (!password) return res.status(400).json({ error: 'Current password required' });
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.userId]);
    if (!result.rows.length || !(await bcrypt.compare(password, result.rows[0].password_hash))) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const updated = await pool.query(
      'UPDATE users SET email = $1 WHERE id = $2 RETURNING email',
      [newEmail.toLowerCase().trim(), req.user.userId]
    );
    res.json({ email: updated.rows[0].email });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword) return res.status(400).json({ error: 'Current password required' });
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.userId]);
    if (!result.rows.length || !(await bcrypt.compare(currentPassword, result.rows[0].password_hash))) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── GET all trades ────────────────────────────────────────────────────────────

app.get('/api/trades', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY trade_date DESC, created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows.map(mapTrade));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET single trade ──────────────────────────────────────────────────────────

app.get('/api/trades/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(mapTrade(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── POST create trade ─────────────────────────────────────────────────────────

app.post('/api/trades', requireAuth, async (req, res) => {
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
        user_id, pair, trade_date, trade_time, direction,
        entry_price, exit_price, sl_price, lot_size,
        pips, rr_multiple, tag, mood, notes,
        result_eur, result_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [
      req.user.userId,
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

app.put('/api/trades/:id', requireAuth, async (req, res) => {
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
      WHERE id=$16 AND user_id=$17 RETURNING *
    `, [
      pair, trade_date, trade_time || null, dir,
      entry_price || null, exit_price || null, sl_price || null,
      lot_size || null,
      pips || null, rr || null,
      tag || null, mood || null, notes || null,
      result_eur !== '' ? result_eur || null : null,
      status,
      req.params.id, req.user.userId,
    ]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(mapTrade(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ── DELETE trade ──────────────────────────────────────────────────────────────

app.delete('/api/trades/:id', requireAuth, async (req, res) => {
  try {
    const trade = await pool.query(
      'SELECT screenshot_1, screenshot_2 FROM trades WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.userId]
    );
    if (trade.rows.length) {
      const { screenshot_1, screenshot_2 } = trade.rows[0];
      [screenshot_1, screenshot_2].forEach(f => {
        if (f) {
          const fp = path.join('/app/uploads', f);
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
      });
    }
    await pool.query('DELETE FROM trades WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET stats ─────────────────────────────────────────────────────────────────

app.get('/api/stats', requireAuth, async (req, res) => {
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
      FROM trades WHERE user_id = $1
    `, [req.user.userId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── GET equity curve ──────────────────────────────────────────────────────────

app.get('/api/equity', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT trade_date, SUM(result_eur) AS daily_pl
      FROM trades
      WHERE result_status != 'OPEN' AND result_eur IS NOT NULL AND user_id = $1
      GROUP BY trade_date
      ORDER BY trade_date
    `, [req.user.userId]);
    let cumulative = 0;
    const points = result.rows.map((row, i) => {
      cumulative += parseFloat(row.daily_pl) || 0;
      return { d: i, v: cumulative, date: String(row.trade_date).slice(0, 10) };
    });
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// ── Export CSV ────────────────────────────────────────────────────────────────

app.get('/api/export', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY trade_date DESC, created_at DESC',
      [req.user.userId]
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
