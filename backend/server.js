require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { pool, initDb, mapTrade } = require('./db');

// ── Test mode ────────────────────────────────────────────────────────────────
// TEST_MODE=true  →  skip email, auto-verify on register, expose cleanup endpoint
const TEST_MODE = process.env.TEST_MODE === 'true';
if (TEST_MODE) console.warn('[TEST_MODE] Email verification disabled — DO NOT use in production');

// ── Mailer ────────────────────────────────────────────────────────────────────

const mailer = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationEmail(email, code) {
  if (TEST_MODE) return; // silent skip in test mode
  if (!mailer) {
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return;
  }
  const from = process.env.SMTP_FROM || 'FxLedger <noreply@fxledger.app>';
  await mailer.sendMail({
    from,
    to: email,
    subject: 'Your FxLedger verification code',
    text: `Your verification code is: ${code}\n\nThis code expires in 15 minutes. If you did not sign up for FxLedger, you can ignore this email.`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
        <p style="font-size:14px;color:#6b6358;margin:0 0 24px">FxLedger</p>
        <h1 style="font-size:28px;font-weight:400;color:#2a2620;margin:0 0 16px;letter-spacing:-0.5px">Verify your email</h1>
        <p style="font-size:15px;color:#6b6358;margin:0 0 32px;line-height:1.6">Enter this code in FxLedger to confirm your email address. It expires in 15 minutes.</p>
        <div style="font-size:36px;font-weight:600;letter-spacing:12px;color:#2a2620;padding:24px 32px;background:#fbf6ec;border-radius:10px;text-align:center">${code}</div>
        <p style="font-size:13px;color:#a39c8e;margin:24px 0 0;line-height:1.5">If you did not sign up for FxLedger, you can safely ignore this email.</p>
      </div>`,
  });
}

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
  const { email, password, username, design, mode } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and password (min 8 chars) required' });
  }
  const usernameErr = validateUsername(username);
  if (usernameErr) return res.status(400).json({ error: usernameErr });
  const normalizedUsername = normalizeUsername(username);
  const safeDesign = ['linen', 'hyper'].includes(design) ? design : 'hyper';
  const safeMode   = ['light', 'dark', 'system'].includes(mode) ? mode : 'dark';
  try {
    const hash = await bcrypt.hash(password, 10);
    // In TEST_MODE: register as already verified, return JWT immediately
    const verified = TEST_MODE ? true : false;
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username, design, color_mode, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, username`,
      [email.toLowerCase().trim(), hash, normalizedUsername, safeDesign, safeMode, verified]
    );
    const user = result.rows[0];

    if (TEST_MODE) {
      const token = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        JWT_SECRET, { expiresIn: '30d' }
      );
      return res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username, design: safeDesign, colorMode: safeMode, accountCurrency: 'EUR', accountBalance: 0 } });
    }

    // Generate and store verification code (15 min expiry)
    const code = generateCode();
    await pool.query(
      `INSERT INTO email_verifications (user_id, code, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [user.id, code]
    );
    await sendVerificationEmail(user.email, code);

    res.status(201).json({ requiresVerification: true, email: user.email, design: safeDesign, mode: safeMode });
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
      'SELECT id, email, username, password_hash, design, color_mode, email_verified FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.email_verified) {
      // Resend a fresh code and prompt verification
      const code = generateCode();
      await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [user.id]);
      await pool.query(
        `INSERT INTO email_verifications (user_id, code, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
        [user.id, code]
      );
      await sendVerificationEmail(user.email, code);
      return res.status(403).json({ requiresVerification: true, email: user.email });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET, { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, design: user.design || 'hyper', colorMode: user.color_mode || 'dark', accountCurrency: user.account_currency || 'EUR', accountBalance: parseFloat(user.account_balance) || 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
  try {
    const userRes = await pool.query(
      'SELECT id, email, username, design, color_mode, account_currency, account_balance FROM users WHERE email = $1 AND email_verified = FALSE',
      [email.toLowerCase().trim()]
    );
    if (!userRes.rows.length) return res.status(400).json({ error: 'Invalid or already verified' });
    const user = userRes.rows[0];

    const codeRes = await pool.query(
      `SELECT id FROM email_verifications
       WHERE user_id = $1 AND code = $2 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id, code.trim()]
    );
    if (!codeRes.rows.length) return res.status(400).json({ error: 'Invalid or expired code' });

    // Mark verified, delete codes
    await pool.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [user.id]);
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [user.id]);

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET, { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, design: user.design || 'hyper', colorMode: user.color_mode || 'dark', accountCurrency: user.account_currency || 'EUR', accountBalance: parseFloat(user.account_balance) || 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    const userRes = await pool.query(
      'SELECT id, email FROM users WHERE email = $1 AND email_verified = FALSE',
      [email.toLowerCase().trim()]
    );
    if (!userRes.rows.length) return res.status(400).json({ error: 'Not found or already verified' });
    const user = userRes.rows[0];

    // Rate-limit: only allow resend if last code is older than 60 seconds
    const recent = await pool.query(
      `SELECT created_at FROM email_verifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    if (recent.rows.length) {
      const ageSeconds = (Date.now() - new Date(recent.rows[0].created_at).getTime()) / 1000;
      if (ageSeconds < 60) {
        return res.status(429).json({ error: 'Please wait before requesting another code', retryAfter: Math.ceil(60 - ageSeconds) });
      }
    }

    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [user.id]);
    const code = generateCode();
    await pool.query(
      `INSERT INTO email_verifications (user_id, code, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [user.id, code]
    );
    await sendVerificationEmail(user.email, code);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, design, color_mode, account_currency, account_balance FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    res.json({
      id: u.id, email: u.email, username: u.username,
      design: u.design || 'hyper', colorMode: u.color_mode || 'dark',
      accountCurrency: u.account_currency || 'EUR',
      accountBalance: parseFloat(u.account_balance) || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/appearance', requireAuth, async (req, res) => {
  const { design, mode } = req.body;
  if (!['linen', 'hyper'].includes(design)) return res.status(400).json({ error: 'Invalid design' });
  if (!['light', 'dark', 'system'].includes(mode)) return res.status(400).json({ error: 'Invalid mode' });
  try {
    await pool.query('UPDATE users SET design = $1, color_mode = $2 WHERE id = $3', [design, mode, req.user.userId]);
    res.json({ ok: true, design, colorMode: mode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/auth/account', requireAuth, async (req, res) => {
  const { currency, balance } = req.body;
  const CURRENCIES = ['USD','EUR','GBP','JPY','CHF','AUD','CAD','NZD','SGD','HKD'];
  if (!CURRENCIES.includes(currency)) return res.status(400).json({ error: 'Invalid currency' });
  const bal = parseFloat(balance);
  if (isNaN(bal)) return res.status(400).json({ error: 'Invalid balance' });
  try {
    await pool.query(
      'UPDATE users SET account_currency = $1, account_balance = $2 WHERE id = $3',
      [currency, bal, req.user.userId]
    );
    res.json({ ok: true, accountCurrency: currency, accountBalance: bal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/auth/account', requireAuth, async (req, res) => {
  try {
    // Cascade deletes trades + password_history via FK ON DELETE CASCADE
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.userId]);
    res.json({ ok: true });
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

    // Check against last 3 passwords in history
    const history = await pool.query(
      'SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3',
      [req.user.userId]
    );
    for (const row of history.rows) {
      if (await bcrypt.compare(newPassword, row.password_hash)) {
        return res.status(400).json({ error: 'This password was used recently. Please choose a different one.' });
      }
    }

    // Save old hash to history, then update password
    const oldHash = result.rows[0].password_hash;
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)', [req.user.userId, oldHash]);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.userId]);

    // Keep only the last 10 entries per user
    await pool.query(
      `DELETE FROM password_history WHERE user_id = $1 AND id NOT IN (
        SELECT id FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10
      )`,
      [req.user.userId]
    );

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

function calcStatus(resultAmount, exitPrice, pips) {
  const hasExit = exitPrice && parseFloat(exitPrice) > 0;
  if (!hasExit && (resultAmount === null || resultAmount === undefined || resultAmount === '')) return 'OPEN';
  const pl = resultAmount !== null && resultAmount !== undefined && resultAmount !== ''
    ? parseFloat(resultAmount)
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
    tag, mood, notes, result_amount,
  } = req.body;

  const dir = (direction || 'LONG').toUpperCase();
  const pips = calcPips(pair, dir, entry_price, exit_price);
  const rr = calcRR(pips, entry_price, sl_price, pair);
  const status = calcStatus(result_amount, exit_price, pips);

  try {
    const result = await pool.query(`
      INSERT INTO trades (
        user_id, pair, trade_date, trade_time, direction,
        entry_price, exit_price, sl_price, lot_size,
        pips, rr_multiple, tag, mood, notes,
        result_amount, result_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [
      req.user.userId,
      pair, trade_date, trade_time || null, dir,
      entry_price || null, exit_price || null, sl_price || null,
      lot_size || null,
      pips || null, rr || null,
      tag || null, mood || null, notes || null,
      result_amount !== '' ? result_amount || null : null,
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
    tag, mood, notes, result_amount,
  } = req.body;

  const dir = (direction || 'LONG').toUpperCase();
  const pips = calcPips(pair, dir, entry_price, exit_price);
  const rr = calcRR(pips, entry_price, sl_price, pair);
  const status = calcStatus(result_amount, exit_price, pips);

  try {
    const result = await pool.query(`
      UPDATE trades SET
        pair=$1, trade_date=$2, trade_time=$3, direction=$4,
        entry_price=$5, exit_price=$6, sl_price=$7, lot_size=$8,
        pips=$9, rr_multiple=$10, tag=$11, mood=$12, notes=$13,
        result_amount=$14, result_status=$15
      WHERE id=$16 AND user_id=$17 RETURNING *
    `, [
      pair, trade_date, trade_time || null, dir,
      entry_price || null, exit_price || null, sl_price || null,
      lot_size || null,
      pips || null, rr || null,
      tag || null, mood || null, notes || null,
      result_amount !== '' ? result_amount || null : null,
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
        COALESCE(SUM(result_amount) FILTER (WHERE result_status != 'OPEN'), 0) AS total_pnl,
        COALESCE(AVG(rr_multiple) FILTER (WHERE result_status = 'WIN'), 0) AS avg_rr,
        COALESCE(SUM(result_amount) FILTER (
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
      SELECT trade_date, SUM(result_amount) AS daily_pl
      FROM trades
      WHERE result_status != 'OPEN' AND result_amount IS NOT NULL AND user_id = $1
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
      'result_amount', 'result_status', 'notes'];
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

// ── Test-only cleanup endpoint ────────────────────────────────────────────────
// DELETE /api/test/cleanup?domain=loadtest.fake
// Only available when TEST_MODE=true — deletes all users with matching email domain
if (TEST_MODE) {
  app.delete('/api/test/cleanup', async (req, res) => {
    const domain = (req.query.domain || '').replace(/[^a-z0-9.-]/gi, '');
    if (!domain) return res.status(400).json({ error: 'domain query param required' });
    try {
      const result = await pool.query(
        `DELETE FROM users WHERE email LIKE $1 RETURNING id`,
        [`%@${domain}`]
      );
      console.log(`[TEST_MODE] Cleanup: deleted ${result.rowCount} users with @${domain}`);
      res.json({ deleted: result.rowCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  });
}

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
