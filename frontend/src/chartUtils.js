export function pathFor(points, w, h, pad = 4) {
  if (!points || points.length < 2) return '';
  const xs = points.map(p => p.d);
  const ys = points.map(p => p.v);
  const xmin = Math.min(...xs), xmax = Math.max(...xs);
  const ymin = Math.min(...ys), ymax = Math.max(...ys);
  const dx = xmax - xmin || 1;
  const dy = ymax - ymin || 1;
  const sx = (x) => pad + (w - pad * 2) * (x - xmin) / dx;
  const sy = (y) => h - pad - (h - pad * 2) * (y - ymin) / dy;
  return points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.d).toFixed(1)},${sy(p.v).toFixed(1)}`).join(' ');
}

export function areaFor(points, w, h, pad = 4) {
  const line = pathFor(points, w, h, pad);
  if (!line) return '';
  return `${line} L${w - pad},${h - pad} L${pad},${h - pad} Z`;
}

export function usd(n) {
  return Number(n).toLocaleString('en-US');
}

export function computeEquity(trades, startBalance = 0) {
  const closed = trades.filter(t => t.status !== 'OPEN' && t.pl !== 0);
  const sorted = [...closed].sort((a, b) => a.date.localeCompare(b.date));

  const dailyPL = {};
  sorted.forEach(t => {
    dailyPL[t.date] = (dailyPL[t.date] || 0) + t.pl;
  });

  let cumulative = startBalance;
  return Object.entries(dailyPL)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, pl], i) => {
      cumulative += pl;
      return { d: i, v: cumulative, date };
    });
}

export function computeStats(trades, startBalance = 0) {
  const closed = trades.filter(t => t.status !== 'OPEN');
  const wins = closed.filter(t => t.pl > 0);
  const totalClosed = closed.length;

  const winRate = totalClosed > 0 ? Math.round(100 * wins.length / totalClosed) : 0;
  const avgRR = wins.length > 0
    ? Math.round(10 * wins.reduce((s, t) => s + (t.rr || 0), 0) / wins.length) / 10
    : 0;

  // trades vom API kommen newest-first — für chronologische Berechnungen umkehren
  const chronological = [...closed].sort((a, b) => a.date.localeCompare(b.date));

  // Current streak: von neuestem Trade rückwärts zählen (newest-first = closed as-is)
  let streak = 0;
  for (const t of closed) {
    if (t.pl > 0) streak++;
    else break;
  }

  // Highest streak: chronologisch vorwärts
  let highestStreak = 0, cur = 0;
  for (const t of chronological) {
    if (t.pl > 0) { cur++; if (cur > highestStreak) highestStreak = cur; }
    else cur = 0;
  }

  // Drawdown: chronologisch vorwärts, relativ zum Startkapital
  const base = startBalance > 0 ? startBalance : null;
  let peak = base || 0, bal = base || 0, maxDD = 0;
  for (const t of chronological) {
    bal += t.pl;
    if (bal > peak) peak = bal;
    const ref = base || peak;
    const dd = ref > 0 ? Math.max((bal - peak) / ref * 100, -100) : 0;
    if (dd < maxDD) maxDD = dd;
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().slice(0, 10);
  const monthPL = closed
    .filter(t => t.date >= monthStart)
    .reduce((s, t) => s + t.pl, 0);
  const monthTrades = closed.filter(t => t.date >= monthStart).length;

  const totalPL = closed.reduce((s, t) => s + t.pl, 0);

  return {
    winRate,
    avgRR,
    streak,
    highestStreak,
    drawdown: Math.round(maxDD * 10) / 10,
    totalPL,
    monthPL,
    monthTrades,
    totalClosed,
    wins: wins.length,
  };
}

export function computeInsights(trades) {
  const closed = trades.filter(t => t.status !== 'OPEN');

  const byPair = {};
  closed.forEach(t => {
    if (!byPair[t.pair]) byPair[t.pair] = { pl: 0, count: 0, wins: 0 };
    byPair[t.pair].pl += t.pl;
    byPair[t.pair].count++;
    if (t.pl > 0) byPair[t.pair].wins++;
  });
  const bestPair = Object.entries(byPair).sort((a, b) => b[1].pl - a[1].pl)[0];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const byDay = {};
  closed.forEach(t => {
    const name = dayNames[new Date(t.date + 'T12:00:00').getDay()];
    if (!byDay[name]) byDay[name] = { pl: 0, count: 0 };
    byDay[name].pl += t.pl;
    byDay[name].count++;
  });
  const bestDay = Object.entries(byDay).sort((a, b) => b[1].pl - a[1].pl)[0];

  const byTag = {};
  closed.forEach(t => {
    if (!t.tag) return;
    if (!byTag[t.tag]) byTag[t.tag] = { pl: 0, losses: 0, count: 0 };
    byTag[t.tag].pl += t.pl;
    byTag[t.tag].count++;
    if (t.pl < 0) byTag[t.tag].losses++;
  });
  const watchOut = Object.entries(byTag)
    .filter(([, v]) => v.losses > 0)
    .sort((a, b) => a[1].pl - b[1].pl)[0];

  return { bestPair, bestDay, watchOut };
}

const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth',
  'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth',
  'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth',
  'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth',
  'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth',
  'thirtieth', 'thirty-first'];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDateLong(date = new Date()) {
  const d = date instanceof Date ? date : new Date();
  return `${DAY_NAMES[d.getDay()]}, the ${ORDINALS[d.getDate()]} of ${MONTH_NAMES[d.getMonth()]}`;
}

export function formatMonthYear(date = new Date()) {
  const d = date instanceof Date ? date : new Date();
  return `${MONTH_NAMES[d.getMonth()]}, ${d.getFullYear()}`;
}
