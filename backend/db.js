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
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),

        -- Basis
        pair VARCHAR(20) NOT NULL,
        trade_date DATE NOT NULL,
        direction VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),

        -- Kontext
        daily_context VARCHAR(20) NOT NULL CHECK (daily_context IN ('RANGE', 'UPTREND', 'DOWNTREND')),
        zone_tests INTEGER,
        zone_last_test_days INTEGER,

        -- Anlauf-Charakter
        approach_character VARCHAR(20) NOT NULL CHECK (approach_character IN ('IMPULSIV', 'MEANDERND', 'LANGSAM')),

        -- H1-Verhalten an der Zone
        h1_slowing BOOLEAN DEFAULT FALSE,
        h1_wicks BOOLEAN DEFAULT FALSE,
        h1_stabilization BOOLEAN DEFAULT FALSE,
        h1_rejection BOOLEAN DEFAULT FALSE,

        -- Entry-Details
        entry_trigger TEXT,
        entry_price NUMERIC(12, 5),
        sl_price NUMERIC(12, 5),
        tp_price NUMERIC(12, 5),

        -- Positionsgröße
        lot_size NUMERIC(10, 4),

        -- Kosten & Ergebnis
        gross_eur NUMERIC(10, 2),
        commission NUMERIC(10, 2),
        swap NUMERIC(10, 2),
        result_eur NUMERIC(10, 2),
        result_status VARCHAR(20) CHECK (result_status IN ('WIN', 'LOSS', 'BE', 'OPEN')),
        duration_days INTEGER,

        -- Screenshots
        ctrader_screenshot VARCHAR(255),
        screenshot_1 VARCHAR(255),
        screenshot_2 VARCHAR(255),
        screenshot_3 VARCHAR(255),

        -- Notizen
        notes TEXT
      );
    `);

    // Migrations: neue Spalten hinzufügen falls noch nicht vorhanden
    const migrations = [
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS lot_size NUMERIC(10, 4)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS gross_eur NUMERIC(10, 2)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS commission NUMERIC(10, 2)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS swap NUMERIC(10, 2)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS ctrader_screenshot VARCHAR(255)`,
      `ALTER TABLE trades ADD COLUMN IF NOT EXISTS screenshot_3 VARCHAR(255)`,
    ];

    for (const sql of migrations) {
      await client.query(sql);
    }

    console.log('Database initialized');
  } finally {
    client.release();
  }
};

module.exports = { pool, initDb };
