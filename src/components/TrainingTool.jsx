// ─────────────────────────────────────────────────────────────
// TrainingTool.jsx — the daily training tool, lifted from the-work.html
// and redecorated to the white skin. Function unchanged: an area's shapes,
// each with an on/off toggle, cadence, editable steps you fill yourself,
// a log (or run, if the shape has a runner), current/best streak, and a
// 14-day history. Add your own shape at the bottom.
//
// Wired to real data: shapes are the area's practices, history and streaks
// come from the log, steps persist into the practice's config.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { tokens, sans, eyebrow } from '../lib/tokens'
import { CADENCES, cadenceLabel } from '../lib/practiceModel'
import { runnerKind } from '../lib/day'
import { streak, bestStreak, dayHistory, dayWon } from '../lib/scoring'

const ACTIVE = tokens.blue
const TODAY = tokens.gold

export default function TrainingTool({ areaKey, practices, logsBy = {}, onToggle, onCadence, onSaveSteps, onRun, onLog, onAdd }) {
  const items = practices.filter(p => p.area === areaKey)
  const [openId, setOpenId] = useState(items[0]?.id || null)
  const [stepsBy, setStepsBy] = useState({})
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCad, setNewCad] = useState('daily')

  const getSteps = p => stepsBy[p.id] ?? (Array.isArray(p.config?.steps) ? p.config.steps : [])
  const setSteps = (p, steps) => setStepsBy(s => ({ ...s, [p.id]: steps }))
  const persist = p => onSaveSteps?.(p, getSteps(p))

  return (
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${tokens.lineSoft}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ ...eyebrow, fontSize: 11, color: tokens.ink3 }}>Your shapes</span>
        <span style={{ ...sans, fontSize: 12, color: tokens.ink3 }}>{items.filter(p => p.active).length} of {items.length} on</span>
      </div>

      {items.map(p => {
        const log = logsBy[p.id] || []
        const cur = streak(log)
        const best = Math.max(bestStreak(dayHistory(log, 90)), cur)
        const hist = dayHistory(log, 14)
        const today = dayWon(log)
        const isOpen = p.id === openId
        const runner = runnerKind(p)
        const last7 = hist.slice(-7)

        return (
          <div key={p.id} style={{ border: `1px solid ${tokens.lineSoft}`, borderRadius: 15, background: tokens.panel, marginBottom: 12, overflow: 'hidden', opacity: p.active ? 1 : 0.62 }}>
            <div onClick={() => setOpenId(isOpen ? null : p.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', cursor: 'pointer' }}>
              <button onClick={e => { e.stopPropagation(); onToggle?.(p, !p.active) }} aria-pressed={p.active} style={{
                flex: '0 0 auto', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', position: 'relative',
                border: `1.6px solid ${p.active ? ACTIVE : tokens.line}`, background: p.active ? ACTIVE : 'transparent',
              }}>
                {p.active && <span style={{ position: 'absolute', inset: 5, borderRadius: '50%', background: '#fff' }} />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...sans, fontSize: 16, fontWeight: 600, color: tokens.ink }}>{p.label}</div>
                <div style={{ ...sans, fontSize: 12, color: tokens.ink3, marginTop: 3 }}>
                  {cadenceLabel(p.cadence)} · <span style={{ color: ACTIVE }}>{cur}-day streak</span>{p.source === 'owned' || runner ? ' · runs a tool' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {last7.map((d, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: d ? ACTIVE : tokens.line }} />)}
              </div>
              <span style={{ color: tokens.ink3, fontSize: 20, lineHeight: 1, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>›</span>
            </div>

            {isOpen && (
              <div style={{ borderTop: `1px solid ${tokens.lineSoft}`, padding: '18px 16px 20px', background: tokens.bg2 }}>
                <Field label="Cadence" />
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {CADENCES.map(c => {
                    const on = p.cadence === c.key
                    return <button key={c.key} onClick={() => onCadence?.(p, c.key)} style={{
                      ...sans, fontSize: 12.5, cursor: 'pointer', borderRadius: 999, padding: '6px 13px',
                      color: on ? '#fff' : tokens.ink2, background: on ? ACTIVE : 'transparent',
                      border: `1px solid ${on ? ACTIVE : tokens.line}`, fontWeight: on ? 600 : 500,
                    }}>{c.label}</button>
                  })}
                </div>

                <div style={{ marginTop: 20 }}>
                  <Field label="Your steps" />
                  {getSteps(p).map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0', borderBottom: `1px solid ${tokens.lineSoft}` }}>
                      <span style={{ ...sans, fontSize: 12, color: tokens.ink3, width: 22, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                      <input value={s} onChange={e => { const n = getSteps(p).slice(); n[i] = e.target.value; setSteps(p, n) }} onBlur={() => persist(p)}
                        style={{ flex: 1, ...sans, fontSize: 15.5, color: tokens.ink, background: 'transparent', border: 0, borderBottom: `1px solid transparent`, padding: '2px 0', outline: 'none' }} />
                      <button onClick={() => { const n = getSteps(p).slice(); n.splice(i, 1); setSteps(p, n); onSaveSteps?.(p, n) }}
                        style={{ background: 'none', border: 0, color: tokens.ink3, cursor: 'pointer', fontSize: 16, padding: 4 }}>×</button>
                    </div>
                  ))}
                  <button onClick={() => setSteps(p, [...getSteps(p), ''])} style={{ marginTop: 12, background: 'none', border: 0, color: tokens.ink3, ...sans, fontSize: 14, cursor: 'pointer' }}>+ add a step</button>
                  <div style={{ ...sans, fontSize: 12.5, color: tokens.ink3, marginTop: 7, fontStyle: 'italic' }}>These are yours. We hold the shape, you fill it.</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, flexWrap: 'wrap' }}>
                  {runner ? (
                    <button onClick={() => onRun?.(p)} style={logBtn(false)}>{today ? 'Run again' : 'Run the shape'}</button>
                  ) : (
                    <button onClick={today ? undefined : () => onLog?.(p)} disabled={today} style={logBtn(today)}>{today ? 'Logged today ✓' : "Log today's rep"}</button>
                  )}
                  <div style={{ display: 'flex', gap: 22 }}>
                    <Stat v={cur} k="Current" accent />
                    <Stat v={best} k="Best" />
                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
                  <Field label="Last 14 days" />
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {hist.map((d, i) => {
                      const isToday = i === hist.length - 1
                      return <span key={i} style={{ width: 15, height: 15, borderRadius: 4, background: d ? ACTIVE : '#E8E8ED', border: `1px solid ${d ? ACTIVE : tokens.lineSoft}`, outline: isToday ? `1.5px solid ${TODAY}` : 'none', outlineOffset: 1 }} />
                    })}
                  </div>
                  <div style={{ ...sans, fontSize: 11.5, color: tokens.ink3, marginTop: 10 }}>Filled is a rep logged · gold outline is today</div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {!adding ? (
        <button onClick={() => setAdding(true)} style={{ width: '100%', border: `1px dashed ${tokens.line}`, borderRadius: 15, background: 'transparent', color: tokens.ink2, ...sans, fontSize: 15, padding: 16, cursor: 'pointer', marginTop: 2 }}>+ Add your own shape</button>
      ) : (
        <div style={{ border: `1px solid ${tokens.lineSoft}`, borderRadius: 15, background: tokens.bg2, padding: 18 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name your shape" autoFocus
            style={{ width: '100%', ...sans, fontSize: 18, fontWeight: 600, color: tokens.ink, background: 'transparent', border: 0, borderBottom: `1px solid ${tokens.line}`, padding: '6px 0 10px', outline: 'none', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 16 }}>
            {CADENCES.map(c => {
              const on = newCad === c.key
              return <button key={c.key} onClick={() => setNewCad(c.key)} style={{ ...sans, fontSize: 12.5, cursor: 'pointer', borderRadius: 999, padding: '6px 13px', color: on ? '#fff' : tokens.ink2, background: on ? ACTIVE : 'transparent', border: `1px solid ${on ? ACTIVE : tokens.line}`, fontWeight: on ? 600 : 500 }}>{c.label}</button>
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
            <button onClick={() => { const n = newName.trim() || 'New shape'; onAdd?.(areaKey, n, newCad); setNewName(''); setNewCad('daily'); setAdding(false) }}
              style={{ ...sans, fontSize: 14, fontWeight: 600, color: '#fff', background: ACTIVE, border: 0, borderRadius: 9, padding: '9px 18px', cursor: 'pointer' }}>Add shape</button>
            <button onClick={() => { setAdding(false); setNewName(''); setNewCad('daily') }} style={{ ...sans, fontSize: 14, color: tokens.ink3, background: 'none', border: 0, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label }) {
  return <div style={{ ...sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: tokens.ink3, marginBottom: 9 }}>{label}</div>
}
function Stat({ v, k, accent }) {
  return (
    <div>
      <div style={{ ...sans, fontSize: 22, fontWeight: 700, color: accent ? ACTIVE : tokens.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{v}</div>
      <div style={{ ...sans, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: tokens.ink3, marginTop: 4 }}>{k}</div>
    </div>
  )
}
function logBtn(done) {
  return {
    ...sans, fontSize: 14.5, fontWeight: 600, letterSpacing: '0.02em', cursor: done ? 'default' : 'pointer',
    borderRadius: 10, padding: '11px 20px',
    color: done ? ACTIVE : '#fff', background: done ? 'transparent' : ACTIVE,
    border: done ? `1px solid ${ACTIVE}` : 0,
  }
}
