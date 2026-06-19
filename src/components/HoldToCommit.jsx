// ─────────────────────────────────────────────────────────────
// HoldToCommit.jsx — the charge ring, as a React component.
//
// The press-and-hold primitive lifted out of NextUs WinTheDay, now a
// component either app can drop in. Press and hold; the ring fills
// cyan; at full it flips gold, buzzes, and fires onComplete once. The
// hold IS the commit — there is no tap-to-skip.
//
// Props: holdMs, size, onComplete, label (shown above), done (sticky),
//        bolt (render the bolt glyph inside).
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { tokens } from '../lib/tokens'

const reduce = typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function HoldToCommit({
  holdMs = 2400, size = 120, onComplete = () => {}, done = false, bolt = true,
}) {
  const [f, setF] = useState(done ? 1 : 0)
  const [committed, setCommitted] = useState(done)
  const ref = useRef(null)
  const timer = useRef(null)
  const start = useRef(0)

  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  const r = (size - 10) / 2
  const C = 2 * Math.PI * r

  function begin(e) {
    if (committed) return
    e.preventDefault()
    start.current = Date.now()
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start.current) / holdMs)
      setF(p)
      if (p >= 1) {
        clearInterval(timer.current); timer.current = null
        setCommitted(true)
        if (navigator.vibrate) navigator.vibrate([14, 50, 14])
        onComplete()
      }
    }, 40)
  }
  function end() {
    if (committed) return
    if (timer.current) { clearInterval(timer.current); timer.current = null }
    setF(0)
  }

  const stroke = committed ? tokens.gold : tokens.cyan

  return (
    <div
      ref={ref}
      onPointerDown={begin}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'relative', width: size, height: size, margin: '0 auto',
        cursor: committed ? 'default' : 'pointer', touchAction: 'none', userSelect: 'none',
        WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tokens.lineStrong} strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - f)}
          style={{ transition: reduce ? 'none' : 'stroke 0.3s' }}
        />
      </svg>
      {bolt && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="42" viewBox="0 0 24 32" style={{ transform: reduce ? 'none' : `scale(${0.9 + f * 0.35})`, transition: 'transform 0.05s linear' }}>
            <path d="M13 1 L3 18 L11 18 L9 31 L21 12 L13 12 Z" fill={committed ? tokens.gold : tokens.cyan} opacity={(0.35 + f * 0.6).toFixed(2)} />
          </svg>
        </div>
      )}
    </div>
  )
}
