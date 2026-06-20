// ─────────────────────────────────────────────────────────────
// Scout.jsx — the You room: your self-scouting report and, under each
// area's read, its training tool. White ground. Running a shape opens its
// tool full-screen; finishing logs the rep and drops you back.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react'
import { tokens, sans, display } from '../lib/tokens'
import {
  seedScouting, saveScouting, seedPractices, loadPractices, loadLogs,
  setActive, setCadence, createPractice, saveConfig, logRep,
} from '../lib/db'
import Wordmark from '../components/Wordmark'
import ScoutingDial from '../components/ScoutingDial'
import RunRouter from '../components/RunRouter'

export default function Scout({ userId }) {
  const [scouting, setScouting] = useState(null)
  const [practices, setPractices] = useState([])
  const [logsBy, setLogsBy] = useState({})
  const [running, setRunning] = useState(null)
  const [err, setErr] = useState(null)

  const reloadPractices = useCallback(async () => {
    setPractices(await loadPractices(userId))
  }, [userId])

  const reloadLogs = useCallback(async () => {
    const logs = await loadLogs(userId, 90)
    const by = {}
    for (const r of logs) (by[r.practice_id] ||= []).push({ ...r, occurredAt: r.occurred_at })
    setLogsBy(by)
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
        await reloadLogs()
      } catch (e) { if (alive) setErr(e.message || String(e)) }
    })()
    return () => { alive = false }
  }, [userId, reloadPractices, reloadLogs])

  async function onSave(area, patch) {
    setScouting(rows => rows.map(r => r.area === area ? { ...r, ...patch } : r))
    try { await saveScouting(userId, area, patch) } catch (e) { setErr(e.message) }
  }
  async function onToggle(p, active) {
    setPractices(list => list.map(x => x.id === p.id ? { ...x, active } : x))
    try { await setActive(p.id, active) } catch (e) { setErr(e.message); reloadPractices() }
  }
  async function onCadence(p, cadence) {
    setPractices(list => list.map(x => x.id === p.id ? { ...x, cadence } : x))
    try { await setCadence(p.id, cadence) } catch (e) { setErr(e.message); reloadPractices() }
  }
  async function onSaveSteps(p, steps) {
    const config = { ...(p.config || {}), steps }
    setPractices(list => list.map(x => x.id === p.id ? { ...x, config } : x))
    try { await saveConfig(p.id, config) } catch (e) { setErr(e.message) }
  }
  async function onLog(p) {
    try { await logRep(userId, p, {}); await reloadLogs() } catch (e) { setErr(e.message) }
  }
  async function onAdd(area, label, cadence = 'daily') {
    try { await createPractice(userId, { area, label, cadence }); await reloadPractices() } catch (e) { setErr(e.message) }
  }
  async function onRunLogged(p, out) {
    const note = out?.line || out?.capture || out?.reframe || null
    try { await logRep(userId, p, { payload: out || {}, note }); await reloadLogs() } catch (e) { setErr(e.message) }
    setRunning(null)
  }

  if (running) {
    return (
      <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
        <RunRouter practice={running} onLogged={out => onRunLogged(running, out)} onClose={() => setRunning(null)} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark font={16} />
        <div style={{ ...sans, fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>You</div>
      </div>
      <h1 style={{ ...display, fontSize: 30, margin: '24px 0 6px', letterSpacing: '-0.01em' }}>Where things stand</h1>
      <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5, marginBottom: 20 }}>
        Nine parts of your life, at a glance. Blue is where you are, gold is where you want to be. Tap any area to read it, set the markers, and train its practices.
      </p>
      {err && <p style={{ fontSize: 13, color: tokens.gold }}>Something went wrong. {err}</p>}
      {!scouting && !err && <p style={{ color: tokens.ink3, fontSize: 15 }}>Reading your game…</p>}
      {scouting && (
        <ScoutingDial
          scouting={scouting} onSave={onSave}
          practices={practices} logsBy={logsBy}
          onToggle={onToggle} onCadence={onCadence} onSaveSteps={onSaveSteps}
          onRun={p => setRunning(p)} onLog={onLog} onAdd={onAdd}
        />
      )}
    </div>
  )
}
