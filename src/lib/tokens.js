// ─────────────────────────────────────────────────────────────
// tokens.js — Life Athletics design system · "the radiant instrument"
//
// A precision training instrument that makes a person radiant. Warm
// aluminium ground (Teenage Engineering), an editorial serif for the
// human moments, a grotesque for the interface, a monospace for every
// number. Colour is never decoration — each hue carries one job:
//
//   graphite  → NOW. where you are. the measured present.
//   brass     → HEADED. the target you're reaching for.
//   sky       → RADIANCE. the centre lights as you climb.
//   sun       → THE WIN. a rare flash when a session lands.
//   cobalt    → the one deep screen (the session readout).
//   the metals (brass → copper → verdigris) → TENURE. a protocol's
//             marker patinas the longer you hold it: the green of
//             showing up. Tenure is derived from the log, never stored.
//
// Type: Fraunces (the human) · Archivo (the interface) · IBM Plex Mono
// (the instrument). One family per role; weight does the rest.
//
// The export surface is kept stable (tokens, display, sans, serif, mono,
// eyebrow, STANDING, hexGlow, ASSETS, FONT_HREF) so every screen re-skins
// without a rewire. Legacy keys (blue, gold, cyan…) are mapped onto the
// new palette so nothing renders broken.
// ─────────────────────────────────────────────────────────────

export const tokens = {
  // ground — warm aluminium / bone, with a near-white card that lifts
  bg:      '#E6E1D6',
  bg2:     '#DDD7CA',
  panel:   '#FCFBF8',
  panel2:  '#F4F1EA',

  // hairlines on the warm ground
  line:       'rgba(24,19,12,0.12)',
  lineSoft:   'rgba(24,19,12,0.06)',
  lineStrong: 'rgba(24,19,12,0.18)',

  // ink — warm near-black + readable greys (real contrast)
  ink:   '#16110A',
  ink2:  '#433C30',
  ink3:  '#6A6153',

  // NOW — graphite
  graphite: '#211C14',

  // RADIANCE / live — electric sky (legacy `blue`/`cyan` map here)
  blue:    '#1E84E0',
  sky:     '#1E84E0',
  skyInk:  '#1763AE',
  skySoft: 'rgba(30,132,224,0.14)',
  cyan:    '#1E84E0',

  // the deep screen
  cobalt:  '#243F9C',

  // HEADED / the metals (legacy `gold` maps to brass)
  gold:        '#B07D17',
  brass:       '#B07D17',
  brassInk:    '#7E5A0E',
  goldHi:      '#D89E1C',
  brassSoft:   'rgba(176,125,23,0.16)',
  copper:      '#B0673A',
  copperInk:   '#8A4A24',
  verdigris:   '#3F9E86',
  verdigrisInk:'#2C7058',
  verdigrisSoft:'rgba(63,158,134,0.16)',

  // THE WIN — tile sun gold, rare flash only
  sun: '#F4A613',

  // card lift + accent glow
  shadow:   '0 2px 4px rgba(24,19,12,0.06), 0 30px 50px -32px rgba(24,19,12,0.6)',
  glowBlue: 'rgba(30,132,224,0.18)',
  glow:     'rgba(30,132,224,0.10)',

  // legacy aliases
  bgLift: '#FCFBF8',
  strong: '#3F9E86',
}

// The curated protocol-colour set. A protocol carries one of these so it
// can be spotted instantly when placed across a week. Harmonious by
// design — any combination on a grid still reads as one instrument.
// (Used as the medallion CORE; the tenure metal rides as the ring.)
export const PROTOCOL_COLORS = [
  { key: 'sky',       hex: '#1E84E0', label: 'Sky' },
  { key: 'cobalt',    hex: '#3A5BD0', label: 'Cobalt' },
  { key: 'teal',      hex: '#2BA39A', label: 'Teal' },
  { key: 'verdigris', hex: '#3F9E86', label: 'Verdigris' },
  { key: 'brass',     hex: '#B07D17', label: 'Brass' },
  { key: 'sun',       hex: '#E8920E', label: 'Sun' },
  { key: 'clay',      hex: '#C2603F', label: 'Clay' },
  { key: 'plum',      hex: '#8A5AA8', label: 'Plum' },
]
export const protocolColor = key =>
  (PROTOCOL_COLORS.find(c => c.key === key) || PROTOCOL_COLORS[0]).hex

// Tenure → the patina metal. Derived from how long a protocol's been held.
// (days held: <21 new · <≈180 held · else a season)
export const TENURE = {
  new:    { key: 'new',    color: tokens.brass,     label: 'new' },
  held:   { key: 'held',   color: tokens.copper,    label: 'held' },
  season: { key: 'season', color: tokens.verdigris, label: 'a season' },
}
export function tenureOf(daysHeld = 0) {
  if (daysHeld >= 180) return TENURE.season
  if (daysHeld >= 21)  return TENURE.held
  return TENURE.new
}

// Retained for back-compat; standing is now a 0–10 self-read (see scoring.js).
export const STANDING = {
  off:      '#B0673A',
  building: '#B07D17',
  solid:    '#1E84E0',
  strong:   '#3F9E86',
}

// ── Type spreads ───────────────────────────────────────────────
// serif = the human · sans = the interface · mono = the instrument.
export const serif   = { fontFamily: "'Fraunces', Georgia, serif" }
export const display = { fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, letterSpacing: '-0.015em' }
export const sans    = { fontFamily: "'Archivo', system-ui, sans-serif" }
export const mono    = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontVariantNumeric: 'tabular-nums' }

export const eyebrow = {
  fontFamily: "'Archivo', system-ui, sans-serif",
  fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
}

export function hexGlow(hex, alpha = 0.16) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}

export const ASSETS = {
  mark:      '/mark_black.png',
  markWhite: '/mark_white.png',
}

export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
