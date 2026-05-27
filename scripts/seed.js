#!/usr/bin/env node
// =============================================================================
// FxLedger — Seed Script (Fake User + Trade Generator)
// Requires TEST_MODE=true on the server.
//
// Aufruf:
//   node scripts/seed.js --url https://fxledger.yourdomain.com --users 20 --trades 50
//   node scripts/seed.js --url http://localhost:8082 --users 5 --trades 10
//   node scripts/seed.js --url https://... --cleanup   ← löscht alle Testuser
//
// =============================================================================

const BASE_URL = process.argv.find((_, i) => process.argv[i-1] === '--url') || 'http://localhost:8082';
const NUM_USERS = parseInt(process.argv.find((_, i) => process.argv[i-1] === '--users') || '10');
const NUM_TRADES = parseInt(process.argv.find((_, i) => process.argv[i-1] === '--trades') || '30');
const CLEANUP_ONLY = process.argv.includes('--cleanup');
const TEST_DOMAIN = 'loadtest.fake';

// ── Helpers ──────────────────────────────────────────────────────────────────

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString().slice(0, 10);
}

function randomUsername() {
  const adj = ['swift','calm','bold','quiet','sharp','steady','quick','cool','smart','wise'];
  const noun = ['trader','pilot','hawk','fox','wolf','bear','bull','eagle','tiger','shark'];
  const num = randInt(10, 99);
  return `${pick(adj)}${pick(noun)}${num}`;
}

const PAIRS = ['EUR/USD','GBP/USD','USD/JPY','USD/CHF','AUD/USD','USD/CAD','NZD/USD',
               'EUR/GBP','EUR/JPY','GBP/JPY','XAU/USD','EUR/CHF','GBP/CHF'];
const TAGS  = ['London breakout','NY open','Asian range','Support bounce','Resistance fade',
               'Trend continuation','Reversal','News trade','Gap fill','Double top','Double bottom'];
const MOODS = ['calm','focused','patient','rushed','distracted'];

function fakeTrade(currency = 'EUR') {
  const pair = pick(PAIRS);
  const isJpy = pair.includes('JPY');
  const side = pick(['Long', 'Short']);
  const entry = isJpy ? rand(130, 155) : rand(1.05, 1.15);
  const pipFactor = isJpy ? 0.01 : 0.0001;
  const pips = rand(-60, 80);
  const exit = side === 'Long'
    ? entry + pips * pipFactor
    : entry - pips * pipFactor;
  const sl = side === 'Long'
    ? entry - rand(10, 30) * pipFactor
    : entry + rand(10, 30) * pipFactor;
  const pl = Math.round(pips * rand(8, 15)) * (Math.random() < 0.55 ? 1 : -1);
  const status = Math.abs(pl) < 3 ? 'BE' : pl > 0 ? 'WIN' : 'LOSS';

  return {
    pair,
    direction: side.toUpperCase(),
    trade_date: randomDate(180),
    trade_time: `${randInt(7,17).toString().padStart(2,'0')}:${pick(['00','15','30','45'])}`,
    entry_price: entry.toFixed(isJpy ? 3 : 5),
    exit_price: status === 'BE' ? entry.toFixed(isJpy ? 3 : 5) : exit.toFixed(isJpy ? 3 : 5),
    sl_price: sl.toFixed(isJpy ? 3 : 5),
    lot_size: pick(['0.10','0.25','0.50','1.00']),
    tag: Math.random() < 0.7 ? pick(TAGS) : null,
    mood: pick(MOODS),
    notes: Math.random() < 0.3 ? `${pick(['Good entry','Followed plan','Early exit','Hesitated','Clean setup'])}` : null,
    result_amount: status !== 'BE' ? String(pl) : '0',
  };
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function cleanup() {
  console.log(`\n🧹 Deleting all @${TEST_DOMAIN} users…`);
  const res = await api('DELETE', `/test/cleanup?domain=${TEST_DOMAIN}`);
  if (res.status === 200) {
    console.log(`   ✓ Deleted ${res.data.deleted} test users (+ all their trades via CASCADE)`);
  } else {
    console.error(`   ✗ Failed: ${JSON.stringify(res.data)}`);
    console.error(`   → Is TEST_MODE=true on the server?`);
  }
}

async function seed() {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║   FxLedger Seed — ${NUM_USERS} users × ${NUM_TRADES} trades`);
  console.log(`╚══════════════════════════════════════════╝`);
  console.log(`   Target: ${BASE_URL}\n`);

  let created = 0, failed = 0, totalTrades = 0;

  for (let i = 0; i < NUM_USERS; i++) {
    const username = randomUsername() + '_' + i;
    const email = `${username}@${TEST_DOMAIN}`;
    const password = 'Loadtest123!';

    // Register
    const reg = await api('POST', '/auth/register', {
      email, password, username, design: 'hyper', mode: 'dark',
    });

    if (!reg.data.token) {
      console.log(`  ✗ [${i+1}/${NUM_USERS}] ${username} — register failed: ${JSON.stringify(reg.data)}`);
      failed++;
      continue;
    }

    const token = reg.data.token;
    created++;

    // Create trades
    let tradeOk = 0;
    const tradePromises = Array.from({ length: NUM_TRADES }, () =>
      api('POST', '/trades', fakeTrade(), token)
        .then(r => { if (r.status === 201) tradeOk++; })
    );
    await Promise.all(tradePromises);
    totalTrades += tradeOk;

    process.stdout.write(`  ✓ [${i+1}/${NUM_USERS}] ${username} — ${tradeOk}/${NUM_TRADES} trades\n`);
  }

  console.log(`\nDone:`);
  console.log(`  Users created:  ${created}/${NUM_USERS}`);
  console.log(`  Users failed:   ${failed}`);
  console.log(`  Trades created: ${totalTrades}`);
  console.log(`\nCleanup after testing:`);
  console.log(`  node scripts/seed.js --url ${BASE_URL} --cleanup\n`);
}

(async () => {
  if (CLEANUP_ONLY) {
    await cleanup();
  } else {
    await seed();
  }
})().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
