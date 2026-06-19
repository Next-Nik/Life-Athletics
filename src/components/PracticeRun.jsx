// ─────────────────────────────────────────────────────────────
// PracticeRun.jsx — the walk, steps mode. White ground.
// Three beats: field (pick up to N moves), prelive (see each made on the
// charge ring), line (write the victory line, set the day). On "set the
// day" it writes one row to la_practice_log and hands control back.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { tokens, sans, display, eyebrow } from '../lib/tokens'
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
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ ...eyebrow, fontSize: 11, color: tokens.gold }}>{practice.label}</span>
      <button onClick={onClose} style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 0, color: tokens.ink3, cursor: 'pointer' }}>Close</button>
    </div>
  )

  if (beat === 'field') {
    return (
      <div>
        <Head />
        <h1 style={{ ...display, fontSize: 26, lineHeight: 1.14, letterSpacing: '-0.01em' }}>{practice.ask}</h1>
        <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.55, marginTop: 10 }}>Pick up to {maxMoves}. How you make them is your call.</p>
        <div style={{ marginTop: 18 }}>
          {seeds.map((t, i) => {
            const id = 's-' + i
            const on = selected.some(m => m.id === id)
            const dis = !on && full
            return (
              <button key={id} onClick={() => toggle(id, t)} disabled={dis} style={{
                display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
                padding: '13px 15px', marginBottom: 8, borderRadius: 12, cursor: dis ? 'default' : 'pointer',
                border: `1px solid ${on ? tokens.gold : tokens.line}`, background: on ? 'rgba(194,144,46,0.08)' : '#fff',
                opacity: dis ? 0.4 : 1, ...sans, color: tokens.ink, fontSize: 15,
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
              style={{ flex: 1, padding: '12px 15px', ...sans, fontSize: 15, color: tokens.ink, background: tokens.bg2, border: `1px dashed rgba(194,144,46,0.4)`, borderRadius: 12, outline: 'none' }}
            />
            <button onClick={addCustom} disabled={full} style={{ width: 48, fontSize: 20, color: tokens.gold, background: '#fff', border: `1px solid ${tokens.line}`, borderRadius: 12, cursor: full ? 'default' : 'pointer' }}>+</button>
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
        <div style={{ textAlign: 'center', padding: '12px 6px 2px' }}>
          <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3 }}>Move {preIndex + 1} of {selected.length}</div>
          <div style={{ ...display, fontWeight: 400, fontSize: 21, lineHeight: 1.4, margin: '14px auto 22px', maxWidth: 320 }}>{m.text}</div>
          <HoldToCommit key={m.id} holdMs={practice.config?.holdMs || 2400} onComplete={() => setTimeout(advance, 480)} />
          <div style={{ fontSize: 14, color: tokens.ink2, marginTop: 16 }}>See it made.</div>
          <div style={{ ...eyebrow, fontSize: 10.5, color: tokens.ink3, marginTop: 3 }}>Hold…</div>
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
          <div key={m.id} style={{ padding: '11px 15px', marginBottom: 8, borderRadius: 12, border: `1px solid ${tokens.line}`, background: '#fff' }}>
            <span style={{ ...sans, color: tokens.ink2, fontSize: 14 }}>⚡ {m.text}</span>
          </div>
        ))}
      </div>
      <p style={{ ...display, fontWeight: 400, fontSize: 19, textAlign: 'center', marginTop: 6 }}>{linePrompt}</p>
      <p style={{ fontSize: 12.5, color: tokens.ink3, textAlign: 'center', margin: '2px 0 12px' }}>One line, like the win already happened. Optional.</p>
      <textarea
        value={line} onChange={e => setLine(e.target.value)} rows={2} placeholder={linePlaceholder}
        style={{ width: '100%', padding: '12px 15px', ...sans, fontSize: 15, color: tokens.ink, background: 'rgba(19,156,221,0.05)', border: '1px solid rgba(19,156,221,0.28)', borderRadius: 12, outline: 'none', resize: 'none', lineHeight: 1.6 }}
      />
      <button onClick={setDay} disabled={saving} style={ctaStyle(saving)}>{saving ? 'Setting…' : 'Set the day'}</button>
    </div>
  )
}

function ctaStyle(disabled) {
  return {
    width: '100%', padding: 14, marginTop: 18, ...sans, fontSize: 14, fontWeight: 600,
    letterSpacing: '0.02em', borderRadius: 980,
    cursor: disabled ? 'default' : 'pointer',
    color: disabled ? tokens.ink3 : '#fff',
    background: disabled ? tokens.bg2 : tokens.blue,
    border: disabled ? `1px solid ${tokens.line}` : 'none',
  }
}
