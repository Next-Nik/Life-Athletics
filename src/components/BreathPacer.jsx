// ─────────────────────────────────────────────────────────────
// BreathPacer — lifted from NextUs, redecorated to the white skin.
// Logic unchanged: the breathing circle grows on the inhale, holds large,
// settles for the (longer) exhale, holds small, repeats. IN / OUT fade in
// on the active halves. Tap to still; tap to resume. Canonical 4·2·6·2.
// Reusable atom. Only palette and type changed.
//   inhale/hold/exhale/rest (4/2/6/2) · size · showWords · caption
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'

const GOLD_DK   = '#0E97B6'
const GOLD      = '#0FA8C9'
const GOLD_FILL = 'rgba(19,156,221,0.10)'
const FONT = "'Montserrat', system-ui, sans-serif"

let pacerInstance = 0

export default function BreathPacer({
  inhale = 4,
  hold = 2,
  exhale = 6,
  rest = 2,
  size = 128,
  showWords = true,
  caption = 'Breathe with me.',
}) {
  const [stilled, setStilled] = useState(false)
  const uid = useMemo(() => `bp${++pacerInstance}`, [])

  const total = inhale + hold + exhale + rest
  const pct = (s) => +((s / total) * 100).toFixed(2)

  const inEnd   = pct(inhale)
  const holdEnd = pct(inhale + hold)
  const outEnd  = pct(inhale + hold + exhale)
  const m = Math.min(2.5, pct(0.4))

  const MIN = 0.5, MAX = 1.0

  const css = `
@keyframes ${uid}-circ {
  0% { transform: scale(${MIN}); }
  ${inEnd}% { transform: scale(${MAX}); }
  ${holdEnd}% { transform: scale(${MAX}); }
  ${outEnd}% { transform: scale(${MIN}); }
  100% { transform: scale(${MIN}); }
}
@keyframes ${uid}-in {
  0% { opacity: 1; }
  ${Math.max(0, inEnd - m * 1.5)}% { opacity: 1; }
  ${inEnd}% { opacity: 0; }
  100% { opacity: 0; }
}
@keyframes ${uid}-out {
  0% { opacity: 0; }
  ${holdEnd + m / 2}% { opacity: 0; }
  ${holdEnd + m * 2}% { opacity: 1; }
  ${outEnd - m}% { opacity: 1; }
  ${outEnd + m / 2}% { opacity: 0; }
  100% { opacity: 0; }
}
`

  const playState = stilled ? 'paused' : 'running'
  const wordBase = {
    position: 'absolute', left: 0, right: 0,
    fontFamily: FONT, fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em',
    color: GOLD_DK, textAlign: 'center',
    animationDuration: `${total}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationPlayState: playState,
  }

  return (
    <div
      onClick={() => setStilled(s => !s)}
      role="button"
      aria-label={stilled ? 'Resume breath pacer' : 'Still breath pacer'}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
    >
      <style>{css}</style>

      <div style={{ position: 'relative', width: size + 28, height: size + 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: GOLD_FILL, border: `1.5px solid ${GOLD}`,
          animationName: `${uid}-circ`,
          animationDuration: `${total}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationPlayState: playState,
          opacity: stilled ? 0.5 : 1,
          transition: 'opacity 0.4s ease',
        }} />
      </div>

      {showWords && (
        <div style={{ position: 'relative', height: '18px', width: '100%', marginTop: '14px' }}>
          <div style={{ opacity: stilled ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            <span style={{ ...wordBase, animationName: `${uid}-in` }}>IN</span>
            <span style={{ ...wordBase, animationName: `${uid}-out`, opacity: 0 }}>OUT</span>
          </div>
          {stilled && (
            <span style={{
              position: 'absolute', left: 0, right: 0, top: 0,
              fontFamily: FONT, fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.18em',
              color: 'rgba(29,29,31,0.45)', textAlign: 'center',
            }}>
              STILLED
            </span>
          )}
        </div>
      )}

      {caption && (
        <p style={{
          fontFamily: FONT, fontSize: '13px', color: 'rgba(29,29,31,0.55)',
          margin: '10px 0 0', textAlign: 'center',
        }}>
          {caption}
        </p>
      )}
    </div>
  )
}
