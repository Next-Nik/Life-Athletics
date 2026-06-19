// Today.jsx — the day. The Money Moves card, and the run when you tap it.
import { useEffect, useState, useCallback } from 'react'
import { tokens, serif, mono } from '../lib/tokens'
import { ensureMoneyMoves, loadLog, logRep, setCadence } from '../lib/db'
import PracticeCard from '../components/PracticeCard'
import PracticeRun from '../components/PracticeRun'

export default function Today({ userId }) {
  const [practice, setPractice] = useState(null)
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(false)
  const [err, setErr] = useState(null)

  const refresh = useCallback(async (p) => {
    const rows = await loadLog(userId, p.id)
    setLog(rows)
  }, [userId])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const p = await ensureMoneyMoves(userId)
        if (!alive) return
        setPractice(p)
        await refresh(p)
      } catch (e) { if (alive) setErr(e.message || String(e)) }
    })()
    return () => { alive = false }
  }, [userId, refresh])

  async function onCadence(c) {
    setPractice(p => ({ ...p, cadence: c }))
    try { await setCadence(practice.id, c) } catch (e) { setErr(e.message) }
  }
  async function onLogged({ moves, line }) {
    await logRep(userId, practice, { payload: { moves, line }, note: line })
    await refresh(practice)
    setRunning(false)
  }

  return (
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '24px 20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ ...mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase' }}>LIFE <b style={{ color: tokens.cyan }}>ATHLETICS</b></div>
        <div style={{ ...mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>Today</div>
      </div>

      <div style={{ marginTop: 26 }}>
        {err && <p style={{ ...mono, fontSize: 12, color: tokens.gold }}>Couldn’t reach your data: {err}</p>}
        {!practice && !err && <p style={{ ...serif, color: tokens.ink3, fontSize: 15 }}>Loading the day…</p>}
        {practice && !running && (
          <PracticeCard practice={practice} log={log} onRun={() => setRunning(true)} onCadence={onCadence} />
        )}
        {practice && running && (
          <PracticeRun practice={practice} onLogged={onLogged} onClose={() => setRunning(false)} />
        )}
      </div>
    </div>
  )
}
