// ─────────────────────────────────────────────────────────────
// DayComposer.jsx — compose your day. White Apple sheet.
// Every area's practices, each with an on/off switch, plus "add your
// own" per area. Switching on puts a practice into your day; the day
// surface (Today) renders whatever is on. Nothing is forced on.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { tokens, sans, display, eyebrow } from '../lib/tokens'
import { AREAS } from '../lib/areas'
import { cadenceLabel } from '../lib/practiceModel'

export default function DayComposer({ practices, onToggle, onAdd, onClose }) {
  const [drafts, setDrafts] = useState({}) // area -> input text

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ ...display, fontSize: 24, letterSpacing: '-0.01em' }}>Compose your day</h2>
        <button onClick={onClose} style={{
          ...sans, fontSize: 13, fontWeight: 600, color: tokens.blue, background: 'none',
          border: 'none', cursor: 'pointer', padding: '6px 4px',
        }}>Done</button>
      </div>
      <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5, marginBottom: 18 }}>
        Switch on the practices you'll train. Add your own anytime. Only what's on shows up in your day.
      </p>

      {AREAS.map(a => {
        const items = practices.filter(p => p.area === a.key)
        return (
          <div key={a.key} style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: a.accent }} />
              <span style={{ ...eyebrow, fontSize: 11.5, color: tokens.ink2 }}>{a.label}</span>
            </div>

            {items.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                border: `1px solid ${tokens.lineSoft}`, borderRadius: 12, marginBottom: 8,
                background: p.active ? 'rgba(19,156,221,0.04)' : tokens.bg,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...sans, fontSize: 15, fontWeight: 500, color: tokens.ink }}>{p.label}</div>
                  <div style={{ ...sans, fontSize: 12, color: tokens.ink3, marginTop: 2 }}>{cadenceLabel(p.cadence)}</div>
                </div>
                <Switch on={!!p.active} onClick={() => onToggle(p, !p.active)} />
              </div>
            ))}

            <AddRow
              value={drafts[a.key] || ''}
              onChange={v => setDrafts(d => ({ ...d, [a.key]: v }))}
              onAdd={() => {
                const label = (drafts[a.key] || '').trim()
                if (!label) return
                onAdd(a.key, label)
                setDrafts(d => ({ ...d, [a.key]: '' }))
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

function Switch({ on, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{
      width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
      background: on ? tokens.blue : '#D1D1D6', transition: 'background .15s', flex: '0 0 auto', padding: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transition: 'left .15s',
      }} />
    </button>
  )
}

function AddRow({ value, onChange, onAdd }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onAdd() }}
        placeholder="Add a practice of your own"
        style={{
          flex: 1, ...sans, fontSize: 14, color: tokens.ink, background: tokens.bg,
          border: `1px dashed ${tokens.line}`, borderRadius: 12, padding: '11px 14px', outline: 'none',
        }}
      />
      <button onClick={onAdd} style={{
        ...sans, fontSize: 13, fontWeight: 600, color: '#fff', background: tokens.blue,
        border: 'none', borderRadius: 12, padding: '0 16px', cursor: 'pointer',
      }}>Add</button>
    </div>
  )
}
