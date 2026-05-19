// Forex Log — app shell. Owns nav state, theme mode, and the trade-log view.
// Tweaks panel exposes mode + view as in-design controls; sidebar also has a
// real sun↔moon toggle so the mode switch lives in the product itself.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "light",
  "view": "list"
}/*EDITMODE-END*/;

const NAV_KEY = 'fxlog:nav';

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // Local nav state — screen + active trade id. Persisted to localStorage so
  // a refresh during iteration lands the user back where they were.
  const [nav, setNav] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(NAV_KEY)) || { screen: 'today', tradeId: null }; }
    catch { return { screen: 'today', tradeId: null }; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(NAV_KEY, JSON.stringify(nav)); } catch {}
  }, [nav]);

  const theme = THEMES[t.mode] || THEMES.light;

  const navigate = (screen, tradeId = null) => setNav({ screen, tradeId });

  // Body bg/color follow the theme so the app fills the viewport cleanly.
  React.useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.ink;
  }, [theme]);

  let main;
  switch (nav.screen) {
    case 'today':    main = <TodayScreen   t={theme} onNavigate={navigate} onAddTrade={() => navigate('add')} />; break;
    case 'trades':   main = <TradesScreen  t={theme} view={t.view} onChangeView={(v) => setTweak('view', v)}
                                            onNavigate={navigate} onAddTrade={() => navigate('add')} />; break;
    case 'detail':   main = <TradeDetailScreen t={theme} tradeId={nav.tradeId} onBack={() => navigate('trades')} />; break;
    case 'add':      main = <AddTradeScreen     t={theme} onCancel={() => navigate('trades')} onSave={() => navigate('trades')} />; break;
    case 'insights': main = <InsightsScreen    t={theme} />; break;
    case 'settings': main = <SettingsScreen    t={theme}
                                                mode={t.mode} onToggleMode={(m) => setTweak('mode', m)}
                                                view={t.view} onChangeView={(v) => setTweak('view', v)} />; break;
    default:         main = <TodayScreen t={theme} onNavigate={navigate} onAddTrade={() => navigate('add')} />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex',
      background: theme.bg, color: theme.ink, fontFamily: FONTS.sans, fontSize: 14,
      overflow: 'hidden' }}>
      <Sidebar t={theme}
        screen={nav.screen}
        onNavigate={(id) => navigate(id)}
        mode={t.mode}
        onToggleMode={() => setTweak('mode', t.mode === 'light' ? 'dark' : 'light')} />
      {main}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio label="Mode"
          value={t.mode}
          options={['light', 'dark']}
          onChange={(v) => setTweak('mode', v)} />
        <TweakSection label="Trade log" />
        <TweakRadio label="Default view"
          value={t.view}
          options={['list', 'cards']}
          onChange={(v) => setTweak('view', v)} />
        <div style={{ fontSize: 11, color: 'rgba(40,30,20,.55)',
          lineHeight: 1.5, padding: '6px 2px 0' }}>
          Mode + view live in the product too — sidebar footer for theme, top of
          Trades for view. The panel mirrors them.
        </div>
      </TweaksPanel>
    </div>
  );
}

// ────────────────────────── Insights (small placeholder) ──────────────────────────
// User asked for 4 screens; insights gets a quiet single page so the nav doesn't
// have a dead link, but isn't a focus of this round.
function InsightsScreen({ t }) {
  const { summary, equity, pathFor, areaFor } = window.FX;
  return (
    <div style={{ flex: 1, padding: '56px 72px 40px', overflow: 'auto', minWidth: 0 }}>
      <Header t={t}
        eyebrow="May, 2026"
        title="Patterns,"
        italicTail="quietly noticed." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
        {[
          { label: 'Best pair',  big: 'EUR/USD',  sub: '+$1,095 across 4 trades', tone: 'win' },
          { label: 'Best day',   big: 'Tuesdays', sub: '+$868 over the month',     tone: 'win' },
          { label: 'Watch out',  big: 'Pre-CPI',  sub: 'two of three losses came pre-print', tone: 'loss' },
        ].map((it) => (
          <div key={it.label} style={{ borderTop: `1px solid ${t.rule2}`, paddingTop: 16 }}>
            <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 13,
              color: t.ink2, marginBottom: 10 }}>{it.label}</div>
            <div style={{ fontFamily: FONTS.serif, fontSize: 30, fontWeight: 500,
              letterSpacing: -0.4, lineHeight: 1.1, color: t.ink }}>
              {it.big}
            </div>
            <div style={{ marginTop: 8, fontFamily: FONTS.serif, fontStyle: 'italic',
              fontSize: 14, color: it.tone === 'win' ? t.win : t.loss }}>
              {it.sub}
            </div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 56 }}>
        <div style={{ fontFamily: FONTS.serif, fontSize: 16, fontStyle: 'italic',
          color: t.ink2, marginBottom: 12 }}>
          Equity, full
        </div>
        <EquityChart t={t} height={260} />
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
