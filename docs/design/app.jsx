// Forex Log — design canvas wiring up four directions side-by-side.
// Each direction shows four screens: Dashboard, Trade log, Trade detail,
// Add trade. A small Tweaks panel toggles the Trade log between list and
// cards across all four directions at once, for honest comparison.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "view": "list"
}/*EDITMODE-END*/;

const SCREENS = [
  { id: 'dashboard', label: 'Dashboard',   key: 'Dashboard'   },
  { id: 'log',       label: 'Trade log',   key: 'TradeLog'    },
  { id: 'detail',    label: 'Trade detail',key: 'TradeDetail' },
  { id: 'add',       label: 'Add trade',   key: 'AddTrade'    },
];

const DIRECTIONS = [
  { id: 'linen', title: '01 · Linen',
    subtitle: 'Warm cream + terracotta. Editorial serif, generous breathing room — a notebook you keep at the kitchen table.',
    ns: 'Linen' },
  { id: 'sage',  title: '02 · Drift',
    subtitle: 'Soft sage + clay. Modern geometric sans, Things-3 density — quiet, precise, keyboard-first.',
    ns: 'Sage' },
  { id: 'paper', title: '03 · Folio',
    subtitle: 'Warm paper, faintly ruled. Serif display, ledger columns, monospace numbers — the trading day as a hand-kept journal.',
    ns: 'Paper' },
  { id: 'dusk',  title: '04 · Dusk',
    subtitle: 'Warm dark sanctuary. Light-weight display serif over almost-black — a room you visit in the evening, not a terminal.',
    ns: 'Dusk' },
];

const W = 1280, H = 800;

function ArtboardScreen({ ns, screen, view }) {
  const root = window[ns];
  if (!root) return <div style={{ padding: 40, color: '#999', fontFamily: 'system-ui' }}>Loading {ns}…</div>;
  const C = root[screen.key];
  if (!C) return <div style={{ padding: 40, color: '#999' }}>{ns}.{screen.key} missing</div>;
  // Only TradeLog cares about view; others ignore it.
  return <C view={view} />;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <DesignCanvas minScale={0.08} maxScale={3}>
        {DIRECTIONS.map((d) => (
          <DCSection key={d.id} id={d.id} title={d.title} subtitle={d.subtitle}>
            {SCREENS.map((s) => (
              <DCArtboard key={s.id} id={`${d.id}-${s.id}`} label={s.label} width={W} height={H}>
                <ArtboardScreen ns={d.ns} screen={s} view={t.view} />
              </DCArtboard>
            ))}
          </DCSection>
        ))}
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Trade log" />
        <TweakRadio label="View"
          value={t.view}
          options={['list', 'cards']}
          onChange={(v) => setTweak('view', v)} />
        <div style={{ fontSize: 11, color: 'rgba(40,30,20,.55)',
          lineHeight: 1.5, padding: '6px 2px 0' }}>
          Toggles the trade-log artboard in every direction at once, so you can
          compare like-for-like.
        </div>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
