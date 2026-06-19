// Scout.jsx — the self-scouting report.
import { useEffect, useState } from 'react'
import { tokens, serif, mono } from '../lib/tokens'
import { seedScouting, saveScouting } from '../lib/db'
import ScoutingDial from '../components/ScoutingDial'

export default function Scout({ userId }) {
  const [scouting, setScouting] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const rows = await seedScouting(userId)
        if (alive) setScouting(rows)
      } catch (e) { if (alive) setErr(e.message || String(e)) }
    })()
    return () => { alive = false }
  }, [userId])

  async function onSave(area, patch) {
    setScouting(rows => rows.map(r => r.area === area ? { ...r, ...rename(patch) } : r))
    try { await saveScouting(userId, area, patch) } catch (e) { setErr(e.message) }
  }

  return (
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '24px 20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ ...mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase' }}>LIFE <b style={{ color: tokens.cyan }}>ATHLETICS</b></div>
        <div style={{ ...mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>Scouting</div>
      </div>
      <h1 style={{ ...serif, fontSize: 26, fontWeight: 600, margin: '20px 0 4px' }}>Where you stand.</h1>
      <p style={{ fontSize: 13.5, color: tokens.ink2, lineHeight: 1.5, marginBottom: 18 }}>
        Solid web is now, dashed gold is headed. Tap an area, then drag to set it. Nothing moves but by your hand.
      </p>
      {err && <p style={{ ...mono, fontSize: 12, color: tokens.gold }}>Couldn’t reach your data: {err}</p>}
      {!scouting && !err && <p style={{ ...serif, color: tokens.ink3, fontSize: 15 }}>Loading the dial…</p>}
      {scouting && <ScoutingDial scouting={scouting} onSave={onSave} />}
    </div>
  )
}

// map the db patch keys back to the local row shape
function rename(patch) {
  const out = {}
  if (patch.now_value != null) out.now_value = patch.now_value
  if (patch.target_value != null) out.target_value = patch.target_value
  return out
}
