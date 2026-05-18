# Handoff — Forex Log (MLTraderLog)

A calm, editorial trade-journaling web app. The brief: clear and unhurried,
not overweighted by numbers and buttons; cozy and reassuring; a quiet space
where the trader's day gets logged honestly rather than gamified.

The product is delivered in **two skins of the same app** — Linen (warm cream
light mode) and Dusk (warm near-black dark mode) — that share the same
layout, typography, and spacing system. The user toggles between them from
the sidebar footer, Settings, or the in-design Tweaks panel.

---

## About the design files

The files in this bundle are **design references created as a working HTML
prototype**. They are not production code to copy directly. The task is to
**recreate these designs in the target codebase's environment** (React,
Vue, SwiftUI, etc.) using its established patterns, component libraries,
and conventions — or, if no environment is set up yet, to pick the most
appropriate stack and implement there.

In particular, the prototype uses:
- React 18 via UMD + Babel standalone (acceptable for a sandboxed
  prototype, **not** acceptable for production).
- Plain inline styles (so colors, typography, and spacing read like a
  living spec — port them to CSS variables, Tailwind tokens, styled-
  components, etc. as appropriate).
- Mock JSON data in `data.js` (replace with real API / broker
  integration).
- LocalStorage for nav + tweak persistence (replace with router + real
  preferences storage).

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, and copy are intended to
be the final design. The prototype was built as a faithful pixel reference;
reproduce it pixel-for-pixel in the target codebase using whatever component
library is already in place, then swap to live data.

Animation/interaction polish (hover transitions, theme-swap fade) is
deliberately minimal — implement equivalents using the codebase's motion
primitives.

---

## Information architecture

```
┌─ Today           Dashboard — equity curve + stats + recent trades
├─ Trades          All trades (list or cards view)
│   ├─ #<id>       Single trade detail
│   └─ New         Add trade form
├─ Insights        Pattern recognition (best pair / best day / watch out)
└─ Settings        Appearance · Account · Journal · Boring bits
```

Trade detail and Add trade are **sub-routes of Trades**, reached by clicking
a trade row (detail) or the "Log a trade" CTA (add). Both have a `← Trades`
back link in the top-left.

---

## Design tokens

### Colors

Two themes share the same role names so every component reads from one
`t.*` object and never branches on mode.

| Role           | Linen (light)            | Dusk (dark)              | Purpose                              |
|----------------|--------------------------|--------------------------|--------------------------------------|
| `bg`           | `#f4ede1`                | `#171816`                | Page background                      |
| `paper`        | `#fbf6ec`                | `#1e211e`                | Cards / inset surfaces               |
| `raised`       | `#ffffff`                | `#262a27`                | Popovers, menus                      |
| `ink`          | `#2a2620`                | `#e9e3d4`                | Primary text                         |
| `ink2`         | `#6b6358`                | `#9a948a`                | Secondary text / italic eyebrow      |
| `ink3`         | `#a39c8e`                | `#6c685f`                | Tertiary text / hint                 |
| `rule`         | `rgba(60,50,30,.10)`     | `rgba(255,245,225,.06)`  | Hairlines                            |
| `rule2`        | `rgba(60,50,30,.18)`     | `rgba(255,245,225,.12)`  | Heavier hairlines / borders          |
| `win`          | `#6b7f5e` (muted sage)   | `#9ab891` (muted sage)   | Positive P&L, equity curve           |
| `loss`         | `#b5613f` (clay)         | `#c98363` (clay/copper)  | Negative P&L                         |
| `accent`       | `#b5613f`                | `#c98363`                | Wordmark dot, active nav, CTA accent |
| `accentInk`    | `#fbf6ec`                | `#1c1e1c`                | Text on accent surface               |
| `inkInk`       | `#fbf6ec`                | `#171816`                | Text on ink-solid button             |
| `chartArea`    | `rgba(107,127,94,0.20)`  | `rgba(154,184,145,0.16)` | Equity-curve area fill               |

**Important**: never use pure green / pure red for wins / losses — the
client specifically asked for a "cozy and calm" environment where
"everything is OK". Muted sage + clay is intentional.

### Typography

