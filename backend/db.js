const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mltraderlog',
  user: process.env.DB_USER || 'mltrader',
  password: process.env.DB_PASSWORD,
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),

        pair VARCHAR(20) NOT NULL,
        trade_date DATE NOT NULL,
        direction VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),

        daily_context VARCHAR(20) CHECK (daily_context IN ('RANGE', 'UPTREND', 'DOWNTREND')),
        zone_tests INTEGER,
        zone_last_test_days INTEGER,
        approach_character VARCHAR(20) CHECK (approach_character IN ('IMPULSIV', 'MEANDERND', 'LANGSAM')),

        h1_slowing BOOLEAN DEFAULT FALSE,
        h1_wicks BOOLEAN DEFAULT FALSE,
        h1_stabilization BOOLEAN DEFAULT FALSE,
        h1_rejection BOOLEAN DEFAULT FALSE,

        entry_trigger TEXT,
        entry_price NUMERIC(12, 5),
        sl_price NUMERIC(12, 5),
        tp_price NUMERIC(12, 5),

        result_eur NUMERIC(10, 2),
        result_status VARCHAR(20) CHECK (result_status IN ('WIN', 'LOSS', 'BE', 'OPEN')),
        duration_days INTEGER,

        screenshot_1 VARCHAR(255),
        screenshot_2 VARCHAR(255),
        notes TEXT
      );
    `);

    // Migrations — safe to run on existing schema
    const migrations = [
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS trade_time VARCHAR(5)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS exit_price NUMERIC(12, 5)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS lot_size NUMERIC(10, 2)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS pips NUMERIC(10, 1)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS rr_multiple NUMERIC(6, 2)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS mood VARCHAR(20)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS tag VARCHAR(100)`,
      `ALTER TABLE trades ALTER COLUMN daily_context DROP NOT NULL`,
      `ALTER TABLE trades ALTER COLUMN approach_character DROP NOT NULL`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(20)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (lower(username)) WHERE username IS NOT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(10) NOT NULL DEFAULT 'dark'`,
      `CREATE TABLE IF NOT EXISTS password_history (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS password_history_user_id ON password_history (user_id, created_at DESC)`,
    ];
    for (const sql of migrations) {
      await client.query(sql);
    }

    console.log('Database initialized');
  } finally {
    client.release();
  }
};

function mapTrade(row) {
  const pl = Math.round(parseFloat(row.result_eur) || 0);
  return {
    id: String(row.id).padStart(4, '0'),
    date: row.trade_date instanceof Date
      ? row.trade_date.toISOString().slice(0, 10)
      : String(row.trade_date).slice(0, 10),
    time: row.trade_time || '00:00',
    pair: row.pair,
    side: (row.direction || 'LONG').toLowerCase(),
    entry: parseFloat(row.entry_price) || 0,
    exit: parseFloat(row.exit_price) || parseFloat(row.tp_price) || 0,
    sl: parseFloat(row.sl_price) || 0,
    size: parseFloat(row.lot_size) || 1.0,
    pl,
    pips: parseFloat(row.pips) || 0,
    rr: parseFloat(row.rr_multiple) || 0,
    tag: row.tag || row.entry_trigger || '',
    mood: row.mood || 'calm',
    note: row.notes || '',
    status: row.result_status || 'OPEN',
  };
}

module.exports = { pool, initDb, mapTrade };
