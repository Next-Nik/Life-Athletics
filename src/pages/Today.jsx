// Today.jsx — the day. White ground, the lockup, the Money Moves card.
import { useEffect, useState, useCallback } from 'react'
import { tokens, sans } from '../lib/tokens'
import { ensureMoneyMoves, loadLog, logRep, setCadence } from '../lib/db'
import Wordmark from '../components/Wordmark'
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
    <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark font={16} />
        <div style={{ ...sans, fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>Today</div>
      </div>

      <div style={{ marginTop: 28 }}>
        {err && <p style={{ fontSize: 13, color: tokens.gold }}>Couldn’t load your day. {err}</p>}
        {!practice && !err && <p style={{ color: tokens.ink3, fontSize: 15 }}>Lining up today…</p>}
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