```
Display: Newsreader (Google Fonts) — variable, opsz 6..72
         Used for headlines, big numbers, italic eyebrows, P&L values.
         Range: 400 regular, 500 medium, 600 semibold. Italic enabled.

UI body: Inter (Google Fonts) — weights 400/500/600/700
         Used for nav, buttons, table rows, form labels.

Mono:    JetBrains Mono — only as accent for monospace number contexts
         (currently unused in the unified prototype; kept loaded for
         future analytics screens).
```

Type scale (used consistently across screens):

| Token              | Size | Family    | Weight | Letter-spacing |
|--------------------|------|-----------|--------|----------------|
| `display-xl`       | 48   | Newsreader| 400    | -0.8           |
| `display-lg`       | 44   | Newsreader| 400    | -0.8           |
| `display-md`       | 34   | Newsreader| 500    | -0.5           |
| `display-sm`       | 22   | Newsreader| 500    | -0.3           |
| `serif-body`       | 19   | Newsreader| 400    | 0              |
| `serif-row`        | 18   | Newsreader| 500    | 0              |
| `serif-italic-eyebrow` | 14 | Newsreader italic | 400 | 0          |
| `sans-body`        | 14   | Inter     | 400    | 0              |
| `sans-sm`          | 13   | Inter     | 400    | 0              |
| `caption`          | 12   | Inter / Newsreader italic | 400 | 0.2 |

Line-height is `1.05` for display headlines, `1.6` for reading paragraphs,
`1.2` for table rows.

### Spacing

The page layout uses a **72px horizontal padding** for the main content
area and a **208px sidebar** with **28px internal padding**. Vertical
section spacing is generous — 40–56px between major blocks.

| Token | px  | Use                                       |
|-------|-----|-------------------------------------------|
| `2`   | 2   | Inset toggle / segmented-control padding  |
| `6`   | 6   | Sidebar nav left-padding                  |
| `12`  | 12  | Inline gap inside buttons                 |
| `18`  | 18  | Card grid gap                             |
| `24`  | 24  | Standard content gap                      |
| `28`  | 28  | Section top padding                       |
| `36`  | 36  | Add-trade form column gap                 |
| `40`  | 40  | Below-header gap                          |
| `48`  | 48  | Stat-row gap, sidebar-content gap         |
| `56`  | 56  | Section gap                               |
| `64`  | 64  | Add-trade form column gap (wide)          |
| `72`  | 72  | Page horizontal padding                   |

### Radii

| Token | px  | Use                                       |
|-------|-----|-------------------------------------------|
| `0`   | 0   | (rarely used)                             |
| `4`   | 4   | Cards on Trades (cards view), inset chart |
| `8`   | 8   | (reserved for inputs in production)       |
| `999` | full| Pills, buttons, segmented controls, mode toggle |

### Borders

All borders are 1px and use `rule` (subtle) or `rule2` (heavier).
Section separators on the dashboard use `rule2`; table row separators use
`rule`.

### Shadows

Almost none. The design is deliberately flat. The only soft shadow is on
the toggle dot inside `<Toggle>`: `0 1px 2px rgba(0,0,0,.15)`.

---

## Screens

### 1. Today (Dashboard)

**Purpose**: a quiet, end-of-day glance at how the week / month went.

**Layout**:
- Sidebar (208px) + main content (`flex: 1`, 72px horizontal padding).
- Main content is a vertical flow: Header → Equity section → 4-column
  stat row → Recent trades.

**Header**:
- Eyebrow (italic Newsreader 14, ink2): `"Sunday, the seventeenth of May"`
- Title (Newsreader 44 / weight 400, letter-spacing -0.8): `"A steady week."`
- Italic tail (next line, italic Newsreader, ink2): `"Four greens, one scratch."`
- Right action: pill button `"Log a trade"` (ink background, inkInk text).

**Equity section**:
- Eyebrow row (italic Newsreader): `"Equity, last thirty days"` (left)
  and range toggles (right): `30 d`, `3 mo`, `1 yr`, `All`. Active range
  is bold ink with a 1px underline; others are ink3.
- SVG area chart of last 30 days of account equity. Curve stroke is `win`
  color, area fill is a `chartArea` gradient. Three faint dashed
  horizontal guide lines at 25 / 50 / 75% of chart height. A 4-radius
  dot at the rightmost point in `win` color.
- Absolutely positioned over the top-right: balance figure
  (`display-md`, 36px Newsreader) and `+$2,115 · this month` (12px
  win-colored, weight 500).

