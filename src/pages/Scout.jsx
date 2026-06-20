// ─────────────────────────────────────────────────────────────
// Scout.jsx — the You room: your self-scouting report. White ground.
// The wheel, the read, the standard, and each area's practices to switch
// on. This is where you see where you stand and pick the work.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react'
import { tokens, sans, display } from '../lib/tokens'
import { seedScouting, saveScouting, seedPractices, loadPractices, setActive, createPractice } from '../lib/db'
import Wordmark from '../components/Wordmark'
import ScoutingDial from '../components/ScoutingDial'

export default function Scout({ userId }) {
  const [scouting, setScouting] = useState(null)
  const [practices, setPractices] = useState([])
  const [err, setErr] = useState(null)

  const reloadPractices = useCallback(async () => {
    setPractices(await loadPractices(userId))
  }, [userId])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const rows = await seedScouting(userId)
        await seedPractices(userId)
        if (!alive) return
        setScouting(rows)
        await reloadPractices()
      } catch (e) { if (alive) setErr(e.message || String(e)) }
    })()
    return () => { alive = false }
  }, [userId, reloadPractices])

  async function onSave(area, patch) {
    setScouting(rows => rows.map(r => r.area === area ? { ...r, ...patch } : r))
    try { await saveScouting(userId, area, patch) } catch (e) { setErr(e.message) }
  }
  async function onToggle(p, active) {
    setPractices(list => list.map(x => x.id === p.id ? { ...x, active } : x))
    try { await setActive(p.id, active) } catch (e) { setErr(e.message); reloadPractices() }
  }
  async function onAdd(area, label) {
    try { await createPractice(userId, { area, label }); await reloadPractices() } catch (e) { setErr(e.message) }
  }

  return (
    <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark font={16} />
        <div style={{ ...sans, fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>You</div>
      </div>
      <h1 style={{ ...display, fontSize: 30, margin: '24px 0 6px', letterSpacing: '-0.01em' }}>Where things stand</h1>
      <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5, marginBottom: 20 }}>
        Nine parts of your life, at a glance. Blue is where you are, gold is where you want to be. Tap any area to read it, set the markers, and switch on the practices that close the gap.
      </p>
      {err && <p style={{ fontSize: 13, color: tokens.gold }}>Something went wrong. {err}</p>}
      {!scouting && !err && <p style={{ color: tokens.ink3, fontSize: 15 }}>Reading your game…</p>}
      {scouting && (
        <ScoutingDial scouting={scouting} onSave={onSave} practices={practices} onToggle={onToggle} onAdd={onAdd} />
      )}
    </div>
  )
}
