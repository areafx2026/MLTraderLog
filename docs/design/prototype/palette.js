// Forex Log — light/dark palette.
// Linen is the primary light mode (warm cream + terracotta); Dusk is the
// dark mode (warm near-black + copper). They share the same role names so
// every component reads from one t.* object and never branches on mode.

(function () {
  const light = {
    name: 'light',

    // surfaces
    bg:    '#f4ede1',  // page
    paper: '#fbf6ec',  // cards / inset surfaces
    raised:'#ffffff',  // popovers, menus

    // ink (text)
    ink:   '#2a2620',
    ink2:  '#6b6358',
    ink3:  '#a39c8e',

    // hairlines
    rule:  'rgba(60,50,30,.10)',
    rule2: 'rgba(60,50,30,.18)',

    // semantic — muted sage / clay, never neon
    win:   '#6b7f5e',
    loss:  '#b5613f',
    accent:'#b5613f',
    accentInk: '#fbf6ec',   // text on accent
    inkInk: '#fbf6ec',      // text on full-ink solid btn

    // chart shading
    chartArea: 'rgba(107,127,94,0.20)',
  };

  const dark = {
    name: 'dark',

    bg:    '#171816',
    paper: '#1e211e',
    raised:'#262a27',

    ink:   '#e9e3d4',
    ink2:  '#9a948a',
    ink3:  '#6c685f',

    rule:  'rgba(255,245,225,.06)',
    rule2: 'rgba(255,245,225,.12)',

    win:   '#9ab891',
    loss:  '#c98363',
    accent:'#c98363',
    accentInk: '#1c1e1c',
    inkInk: '#171816',

    chartArea: 'rgba(154,184,145,0.16)',
  };

  // Fonts shared across both modes — Newsreader's italic + Inter for body
  // give a calm editorial feel that doesn't shout in either palette.
  const fonts = {
    serif: '"Newsreader", "Source Serif Pro", Georgia, serif',
    sans:  '"Inter", system-ui, sans-serif',
    mono:  '"JetBrains Mono", ui-monospace, monospace',
  };

  window.THEMES = { light, dark };
  window.FONTS = fonts;
})();
