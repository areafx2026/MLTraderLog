#!/usr/bin/env node
// =============================================================================
// FxLedger — Demo Trade Generator
// Fügt einem bestehenden User realistische Testtrades ein, damit alle
// Dashboard-, Insights- und Listenansichten befüllt aussehen.
//
// Aufruf:
//   node scripts/demo-trades.js --url http://... --email du@example.com --password deinPW
//   node scripts/demo-trades.js --url http://... --email du@example.com --password deinPW --count 120
//   node scripts/demo-trades.js --url http://... --email du@example.com --password deinPW --clear
//
// Optionen:
//   --count N    Anzahl Trades (Standard: 80)
//   --clear      Löscht alle Trades des Users vor dem Einfügen
// =============================================================================

const BASE_URL  = process.argv.find((_, i) => process.argv[i-1] === '--url')      || 'http://localhost:8082';
const EMAIL     = process.argv.find((_, i) => process.argv[i-1] === '--email')    || '';
const PASSWORD  = process.argv.find((_, i) => process.argv[i-1] === '--password') || '';
const COUNT     = parseInt(process.argv.find((_, i) => process.argv[i-1] === '--count') || '80');
const CLEAR     = process.argv.includes('--clear');

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/demo-trades.js --url <url> --email <email> --password <pw> [--count N] [--clear]');
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

// Erzeugt ein Datum N Tage in der Vergangenheit
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Verteilt Trades über 6 Monate — neuere Daten häufiger (realistisch)
function tradeDate(index, total) {
  // Exponentiell mehr Trades in den letzten Wochen
  const weight = Math.pow(index / total, 1.5);
  const maxDays = 180;
  const daysBack = Math.floor((1 - weight) * maxDays);
  // Streue innerhalb des Tages-Slots leicht zufällig
  const jitter = randInt(0, 5);
  return daysAgo(daysBack + jitter);
}

const PAIRS = [
  { pair: 'EUR/USD', isJpy: false, typical: [1.05, 1.12] },
  { pair: 'GBP/USD', isJpy: false, typical: [1.24, 1.32] },
  { pair: 'USD/JPY', isJpy: true,  typical: [145, 157]   },
  { pair: 'USD/CHF', isJpy: false, typical: [0.88, 0.93] },
  { pair: 'AUD/USD', isJpy: false, typical: [0.63, 0.68] },
  { pair: 'USD/CAD', isJpy: false, typical: [1.34, 1.38] },
  { pair: 'EUR/GBP', isJpy: false, typical: [0.84, 0.87] },
  { pair: 'GBP/JPY', isJpy: true,  typical: [185, 200]   },
  { pair: 'EUR/JPY', isJpy: true,  typical: [158, 168]   },
  { pair: 'XAU/USD', isJpy: false, typical: [2000, 2350] },
];

// Gewichtete Pair-Auswahl — Majors öfter als Exoten
const PAIR_WEIGHTS = [30, 20, 20, 8, 8, 8, 5, 5, 5, 5];
function weightedPair() {
  const total = PAIR_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PAIRS.length; i++) {
    r -= PAIR_WEIGHTS[i];
    if (r <= 0) return PAIRS[i];
  }
  return PAIRS[0];
}

const SETUPS = [
  'London breakout', 'NY open', 'Asian range fade',
  'Support bounce', 'Resistance fade', 'Trend continuation',
  'Reversal', 'Double bottom', 'Double top', 'Gap fill',
  'News trade', 'VWAP reversion',
];

const MOODS = ['calm', 'focused', 'patient', 'rushed', 'distracted'];

// Realistischere PnL-Verteilung: 55% Win, 35% Loss, 10% BE
// Mit positiver Erwartungswert-Kurve (leicht steigend)
function tradePnL(winRate = 0.55) {
  const r = Math.random();
  if (r < 0.10) return 0;                         // BE
  if (r < 0.10 + (1 - winRate)) {                 // Loss
    return -Math.round(rand(30, 180));
  }
  return Math.round(rand(40, 280));                // Win (größer als Loss → positiver EW)
}

const TIMES = ['07:00','07:30','08:00','08:15','08:30','09:00','09:30',
               '10:00','10:30','12:00','13:00','13:30','14:00','14:30',
               '15:00','15:30','16:00','17:00'];

