// Shared mock data for the forex trading log. Exposed on window.FX so each
// direction script can read the same trades.

(function () {
  const trades = [
    { id: '0247', date: '2026-05-17', time: '09:42', pair: 'EUR/USD', side: 'long',  entry: 1.0842, exit: 1.0901, size: 1.50, pl:  442, pips:  59, rr: 2.3, tag: 'London breakout', mood: 'calm',     note: 'Patient entry after the retest. Held through the 9:55 wick.' },
    { id: '0246', date: '2026-05-16', time: '14:18', pair: 'GBP/USD', side: 'short', entry: 1.2611, exit: 1.2580, size: 1.00, pl:  248, pips:  31, rr: 1.5, tag: 'Range fade',      mood: 'calm',     note: 'Faded the upper band, target sat at session mid.' },
    { id: '0245', date: '2026-05-16', time: '10:03', pair: 'USD/JPY', side: 'long',  entry: 156.21, exit: 155.94, size: 1.00, pl: -262, pips: -27, rr: 0.0, tag: 'CPI fade',         mood: 'rushed',   note: 'Jumped in pre-print. Sized too aggressive. Walked away.' },
    { id: '0244', date: '2026-05-15', time: '11:27', pair: 'AUD/USD', side: 'long',  entry: 0.6612, exit: 0.6648, size: 0.80, pl:  244, pips:  36, rr: 1.8, tag: 'Asia continuation',mood: 'focused',  note: 'Held with the trend. Trailed to 1R, then runner.' },
    { id: '0243', date: '2026-05-14', time: '15:50', pair: 'EUR/USD', side: 'short', entry: 1.0867, exit: 1.0845, size: 1.20, pl:  225, pips:  22, rr: 1.1, tag: 'NY reversal',      mood: 'calm',     note: 'Mean-revert play. Took the first target.' },
    { id: '0242', date: '2026-05-14', time: '09:18', pair: 'USD/CAD', side: 'short', entry: 1.3702, exit: 1.3733, size: 0.50, pl: -156, pips: -31, rr: 0.0, tag: 'False break',      mood: 'distracted', note: 'Got chopped at the highs. Should have waited for confirm.' },
    { id: '0241', date: '2026-05-13', time: '13:12', pair: 'EUR/GBP', side: 'long',  entry: 0.8584, exit: 0.8612, size: 1.00, pl:  284, pips:  28, rr: 1.6, tag: 'Trend pullback',   mood: 'focused',  note: 'Clean structural entry on the H1. Held to target.' },
    { id: '0240', date: '2026-05-12', time: '10:44', pair: 'USD/JPY', side: 'long',  entry: 155.72, exit: 156.10, size: 1.00, pl:  368, pips:  38, rr: 2.0, tag: 'BOJ drift',        mood: 'calm',     note: 'Slow grind higher. Sat with it.' },
    { id: '0239', date: '2026-05-11', time: '11:02', pair: 'GBP/USD', side: 'long',  entry: 1.2548, exit: 1.2548, size: 0.80, pl:    0, pips:   0, rr: 0.0, tag: 'Scratch',          mood: 'patient', note: 'Stopped at BE, no harm, no foul.' },
    { id: '0238', date: '2026-05-10', time: '14:30', pair: 'EUR/USD', side: 'long',  entry: 1.0789, exit: 1.0824, size: 1.50, pl:  428, pips:  35, rr: 1.7, tag: 'Pivot bounce',     mood: 'calm',     note: 'Pivot held, took clean 1.7R off the daily.' },
  ];

  // 30 days of equity, in pennies of return, ending today
  const equity = (() => {
    const seed = [0, 0.4, 1.1, 0.8, 1.5, 2.2, 1.9, 2.8, 3.4, 3.1, 3.9, 4.6, 4.2, 5.1, 5.8, 5.4, 6.2, 6.0, 6.9, 7.5, 7.2, 8.1, 7.6, 8.4, 9.2, 8.9, 9.7, 10.4, 10.1, 10.8];
    return seed.map((v, i) => ({ d: i, v: 10000 + v * 220 }));
  })();

  const summary = {
    monthPL: 2_115,
    monthPips: 251,
    winRate: 0.70,
    avgRR: 1.6,
    streak: 4,
    trades: trades.length,
    balance: 12_115,
    drawdown: -1.8,
  };

  // Tiny SVG path helpers for sparklines & equity curves.
  function pathFor(points, w, h, pad = 4) {
    if (!points.length) return '';
    const xs = points.map(p => p.d), ys = points.map(p => p.v);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = Math.min(...ys), ymax = Math.max(...ys);
    const dx = xmax - xmin || 1, dy = (ymax - ymin) || 1;
    const sx = (x) => pad + (w - pad * 2) * (x - xmin) / dx;
    const sy = (y) => h - pad - (h - pad * 2) * (y - ymin) / dy;
    return points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.d).toFixed(1)},${sy(p.v).toFixed(1)}`).join(' ');
  }
  function areaFor(points, w, h, pad = 4) {
    const line = pathFor(points, w, h, pad);
    if (!line) return '';
    return `${line} L${w - pad},${h - pad} L${pad},${h - pad} Z`;
  }

  // Always format money the same way regardless of browser locale —
  // `(12115).toLocaleString()` switches `,` to `.` on German/EU locales,
  // which would otherwise read as $12.115 (twelve point one one five).
  const usd = (n) => n.toLocaleString('en-US');

  window.FX = { trades, equity, summary, pathFor, areaFor, usd };
})();