**Stats row**:
- 4 equal-width columns separated by 48px gap.
- Top + bottom border in `rule2` (top) and `rule` (bottom).
- Each `Stat`: italic eyebrow → big serif number (34px / 500) → ink3 12px subline.
- Content (left to right): `Win rate / 70% / of 10 trades`,
  `Avg R:R / 1.6 / against 1.5 plan`,
  `Win streak / 4 / and counting`,
  `Drawdown / –1.8% / within plan`.

**Recent**:
- Italic eyebrow `"Recent"` (left) and `"See all →"` link (right, accent
  color).
- Four most recent trade rows, each a 5-column grid:
  `64px (date) · 100px (pair, serif 18/500) · 1fr (italic tag) · 80px
  right-aligned (pips) · 100px right-aligned (P&L)`.
- 14px vertical padding, 1px `rule` bottom border.
- Each row is a `<button>` — clicking navigates to that trade's detail.

### 2. Trades

**Purpose**: the canonical list / card view of every trade. Filterable
view; default to list.

**Header**:
- Title (44px Newsreader): `"Trades"`.
- Right cluster:
  - Italic Newsreader subtitle: `"May 2026 · 10 trades · +$2,115"`
  - Segmented toggle (pill, 1px border, 2px inset padding):
    `[List | Cards]`. Active segment has an ink background and inkInk text.
  - `"Log a trade"` PrimaryButton.

**List view**:
- 7-column grid per row:
  `64 (#id, italic ink3) · 92 (date) · 110 (pair, serif 18/500) ·
  70 (italic side, win/loss colored) · 1fr (italic tag) ·
  80 right (pips, ink3) · 100 right (P&L, serif size-md, sage/clay)`.
- 18px vertical padding per row.
- Hover: row background fades to `paper` (cream in light, near-black-card
  in dark).
- Click any row → trade detail.

**Cards view**:
- 3-column grid, 18px gap, `paper`-colored cards with 1px `rule` border
  and 4px radius.
- Per card:
  - Top row: pair (serif 22) on the left, P&L (serif 20, win/loss) on
    the right.
  - Italic tag (Newsreader 14, ink2).
  - Footer: 1px top rule, date + side on left, pips + R-multiple on
    right (12px, ink3).
- Hover lifts card 1px and switches border to `rule2`.

### 3. Trade detail

**Purpose**: a single trade's full story — the numbers and the reflection.

**Top**:
- `← Trades` back link (13px sans, ink3).
- Header row, two columns:
  - Left: italic eyebrow `"Trade #0247 · 05-17, 09:42"`, then big serif
    title `"EUR/USD long"` with `long` in italic ink2.
  - Right (right-aligned): P&L (serif 44, weight 500, sage), then small
    detail line `"+59 pips · 2.3R · 1.5 lots"` (13px ink2).
- Header separator: 1px `rule2` border-bottom, 22px below.

**Body**: 2-column grid (`1fr 280px`), 48px gap.

Left column:
- Inset chart card (`paper` bg, 1px `rule` border, 4px radius, 24px
  padding): SVG line chart of price movement. Dashed vertical guides
  at entry and exit timestamps, labels above the chart in italic
  Newsreader 11. Area fill in `win`-tinted gradient.
- Reflection: italic eyebrow `"Reflection"`, then 19px Newsreader body
  paragraph (`max-width: 60ch`, ink color, line-height 1.6), then a
  follow-up italic paragraph in ink2 for a `"Note for next week"`-style
  callout.

Right column (`<aside>`):
- Vertical stack of definition rows, 22px gap. Each row:
  - Italic Newsreader key (ink2) on left, serif 500 value (ink) on right.
  - 1px `rule` bottom border, 10px bottom padding.
  - Both spans use `white-space: nowrap` and the value is right-aligned.
- Rows (in order): Setup, Direction, Entry, Exit, Stop, Risk, R-multiple, Mood.

### 4. Add trade

**Purpose**: log a fresh trade. Feels like sitting down with a notebook
rather than filling out a form — labels are small italic eyebrows, values
are big serif 26 inputs with `border: none; background: transparent;`.

