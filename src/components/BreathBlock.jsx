// ─────────────────────────────────────────────────────────────
// BreathBlock.jsx — runs a breath tool as a training block.
// Picks the tool by config.breath (charge | open | pacer), passes its
// params through, and turns the tool's onComplete into a logged rep.
// The pacer is an open-ended atom, so it gets its own Log control.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { tokens, sans, eyebrow } from '../lib/tokens'
import ChargeBreath from './ChargeBreath'
import OpenBreath from './OpenBreath'
import BreathPacer from './BreathPacer'

export default function BreathBlock({ practice, onLogged, onClose }) {
  const cfg = practice.config || {}
  const kind = cfg.breath
  const [saving, setSaving] = useState(false)

  async function complete() {
    if (saving) return
    setSaving(true)
    try { await onLogged({ breath: kind }) } finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ ...eyebrow, fontSize: 11, color: tokens.blue }}>{practice.label}</span>
        <button onClick={onClose} style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 0, color: tokens.ink3, cursor: 'pointer' }}>Close</button>
      </div>

      {kind === 'charge' && (
        <ChargeBreath
          onComplete={complete}
          rounds={cfg.rounds || 3}
          workSeconds={cfg.workSeconds || 20}
          restSeconds={cfg.restSeconds || 10}
        />
      )}

      {kind === 'open' && (
        <OpenBreath
          onComplete={complete}
          rounds={cfg.rounds || 3}
        />
      )}

      {kind === 'pacer' && (
        <div style={{ textAlign: 'center', padding: '20px 0 0' }}>
          <BreathPacer
            inhale={cfg.inhale || 4}
            hold={cfg.hold || 2}
            exhale={cfg.exhale || 6}
            rest={cfg.rest || 2}
          />
          <button onClick={complete} disabled={saving} style={{
            marginTop: 26, padding: '13px 28px', ...sans, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', borderRadius: 980, color: '#fff', background: tokens.blue, border: 'none',
          }}>Done · log it</button>
        </div>
      )}
    </div>
  )
}
