// ─────────────────────────────────────────────────────────────
// TimerRun.jsx — the training block (timer / intervals).
// Modelled on the NextUs ChargeBreath engine: a 3·2·1 lead-in, a ring
// that is the clock, and either a single timed block or N work/rest
// rounds. Pause and resume while it runs. Wrapped in two bookends: name
// the edge before, capture what got sharper after.
//
// config (single block):  { minutes }
// config (rounds):        { rounds, workSeconds, restSeconds }
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { tokens, sans, display, eyebrow } from '../lib/tokens'

export default function TimerRun({ practice, onLogged, onClose }) {
  const cfg = practice.config || {}
  const intervals = cfg.rounds > 0
  const rounds = cfg.rounds || 1
  const workS = cfg.workSeconds || (cfg.minutes ? cfg.minutes * 60 : 1200)
  const restS = cfg.restSeconds || 0
  const leadIn = cfg.leadIn != null ? cfg.leadIn : 3

  // Build the phase line: lead-in, then for each round work (+ rest, except after the last).
  function buildPhases() {
    const ph = [{ kind: 'lead', label: 'Ready', dur: leadIn }]
    for (let r = 1; r <= rounds; r++) {
      ph.push({ kind: 'work', label: intervals ? `Work · round ${r} of ${rounds}` : 'Go', dur: workS })
      if (restS > 0 && r < rounds) ph.push({ kind: 'rest', label: 'Rest', dur: restS })
    }
    return ph
  }

  const [beat, setBeat] = useState('edge') // edge | run | capture
  const [edge, setEdge] = useState('')
  const [capture, setCapture] = useState('')
  const [pi, setPi] = useState(0)
  const [left, setLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [saving, setSaving] = useState(false)
  const phases = useRef([])
  const tick = useRef(null)

  useEffect(() => () => { if (tick.current) clearInterval(tick.current) }, [])

  function start() {
    phases.current = buildPhases()
    setBeat('run'); setPi(0); setLeft(phases.current[0].dur); setPaused(false)
    run()
  }
  function run() {
    if (tick.current) clearInterval(tick.current)
    tick.current = setInterval(() => {
      setLeft(l => {
        if (l > 1) return l - 1
        // advance phase
        setPi(idx => {
          const ni = idx + 1
          if (ni >= phases.current.length) { clearInterval(tick.current); setBeat('capture'); return idx }
          setLeft(phases.current[ni].dur)
          return ni
        })
        return phases.current[Math.min(pi + 1, phases.current.length - 1)]?.dur ?? 0
      })
    }, 1000)
  }
  function togglePause() {
    if (paused) { setPaused(false); run() }
    else { setPaused(true); if (tick.current) clearInterval(tick.current) }
  }
  function finishEarly() { if (tick.current) clearInterval(tick.current); setBeat('capture') }
  async function done() {
    if (saving) return
    setSaving(true)
    try { await onLogged({ intention: edge.trim() || null, rounds: intervals ? rounds : 1, capture: capture.trim() || null }) }
    finally { setSaving(false) }
  }

  const cur = phases.current[pi] || { kind: 'lead', label: 'Ready', dur: leadIn }
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const frac = cur.dur ? 1 - left / cur.dur : 0
  const R = 96, C = 2 * Math.PI * R
  const ringColor = cur.kind === 'rest' ? tokens.gold : tokens.blue

  return (
    <div>
      <Head label={practice.label} onClose={onClose} />

      {beat === 'edge' && (
        <>
          <h1 style={{ ...display, fontSize: 26, lineHeight: 1.14 }}>What are you sharpening?</h1>
          <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.55, marginTop: 10 }}>
            Name the edge. {intervals ? `${rounds} rounds, ${workS}s on${restS ? ` / ${restS}s off` : ''}.` : `${Math.round(workS / 60)} minutes, full focus.`}
          </p>
          <input value={edge} onChange={e => setEdge(e.target.value)} placeholder="e.g. The hard set I usually skip"
            style={{ width: '100%', marginTop: 16, ...sans, fontSize: 16, color: tokens.ink, background: '#fff', border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '14px 15px', outline: 'none', boxSizing: 'border-box' }} />
          <button onClick={start} style={cta()}>Start the block</button>
        </>
      )}

      {beat === 'run' && (
        <div style={{ textAlign: 'center', padding: '14px 0 6px' }}>
          {edge && <div style={{ ...sans, fontSize: 14, color: tokens.ink2, marginBottom: 14 }}>{edge}</div>}
          <div style={{ ...eyebrow, fontSize: 11, color: cur.kind === 'rest' ? tokens.gold : tokens.ink3, marginBottom: 6 }}>{cur.label}</div>
          <svg viewBox="0 0 230 230" style={{ width: 230, height: 230 }}>
            <circle cx="115" cy="115" r={R} fill="none" stroke={tokens.lineSoft} strokeWidth="9" />
            <circle cx="115" cy="115" r={R} fill="none" stroke={ringColor} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 115 115)"
              style={{ transition: 'stroke-dashoffset 0.95s linear' }} />
            <text x="115" y="124" textAnchor="middle" style={{ ...display, fontSize: 40, fill: cur.kind === 'lead' ? tokens.ink3 : tokens.ink, fontVariantNumeric: 'tabular-nums' }}>
              {cur.kind === 'lead' ? left : `${mm}:${ss}`}
            </text>
          </svg>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
            <button onClick={togglePause} disabled={cur.kind === 'lead'} style={pill(cur.kind === 'lead')}>{paused ? 'Resume' : 'Pause'}</button>
            <button onClick={finishEarly} style={pill(false)}>Finish</button>
          </div>
        </div>
      )}

      {beat === 'capture' && (
        <>
          <h1 style={{ ...display, fontSize: 26, lineHeight: 1.14 }}>What got sharper?</h1>
          <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.55, marginTop: 10 }}>One line. What moved, what you noticed.</p>
          <textarea value={capture} onChange={e => setCapture(e.target.value)} rows={3} placeholder="Even a small thing counts."
            style={{ width: '100%', marginTop: 16, ...sans, fontSize: 16, lineHeight: 1.5, color: tokens.ink, background: '#fff', border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '14px 15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          <button onClick={done} disabled={saving} style={cta()}>Log it</button>
        </>
      )}
    </div>
  )
}

function Head({ label, onClose }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ ...eyebrow, fontSize: 11, color: tokens.blue }}>{label}</span>
      <button onClick={onClose} style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 0, color: tokens.ink3, cursor: 'pointer' }}>Close</button>
    </div>
  )
}
function cta() {
  return { width: '100%', marginTop: 22, padding: 15, ...sans, fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 980, color: '#fff', background: tokens.blue, border: 'none' }
}
function pill(disabled) {
  return { ...sans, fontSize: 13, fontWeight: 600, padding: '9px 20px', borderRadius: 980, cursor: disabled ? 'default' : 'pointer', color: tokens.ink2, background: 'transparent', border: `1px solid ${tokens.line}`, opacity: disabled ? 0.4 : 1 }
}