**Layout**:
- `← Trades` back link.
- Big title `"A new trade."` (display-lg 44).
- Italic Newsreader subtitle `"Tell me about it."`
- 2-column form grid, 28px row-gap, 64px column-gap, `max-width: 820px`:
  - Pair / Direction
  - Entry / Exit (with sub `"or leave blank if still open"`)
  - Stop (sub `"22 pips of risk"`) / Size (sub `"lots · 0.8% of account"`)
  - Setup / Mood
- Each field:
  - Italic eyebrow (Newsreader 12, ink2, letter-spacing 0.2)
  - 1px `rule2` bottom border, 14px padding-bottom
  - Input: transparent, no border, Newsreader 26, ink when filled / ink3
    italic when empty (placeholder rendered as actual `placeholder` attr
    + dynamic style).
  - Optional sub (11px ink3).
- Below: a "A few notes" italic eyebrow → 4-row `<textarea>` styled the
  same way (Newsreader 19, line-height 1.6).
- Footer: PrimaryButton `"Save trade"`, ghost link `"Save draft"`, and a
  small italic kbd hint `"⌘↵ to save"` aligned right.

### 5. Insights

**Purpose**: pattern recognition surfaced quietly. Three highlight cards
+ a fuller equity chart. Single-pass, no interactive filters.

**Layout**:
- Header: italic eyebrow `"May, 2026"`, title `"Patterns,"` + italic tail
  `"quietly noticed."`
- 3-column highlight row (32px gap). Each highlight:
  - 1px `rule2` top border, 16px top padding.
  - Italic Newsreader eyebrow (label).
  - Big serif 30/500 value (`"EUR/USD"`, `"Tuesdays"`, `"Pre-CPI"`).
  - Italic Newsreader 14 subline, colored `win` for positive observations
    and `loss` for warnings.
- 56px gap, then italic `"Equity, full"` eyebrow → larger (height 260)
  equity chart.

### 6. Settings

**Purpose**: appearance, account preferences, journal nudges, and
account housekeeping. No live functionality is wired beyond the
appearance row.

**Layout**:
- Header: title `"Settings"` (no eyebrow / tail).
- Body `max-width: 720px`.
- Italic Newsreader section headers (14, ink2): `Appearance`, `Account`,
  `Journal`, `The boring bits`.
- Each row: flex with 24px gap, 20px vertical padding, 1px `rule`
  bottom border. Label is serif 18 / ink, sub is italic Newsreader 13
  ink2.
- Controls per row:
  - **Theme**: segmented `[Linen | Dusk]` — bound to the theme mode.
  - **Default trade view**: segmented `[List | Cards]` — bound to the
    Trades view default.
  - **Display currency**: ghost button `"Change"` (stub).
  - **Risk per trade**: ghost button `"Adjust"` (stub).
  - **Evening prompt**: pill toggle, default on.
  - **Weekly review**: pill toggle, default on.
  - **Export trades**: ghost `"Export"` (stub).
  - **Sign out**: ghost `"Sign out"` (stub).

### Sidebar (every screen)

- 208px wide, `bg`-colored, right-bordered with `rule`.
- 36px top padding, 28px horizontal, 28px bottom.
- Top: wordmark `"Ledger."` in italic Newsreader 24 / 500, period in
  `accent` color.
- 32px gap, then primary nav buttons (Today, Trades, Insights, Settings):
  - Active item: full `ink` color, weight 600, 2px `accent`-colored
    left border (negative margin to bleed into sidebar edge).
  - Inactive: `ink2`, weight 400. Hover → `ink`.
  - **Trades is the active item** for any of: `trades`, `detail`, `add`.
- Footer (margin-top: auto): italic streak line (`"Sunday, 17 May. You've
  journaled four weeks in a row."`), then a sun ↔ moon mode toggle pill.
  Toggle pill is 1px `rule2` border + 3px inset; active mode segment has
  ink background and inkInk-colored icon.

---

## Interactions & behavior

- **Navigation**: client-side state, no URL routing (production should
  use a real router — Next.js App Router, React Router, etc., with paths
  `/today`, `/trades`, `/trades/:id`, `/trades/new`, `/insights`,
  `/settings`).
- **Trade-row click** → trade detail. **"Log a trade" / "+ New trade"
  button** → add trade. **Back link** on detail/add → returns to Trades.
- **Hover states**:
  - List rows: background fades to `paper` (150ms).
  - Card rows: `transform: translateY(-1px)` + border deepens to `rule2`.
  - PrimaryButton: opacity 0.9.
