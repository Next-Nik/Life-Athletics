// ─────────────────────────────────────────────────────────────
// ReframeRun.jsx — the open runner (the Live Rep / Reframe shape).
// Three beats, in the moment: catch the thought, name its cost, switch
// it. Seeded from the area's reframe script but everything is editable.
// config: { reframe: { caught, cost, reframe } }
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { tokens, sans, display, eyebrow } from '../lib/tokens'

export default function ReframeRun({ practice, onLogged, onClose }) {
  const seed = practice.config?.reframe || {}
  const [beat, setBeat] = useState('catch') // catch | cost | switch
  const [caught, setCaught] = useState(seed.caught || '')
  const [cost, setCost] = useState(seed.cost || '')
  const [reframe, setReframe] = useState(seed.reframe || '')
  const [saving, setSaving] = useState(false)

  async function done() {
    if (saving) return
    setSaving(true)
    try { await onLogged({ caught: caught.trim(), cost: cost.trim(), reframe: reframe.trim() }) }
    finally { setSaving(false) }
  }

  const steps = {
    catch:  { q: 'What thought caught you?', v: caught, set: setCaught, ph: 'Say it plainly.', next: 'cost' },
    cost:   { q: 'What does it cost you?', v: cost, set: setCost, ph: 'What it pulls you out of.', next: 'switch' },
    switch: { q: 'What do you switch it to?', v: reframe, set: setReframe, ph: 'The truer, more useful question.', next: null },
  }
  const s = steps[beat]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ ...eyebrow, fontSize: 11, color: tokens.gold }}>{practice.label}</span>
        <button onClick={onClose} style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 0, color: tokens.ink3, cursor: 'pointer' }}>Close</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {['catch', 'cost', 'switch'].map(k => (
          <span key={k} style={{ flex: 1, height: 3, borderRadius: 2, background: k === beat || (k === 'catch' && beat !== 'catch') || (k === 'cost' && beat === 'switch') ? tokens.gold : tokens.lineSoft }} />
        ))}
      </div>

      <h1 style={{ ...display, fontSize: 26, lineHeight: 1.14 }}>{s.q}</h1>
      <textarea value={s.v} onChange={e => s.set(e.target.value)} rows={3} placeholder={s.ph}
        style={{ width: '100%', marginTop: 16, ...sans, fontSize: 16, lineHeight: 1.5, color: tokens.ink, background: '#fff', border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '14px 15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />

      {s.next ? (
        <button onClick={() => setBeat(s.next)} style={cta()}>Next</button>
      ) : (
        <button onClick={done} disabled={saving} style={cta()}>Switch it · log</button>
      )}
    </div>
  )
}
function cta() {
  return { width: '100%', marginTop: 22, padding: 15, ...sans, fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 980, color: '#fff', background: tokens.gold, border: 'none' }
}
