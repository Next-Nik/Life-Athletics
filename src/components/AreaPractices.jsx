// ─────────────────────────────────────────────────────────────
// AreaPractices.jsx — the bridge from scout to training.
// Under an area's read sits its practices, each with a switch. Switch one
// on and it joins your day. Add your own here too. This is how the gap
// hands you the work that closes it.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { tokens, sans, eyebrow } from '../lib/tokens'
import { cadenceLabel } from '../lib/practiceModel'

export default function AreaPractices({ areaKey, practices, onToggle, onAdd }) {
  const [draft, setDraft] = useState('')
  const items = practices.filter(p => p.area === areaKey)

  return (
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${tokens.lineSoft}` }}>
      <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3, marginBottom: 10 }}>Practices for this area</div>

      {items.length === 0 && (
        <p style={{ fontSize: 14, color: tokens.ink3, marginBottom: 8 }}>None yet. Add one below.</p>
      )}

      {items.map(p => (
        <div key={p.id} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
          border: `1px solid ${tokens.lineSoft}`, borderRadius: 12, marginBottom: 8,
          background: p.active ? 'rgba(19,156,221,0.04)' : tokens.bg,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...sans, fontSize: 15, fontWeight: 500, color: tokens.ink }}>{p.label}</div>
            <div style={{ ...sans, fontSize: 12, color: tokens.ink3, marginTop: 2 }}>
              {p.active ? 'In your day' : 'Off'} · {cadenceLabel(p.cadence)}
            </div>
          </div>
          <Switch on={!!p.active} onClick={() => onToggle(p, !p.active)} />
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { onAdd(areaKey, draft.trim()); setDraft('') } }}
          placeholder="Add a practice of your own"
          style={{ flex: 1, ...sans, fontSize: 14, color: tokens.ink, background: tokens.bg, border: `1px dashed ${tokens.line}`, borderRadius: 12, padding: '11px 14px', outline: 'none' }}
        />
        <button onClick={() => { if (draft.trim()) { onAdd(areaKey, draft.trim()); setDraft('') } }} style={{
          ...sans, fontSize: 13, fontWeight: 600, color: '#fff', background: tokens.blue, border: 'none', borderRadius: 12, padding: '0 16px', cursor: 'pointer',
        }}>Add</button>
      </div>
    </div>
  )
}

function Switch({ on, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{
      width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
      background: on ? tokens.blue : '#D1D1D6', flex: '0 0 auto', padding: 0,
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transition: 'left .15s' }} />
    </button>
  )
}
