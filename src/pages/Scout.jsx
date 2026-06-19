// Scout.jsx — the self-scouting report. White ground, the lockup.
import { useEffect, useState } from 'react'
import { tokens, sans, display } from '../lib/tokens'
import { seedScouting, saveScouting } from '../lib/db'
import Wordmark from '../components/Wordmark'
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
    <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark font={16} />
        <div style={{ ...sans, fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>Scout</div>
      </div>
      <h1 style={{ ...display, fontSize: 30, margin: '24px 0 6px', letterSpacing: '-0.01em' }}>Are you winning your game?</h1>
      <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5, marginBottom: 20 }}>
        Nine areas, scouted honestly. The blue web is where you stand now; the dashed gold is where you&rsquo;re headed. Tap an area to read it, drag to move it. Only you move the markers.
      </p>
      {err && <p style={{ fontSize: 13, color: tokens.gold }}>Couldn’t load your dial. {err}</p>}
      {!scouting && !err && <p style={{ color: tokens.ink3, fontSize: 15 }}>Reading your game…</p>}
      {scouting && <ScoutingDial scouting={scouting} onSave={onSave} />}
    </div>
  )
}

function rename(patch) {
  const out = {}
  if (patch.now_value != null) out.now_value = patch.now_value
  if (patch.target_value != null) out.target_value = patch.target_value
  return out
}