- **List ↔ cards toggle** in Trades is persisted in the theme tweaks
  object and also defaults from Settings → "Default trade view".
- **Theme toggle**: three controls share one piece of state — sidebar
  sun/moon, Settings → Theme, and the Tweaks panel. Toggling any one
  updates all three.
- **State persistence**: nav screen + active trade id persist in
  `localStorage` (key `fxlog:nav`). Theme + view persist via the Tweaks
  scaffold (key `__edit_mode_*`). Production should persist these in
  the user's account preferences instead.
- **Form behavior on Add trade**: the form is currently a controlled
  React state object; "Save trade" and "Save draft" just navigate back.
  Production should POST to the trade API, then optimistically prepend
  the new trade to the list.

---

## State shape

The app's runtime state is intentionally tiny:

```ts
type Mode = 'light' | 'dark';
type TradeView = 'list' | 'cards';
type Screen = 'today' | 'trades' | 'detail' | 'add' | 'insights' | 'settings';

interface AppState {
  mode: Mode;            // theme mode
  view: TradeView;       // trades view default
  screen: Screen;        // current screen
  tradeId: string | null;// active trade when screen === 'detail'
}
```

The data model for a single trade:

```ts
interface Trade {
  id: string;          // '0247'
  date: string;        // 'YYYY-MM-DD'
  time: string;        // 'HH:MM'
  pair: string;        // 'EUR/USD'
  side: 'long' | 'short';
  entry: number;       // 1.0842
  exit: number;        // 1.0901 (or === entry for scratched / open)
  size: number;        // 1.50 lots
  pl: number;          // USD, integer
  pips: number;        // can be negative
  rr: number;          // R-multiple (0 for losses/scratches)
  tag: string;         // 'London breakout'
  mood: 'calm' | 'focused' | 'rushed' | 'distracted' | 'patient';
  note: string;        // free-form reflection
}
```

---

## Files in this bundle

| File                                        | What it is                              |
|---------------------------------------------|-----------------------------------------|
| `Forex Log.html`                            | Prototype entry point                   |
| `data.js`                                   | Mock trades, equity series, SVG helpers |
| `prototype/palette.js`                      | Both themes + shared font tokens        |
| `prototype/components.jsx`                  | Sidebar, Header, buttons, chart, stats  |
| `prototype/screens-overview.jsx`            | Today + Trades                          |
| `prototype/screens-detail.jsx`              | Trade detail + Add trade + Settings     |
| `prototype/app.jsx`                         | Routing + state + tweaks wiring         |
| `directions/`                               | Original four-direction exploration     |
|                                             | (Linen, Drift, Folio, Dusk) — kept for  |
|                                             | reference / future exploration          |
| `index.html`                                | The four-direction design canvas        |

The `tweaks-panel.jsx` and `design-canvas.jsx` files are prototype
scaffolding (in-design tweak controls + a pan/zoom presentation canvas).
They should **not** be ported into production.

---

## Assets

No bitmap or vector assets are used. All iconography is inline SVG drawn
in the components themselves (sun/moon, toggle dot, sidebar icons in the
discarded Dusk-direction file). The wordmark `"Ledger."` is set in
Newsreader italic — no logo file needed.

Fonts are loaded from Google Fonts at the top of `Forex Log.html`:

```
Newsreader (ital, opsz 6..72, wght 400/500/600)
Inter      (wght 400/500/600/700)
JetBrains Mono (wght 400/500)  ← loaded but currently unused
```

When porting, use the codebase's preferred font-loading strategy
(`next/font`, self-hosted woff2, etc.).

---

## Open questions for the developer / PM

1. **Broker integration** — which broker(s) feed trades? MT4/MT5 export,
   manual entry, or both?
2. **Open trades** — the design currently shows closed trades only.
   How should an in-progress trade render in the list? (Suggested: italic
   "—" in P&L column, live pips updating, distinct row treatment.)
3. **Currency** — Settings → "Display currency" is a stub. Multi-currency
   accounts, FX conversion?
4. **Journal nudges** — Settings → "Evening prompt" + "Weekly review"
   are toggles. Where do these notifications surface (in-app, email,
   push)?
5. **Mobile** — this prototype is desktop-first (sidebar nav at 208px,
   72px horizontal padding). A mobile layout will need design work; ask
   before extrapolating.
