// ─────────────────────────────────────────────────────────────
// PracticeRun.jsx — the walk, steps mode.
//
// The run flow for a steps × done practice (Money Moves). Three beats:
//   field   — pick up to N moves from the seeds, or name your own
//   prelive — see each move made, one at a time, on a held charge ring
//   line    — write the victory line, set the day
// On "set the day" it writes one row to la_practice_log (the payload
// carries the moves + the line), and hands control back.
//
// This is the seed of the generic runner: when other run-modes land
// (timer for Train, open for the Reframe) they branch here off
// practice.run_mode. Today it implements steps.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { tokens, serif, mono } from '../lib/tokens'
import HoldToCommit from './HoldToCommit'

export default function PracticeRun({ practice, onLogged, onClose }) {
  const cfg = practice.config || {}
  const seeds = cfg.seeds || []
  const maxMoves = cfg.maxMoves || 3
  const linePrompt = cfg.line?.prompt || "Tonight, what's true?"
  const linePlaceholder = cfg.line?.placeholder || ''

  const [beat, setBeat] = useState('field')
  const [selected, setSelected] = useState([])
  const [preIndex, setPreIndex] = useState(0)
  const [custom, setCustom] = useState('')
  const [line, setLine] = useState('')
  const [saving, setSaving] = useState(false)

  const full = selected.length >= maxMoves

  function toggle(id, text) {
    setSelected(prev => {
      const i = prev.findIndex(m => m.id === id)
      if (i >= 0) return prev.filter(m => m.id !== id)
      if (prev.length >= maxMoves) return prev
      return [...prev, { id, text }]
    })
  }
  function addCustom() {
    const t = custom.trim()
    if (!t || full) return
    setSelected(prev => [...prev, { id: 'c-' + Date.now(), text: t }])
    setCustom('')
  }
  function advance() {
    if (preIndex + 1 < selected.length) setPreIndex(preIndex + 1)
    else setBeat('line')
  }
  async function setDay() {
    if (saving) return
    setSaving(true)
    try {
      await onLogged({ moves: selected.map(m => m.text), line: line.trim() || null })
    } finally {
      setSaving(false)
    }
  }

  const Head = () => (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ ...mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.gold }}>{practice.label}</span>
      <button onClick={onClose} style={{ ...mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'none', border: 0, color: tokens.ink3, cursor: 'pointer' }}>Close</button>
    </div>
  )

  if (beat === 'field') {
    return (
      <div>
        <Head />
        <h1 style={{ ...serif, fontSize: 24, fontWeight: 600, lineHeight: 1.14 }}>{practice.ask}</h1>
        <p style={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.55, marginTop: 9 }}>Pick up to {maxMoves}. The doing is yours.</p>
        <div style={{ marginTop: 16 }}>
          {seeds.map((t, i) => {
            const id = 's-' + i
            const on = selected.some(m => m.id === id)
            const dis = !on && full
            return (
              <button key={id} onClick={() => toggle(id, t)} disabled={dis} style={{
                display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
                padding: '12px 14px', marginBottom: 8, borderRadius: 11, cursor: dis ? 'default' : 'pointer',
                border: `1px solid ${on ? tokens.gold : tokens.line}`, background: on ? 'rgba(236,180,74,0.07)' : 'transparent',
                opacity: dis ? 0.4 : 1, fontFamily: serif.fontFamily, color: tokens.ink, fontSize: 15,
              }}>
                <span style={{ flex: 1 }}>{t}</span>
                <span style={{ color: tokens.gold, opacity: on ? 1 : 0, fontSize: 14 }}>✓</span>
              </button>
            )
          })}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input
              value={custom} onChange={e => setCustom(e.target.value)} disabled={full}
              onKeyDown={e => { if (e.key === 'Enter') addCustom() }}
              placeholder="Name a move…"
              style={{ flex: 1, padding: '11px 14px', ...serif, fontSize: 15, color: tokens.ink, background: tokens.panel2, border: `1px dashed rgba(236,180,74,0.32)`, borderRadius: 11, outline: 'none' }}
            />
            <button onClick={addCustom} disabled={full} style={{ width: 46, fontSize: 20, color: tokens.gold, background: 'none', border: `1px solid ${tokens.line}`, borderRadius: 11, cursor: full ? 'default' : 'pointer' }}>+</button>
          </div>
        </div>
        <button onClick={() => { setPreIndex(0); setBeat('prelive') }} disabled={!selected.length} style={ctaStyle(!selected.length)}>
          See them made · {selected.length} of {maxMoves}
        </button>
      </div>
    )
  }

  if (beat === 'prelive') {
    const m = selected[preIndex]
    return (
      <div>
        <Head />
        <div style={{ textAlign: 'center', padding: '10px 6px 2px' }}>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>Move {preIndex + 1} of {selected.length}</div>
          <div style={{ ...serif, fontSize: 20, fontWeight: 600, lineHeight: 1.4, margin: '12px auto 20px', maxWidth: 320 }}>{m.text}</div>
          <HoldToCommit key={m.id} holdMs={practice.config?.holdMs || 2400} onComplete={() => setTimeout(advance, 480)} />
          <div style={{ fontSize: 14, color: tokens.ink2, marginTop: 16 }}>See it made.</div>
          <div style={{ ...mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: tokens.ink3, marginTop: 3 }}>Hold…</div>
        </div>
      </div>
    )
  }

  // line
  return (
    <div>
      <Head />
      <div style={{ margin: '4px 0 16px' }}>
        {selected.map(m => (
          <div key={m.id} style={{ padding: '10px 14px', marginBottom: 8, borderRadius: 11, border: `1px solid ${tokens.line}` }}>
            <span style={{ ...serif, color: tokens.ink2, fontSize: 14 }}>⚡ {m.text}</span>
          </div>
        ))}
      </div>
      <p style={{ ...serif, fontSize: 17, fontWeight: 600, textAlign: 'center', marginTop: 6 }}>{linePrompt}</p>
      <p style={{ fontSize: 12, color: tokens.ink3, textAlign: 'center', margin: '2px 0 12px' }}>One line, written as the play already made. Optional.</p>
      <textarea
        value={line} onChange={e => setLine(e.target.value)} rows={2} placeholder={linePlaceholder}
        style={{ width: '100%', padding: '11px 14px', ...serif, fontSize: 15, fontStyle: 'italic', color: tokens.ink2, background: 'rgba(95,226,238,0.05)', border: '1px solid rgba(95,226,238,0.2)', borderRadius: 10, outline: 'none', resize: 'none', lineHeight: 1.6 }}
      />
      <button onClick={setDay} disabled={saving} style={ctaStyle(saving)}>{saving ? 'Setting…' : 'Set the day →'}</button>
    </div>
  )
}

function ctaStyle(disabled) {
  return {
    width: '100%', padding: 13, marginTop: 16, ...mono, fontSize: 13, fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 40,
    cursor: disabled ? 'default' : 'pointer',
    color: disabled ? tokens.ink3 : tokens.cyan,
    background: disabled ? 'none' : 'rgba(95,226,238,0.05)',
    border: `1.5px solid ${disabled ? tokens.line : 'rgba(95,226,238,0.7)'}`,
  }
}