const NOTES_TEMPLATES = [
  'Followed plan perfectly.',
  'Entered slightly late but managed well.',
  'Hesitated at entry, then jumped in.',
  'Clean setup, textbook execution.',
  'Should have taken partial profits earlier.',
  'Moved SL to BE too early.',
  'News event accelerated the move.',
  'Patience paid off — waited for confirmation.',
  'Overtraded after a loss — need to reset.',
  'Best trade of the week.',
  null, null, null, null, // 40% no notes
];

function buildTrade(index, total) {
  const { pair, isJpy, typical } = weightedPair();
  const factor = isJpy ? 100 : 10000;
  const side = Math.random() < 0.52 ? 'LONG' : 'SHORT'; // leicht long-bias

  const entry = rand(typical[0], typical[1]);
  const pl = tradePnL();
  const status = pl > 0 ? 'WIN' : pl < 0 ? 'LOSS' : 'BE';

  // Berechne Exit aus PnL (vereinfacht, ohne echtes Lot-Sizing)
  const pipValue = 10; // ~10 Einheiten pro Pip
  const pips = pl / pipValue;
  const pipMove = pips / factor;
  const exit = side === 'LONG' ? entry + pipMove : entry - pipMove;

  // SL: 15-35 Pips vom Entry
  const slPips = rand(15, 35) / factor;
  const sl = side === 'LONG' ? entry - slPips : entry + slPips;

  const lot = pick(['0.10', '0.25', '0.50', '0.10', '0.10']); // meist klein

  return {
    pair,
    direction: side,
    trade_date: tradeDate(index, total),
    trade_time: pick(TIMES),
    entry_price: entry.toFixed(isJpy ? 3 : 5),
    exit_price: status === 'BE' ? entry.toFixed(isJpy ? 3 : 5) : exit.toFixed(isJpy ? 3 : 5),
    sl_price: sl.toFixed(isJpy ? 3 : 5),
    lot_size: lot,
    tag: Math.random() < 0.80 ? pick(SETUPS) : null,
    mood: Math.random() < 0.85 ? pick(MOODS.filter(m => m !== 'distracted')) : 'distracted',
    notes: pick(NOTES_TEMPLATES),
    result_amount: String(pl),
  };
}

// ── API ───────────────────────────────────────────────────────────────────────

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log(`║   FxLedger Demo Trades — ${COUNT} Trades`);
  console.log('╚══════════════════════════════════════════╝');
  console.log(`   User:   ${EMAIL}`);
  console.log(`   Target: ${BASE_URL}\n`);

  // 1) Login
  process.stdout.write('▶ Login … ');
  const login = await api('POST', '/auth/login', { email: EMAIL, password: PASSWORD });
  if (!login.data.token) {
    console.error(`\n✗ Login fehlgeschlagen: ${JSON.stringify(login.data)}`);
    process.exit(1);
  }
  const token = login.data.token;
  console.log('✓');

  // 2) Optional: alle Trades löschen
  if (CLEAR) {
    process.stdout.write('▶ Bestehende Trades löschen … ');
    const existing = await api('GET', '/trades', null, token);
    const trades = existing.data;
    if (Array.isArray(trades) && trades.length > 0) {
      await Promise.all(trades.map(t => api('DELETE', `/trades/${t.id}`, null, token)));
      console.log(`✓ ${trades.length} Trades gelöscht`);
    } else {
      console.log('keine vorhanden');
    }
  }

  // 3) Trades einfügen
  console.log(`▶ ${COUNT} Trades werden angelegt …\n`);
  let ok = 0, fail = 0;
  let totalPnl = 0;

  // Sequenziell, damit die Datums-Sortierung konsistent bleibt
  for (let i = 0; i < COUNT; i++) {
    const trade = buildTrade(i, COUNT);
    const res = await api('POST', '/trades', trade, token);
    if (res.status === 201) {
      ok++;
      totalPnl += parseInt(trade.result_amount) || 0;
      const bar = '█'.repeat(Math.floor(ok / COUNT * 30)).padEnd(30, '░');
      process.stdout.write(`\r  [${bar}] ${ok}/${COUNT}`);
    } else {
      fail++;
    }
  }

  // 4) Zusammenfassung
  const sign = totalPnl >= 0 ? '+' : '';
  console.log(`\n\n✓ ${ok} Trades angelegt${fail > 0 ? `, ${fail} fehlgeschlagen` : ''}`);
  console.log(`  Kumulierter P&L: ${sign}${totalPnl}`);
  console.log(`  Zeitraum:        letzte 6 Monate\n`);
})().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
