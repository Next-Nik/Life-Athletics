// ─────────────────────────────────────────────────────────────
// tokens.js — the Life Athletics design system
//
// The inverse of NextUs. Where NextUs is a light, near-paper ground
// with a single gold, Life Athletics is a dark instrument: near-black
// field, cyan as the "now" accent, gold for the target / the win, the
// four grade colors for standing. Lifted verbatim from the locked
// prototypes (scouting-report-v3, money-moves-engine, train, reframe)
// so the build and the prototypes can never drift.
//
// Two accents, two jobs — keep them separate:
//   cyan  → NOW. live state, the needle, the thing you're doing.
//   gold  → HEADED / WON. the target marker, the made move, the win.
//
// Typeface: Lora throughout (body + display). Space Mono is the utility
// face for chrome labels in the reactive surfaces (the Reframe). No
// third display face — the restraint is the point.
// ─────────────────────────────────────────────────────────────

export const tokens = {
  // ground
  bg:        '#080A0E',   // near-black field
  bgLift:    '#0E1118',   // lifted card top
  panel:     '#0F131B',   // panel
  panel2:    '#12161F',   // input / inset

  // lines
  line:       'rgba(255,255,255,0.10)',
  lineStrong: 'rgba(255,255,255,0.18)',

  // ink (three steps, floor at 0.50)
  ink:   '#F3F6FA',
  ink2:  'rgba(243,246,250,0.70)',
  ink3:  'rgba(243,246,250,0.50)',

  // the two accents
  cyan: '#5FE2EE',   // NOW — live, the needle, what you're doing
  gold: '#ECB44A',   // HEADED / WON — the target, the made move

  // soft accent glow used behind the ground
  glow: 'rgba(95,226,238,0.13)',
}

// The four-grade standing scale — the quality ladder.
// Off / Building / Solid / Strong. These are the dot + ramp + dial
// colors in the self-scouting report. NEVER reuse cyan/gold here;
// standing has its own palette so "now/headed" and "grade" never blur.
export const STANDING = {
  off:      '#D2603C',
  building: '#E0A23A',
  solid:    '#57C8DA',
  strong:   '#5FD08A',
}

// Typography spreads — spread into style objects.
//   serif → Lora, display + body
//   mono  → Space Mono, chrome labels on reactive surfaces only
export const serif = { fontFamily: "'Lora', Georgia, serif" }
export const mono  = { fontFamily: "'Space Mono', ui-monospace, monospace" }

// Soft accent glow from any hex — used when an area paints the ground
// with its own accent (the per-area accents in areas.js).
export function hexGlow(hex, alpha = 0.13) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}

// Google Fonts the app loads. Kept here so the <head> link and the
// token file agree on weights.
export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Space+Mono:wght@400;700&display=swap'
