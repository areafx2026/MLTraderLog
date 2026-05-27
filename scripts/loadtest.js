// =============================================================================
// FxLedger — k6 Load Test
// Simulates concurrent users: register → login → create trade → fetch trades
//
// Voraussetzung: k6 installiert (https://k6.io/docs/get-started/installation/)
//               TEST_MODE=true auf dem Server
//
// Aufruf:
//   k6 run scripts/loadtest.js
//   k6 run --env BASE_URL=https://fxledger.yourdomain.com scripts/loadtest.js
//   k6 run --vus 100 --duration 60s scripts/loadtest.js
//
// Standard: 100 VUs, 60 Sekunden
// =============================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';
const TEST_DOMAIN = 'loadtest.fake';

// ── Custom metrics ────────────────────────────────────────────────────────────
const registerErrors  = new Counter('register_errors');
const loginErrors     = new Counter('login_errors');
const tradeErrors     = new Counter('trade_errors');
const registerSuccess = new Rate('register_success_rate');
const loginSuccess    = new Rate('login_success_rate');
const tradeSuccess    = new Rate('trade_success_rate');
const registerTime    = new Trend('register_duration', true);
const loginTime       = new Trend('login_duration', true);
const tradeTime       = new Trend('trade_duration', true);

// ── Test configuration ────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 25  },  // Ramp up to 25 users
        { duration: '15s', target: 100 },  // Ramp up to 100 users
        { duration: '30s', target: 100 },  // Hold at 100 users
        { duration: '10s', target: 0   },  // Ramp down
      ],
    },
  },
  thresholds: {
    // Register is bcrypt-heavy — allow up to 8s p(95) under 100 concurrent users
    // Trades and reads must stay fast
    'register_duration':    ['p(95)<8000'],
    'trade_duration':       ['p(95)<3000'],
    'login_duration':       ['p(95)<3000'],
    http_req_failed:        ['rate<0.02'],   // Less than 2% hard errors
    register_success_rate:  ['rate>0.95'],   // 95%+ register success
    login_success_rate:     ['rate>0.95'],
    trade_success_rate:     ['rate>0.98'],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const PAIRS  = ['EUR/USD','GBP/USD','USD/JPY','AUD/USD','USD/CAD','EUR/GBP'];
const MOODS  = ['calm','focused','patient'];
const TAGS   = ['London breakout','NY open','Support bounce','Trend continuation'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(min, max) { return (Math.random() * (max - min) + min).toFixed(5); }

function fakeTrade() {
  const entry = parseFloat(rnd(1.05, 1.15));
  const exit  = parseFloat(rnd(1.05, 1.15));
  const pl    = Math.round((exit - entry) * 10000 * 10);
  return JSON.stringify({
    pair: pick(PAIRS),
    direction: Math.random() > 0.5 ? 'LONG' : 'SHORT',
    trade_date: new Date().toISOString().slice(0, 10),
    trade_time: '09:30',
    entry_price: String(entry),
    exit_price: String(exit),
    sl_price: rnd(1.04, 1.05),
    lot_size: '0.10',
    tag: pick(TAGS),
    mood: pick(MOODS),
    result_amount: String(pl),
  });
}

const headers = { 'Content-Type': 'application/json' };

// ── Main scenario ─────────────────────────────────────────────────────────────
export default function () {
  // Use __VU (1-100) + __ITER (per-VU counter) for guaranteed uniqueness
  // e.g. "u42_137" — always < 20 chars, never collides
  const username = `u${__VU}_${__ITER}`;
  const email = `${username}@${TEST_DOMAIN}`;
  const password = 'Loadtest123!';

  // 1) Register
  const t0 = Date.now();
  const regRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ email, password, username, design: 'hyper', mode: 'dark' }),
    { headers }
  );
  registerTime.add(Date.now() - t0);

  const regOk = check(regRes, {
    'register 201': (r) => r.status === 201,
    'register returns token': (r) => {
      try { return !!JSON.parse(r.body).token; } catch { return false; }
    },
  });
  registerSuccess.add(regOk);
  if (!regOk) { registerErrors.add(1); return; }

  const token = JSON.parse(regRes.body).token;
  const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

  sleep(0.5);

  // 2) Create 3 trades
  for (let i = 0; i < 3; i++) {
    const t1 = Date.now();
    const tradeRes = http.post(
      `${BASE_URL}/api/trades`,
      fakeTrade(),
      { headers: authHeaders }
    );
    tradeTime.add(Date.now() - t1);

    const tradeOk = check(tradeRes, { 'trade 201': (r) => r.status === 201 });
    tradeSuccess.add(tradeOk);
    if (!tradeOk) tradeErrors.add(1);
  }

  sleep(0.5);

  // 3) Fetch trade list
  const t2 = Date.now();
  const listRes = http.get(`${BASE_URL}/api/trades`, { headers: authHeaders });
  loginTime.add(Date.now() - t2);

  const listOk = check(listRes, {
    'trades 200': (r) => r.status === 200,
    'trades is array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
    },
  });
  loginSuccess.add(listOk);
  if (!listOk) loginErrors.add(1);

  sleep(1);
}
