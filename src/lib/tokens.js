// ─────────────────────────────────────────────────────────────
// tokens.js — the Life Athletics design system  (white / Apple)
//
// The brand's real home, from the original site: white, airy, lots of
// air, black ink, the splatter mark front and centre, one thin geometric
// sans, a single blue accent. Not a dark instrument — a clean white field
// where the ink mark and the type do the work. Restraint is the whole
// aesthetic; the splatter is the one place we let it get loud.
//
// Two accents, two jobs:
//   blue  → LIVE / NOW / the brand. links, the needle, what you're doing,
//           the "ATHLETICS" in the wordmark. Sampled off the old hero:
//           #139CDD. (This is the "cyan" we kept — it's just truer blue.)
//   gold  → HEADED / WON. the target marker, the made move, the win.
//           Deepened from the dark-theme gold so it reads on white.
//
// Type: ONE geometric sans, many weights — the Apple discipline, and what
// the old site did. Light(300) for display, Medium for body/UI, Bold for
// the wordmark and letter-spaced eyebrows.
//   ⚠ The original site's face is Proxima Nova (Adobe/Typekit). Montserrat
//   is the free Google-hosted twin used here; if you keep the Adobe Fonts
//   licence, point `display`/`sans` at 'proxima-nova' and nothing else moves.
// ─────────────────────────────────────────────────────────────

export const tokens = {
  // ground — white, with Apple's section grey for insets
  bg:      '#FFFFFF',
  bg2:     '#F5F5F7',
  panel:   '#FFFFFF',
  panel2:  '#F5F5F7',

  // lines — hairlines on white
  line:     'rgba(0,0,0,0.10)',
  lineSoft: 'rgba(0,0,0,0.06)',

  // ink — Apple's near-black + greys, never pure black
  ink:   '#1D1D1F',
  ink2:  '#6E6E73',
  ink3:  '#86868B',

  // the two accents
  blue: '#139CDD',
  gold: '#C2902E',

  // soft card lift + accent glow
  shadow:   '0 1px 3px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.05)',
  glowBlue: 'rgba(19,156,221,0.16)',

  // ── back-compat aliases (old dark-theme keys → white equivalents) ──
  // so nothing renders broken if a reference was missed in the sweep.
  bgLift:     '#FFFFFF',
  lineStrong: 'rgba(0,0,0,0.16)',
  cyan:       '#139CDD',
  glow:       'rgba(19,156,221,0.10)',
}

// Four-grade standing scale, retuned to read on white.
export const STANDING = {
  off:      '#D2603C',
  building: '#D2942C',
  solid:    '#2E9BC4',
  strong:   '#3FA86A',
}

// Type spreads. One family; weight does the work.
export const display = { fontFamily: "'Montserrat', system-ui, sans-serif", fontWeight: 300 }
export const sans    = { fontFamily: "'Montserrat', system-ui, sans-serif" }
// back-compat: old code spread `serif`/`mono`; both now resolve to the sans.
export const serif   = { fontFamily: "'Montserrat', system-ui, sans-serif" }
export const mono    = { fontFamily: "'Montserrat', system-ui, sans-serif" }

// An eyebrow / kicker — letter-spaced bold caps (the old-site section style).
export const eyebrow = {
  fontFamily: "'Montserrat', system-ui, sans-serif",
  fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
}

export function hexGlow(hex, alpha = 0.16) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}

// The mark — the actual handstand-on-globe. Black ink for the white
// ground; the white version is kept for any dark surface.
export const ASSETS = {
  mark:      '/mark_black.png',
  markWhite: '/mark_white.png',
}

export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap'
