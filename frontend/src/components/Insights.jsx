import { usd, computeInsights, formatMonthYear } from '../chartUtils.js';
import EquityChart from './EquityChart.jsx';

export default function Insights({ t, trades, equity }) {
  const { bestPair, bestDay, watchOut } = computeInsights(trades);
  const monthStr = formatMonthYear();

  const highlights = [
    bestPair ? {
      label: 'Best pair',
      big: bestPair[0],
      sub: `+$${usd(bestPair[1].pl)} across ${bestPair[1].count} trade${bestPair[1].count !== 1 ? 's' : ''}`,
      tone: 'win',
    } : {
      label: 'Best pair',
      big: '—',
      sub: 'no data yet',
      tone: 'neutral',
    },
    bestDay ? {
      label: 'Best day',
      big: bestDay[0],
      sub: `+$${usd(bestDay[1].pl)} across ${bestDay[1].count} trade${bestDay[1].count !== 1 ? 's' : ''}`,
      tone: 'win',
    } : {
      label: 'Best day',
      big: '—',
      sub: 'no data yet',
      tone: 'neutral',
    },
    watchOut ? {
      label: 'Watch out',
      big: watchOut[0],
      sub: `${watchOut[1].losses} of ${watchOut[1].count} came out red`,
      tone: 'loss',
    } : {
      label: 'Watch out',
      big: '—',
      sub: 'no patterns yet',
      tone: 'neutral',
    },
  ];

  return (
    <div style={{ flex: 1, padding: '56px 72px 40px', overflow: 'auto', minWidth: 0 }}>
      <header style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: t.seriftyle: 'italic'ize: 14,
          color: t.ink2, marginBottom: 8,
        }}>{monthStr}</div>
        <h1 style={{
          fontFamily: t.serif, fontWeight: 400ize: 44, margin: 0,
          letterSpacing: -0.8, lineHeight: 1.05, color: t.ink,
        }}>
          Patterns,
          <br />
          <span style={{ fontStyle: 'italic', color: t.ink2 }}>quietly noticed.</span>
        </h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
        {highlights.map((it) => (
          <div key={it.label} style={t.isGlass ? {
            background: t.pane,
            border: `1px solid ${t.rule}`,
            borderRadius: 14,
            padding: '20px 24px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          } : {
            borderTop: `1px solid ${t.rule2}`,
            paddingTop: 16,
          }}>
            <div style={{
              fontFamily: t.seriftyle: 'italic'ize: 13,
              color: t.ink2, marginBottom: 10,
            }}>{it.label}</div>
            <div style={{
              fontFamily: t.isGlass ? t.mono : t.serif,
              fontSize: 30, fontWeight: t.isGlass ? 600 : 500,
              letterSpacing: t.isGlass ? -0.8 : -0.4, lineHeight: 1.1, color: t.ink,
            }}>{it.big}</div>
            <div style={{
              marginTop: 8, fontFamily: t.seriftyle: 'italic',
              fontSize: 14,
              color: it.tone === 'win' ? t.win : it.tone === 'loss' ? t.loss : t.ink3,
            }}>{it.sub}</div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 56 }}>
        <div style={{
          fontFamily: t.serifize: 16tyle: 'italic',
          color: t.ink2, marginBottom: 12,
        }}>Equity curve</div>
        <EquityChart t={t} points={equity} height={260} />
      </section>

      {trades.length === 0 && (
        <div style={{
          marginTop: 48, fontFamily: t.seriftyle: 'italic',
          fontSize: 18, color: t.ink3, textAlign: 'center',
        }}>
          Log some trades and patterns will appear here.
        </div>
      )}
    </div>
  );
}
