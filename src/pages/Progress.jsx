// ─────────────────────────────────────────────────────────────
// Progress.jsx — the scoreboard. White ground.
// The ladder made visible: Today (the match), This week (the series, best
// of seven), This quarter (90 days), and the Title — what you're working
// toward. All of it derived from the log; nothing here is stored.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { tokens, sans, display, eyebrow } from '../lib/tokens'
import { loadLogs } from '../lib/db'
import { useGame } from '../hooks/useGame'
import { dayWon, series, quarter, streak, dayHistory } from '../lib/scoring'
import Wordmark from '../components/Wordmark'

export default function Progress({ userId }) {
  const { game } = useGame(userId)
  const [log, setLog] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const rows = await loadLogs(userId, 120)
        if (alive) setLog(rows.map(r => ({ ...r, occurredAt: r.occurred_at })))
      } catch (e) { if (alive) setErr(e.message || String(e)) }
    })()
    return () => { alive = false }
  }, [userId])

  const ready = log && game
  const matchWon = ready ? dayWon(log) : false
  const wk = ready ? series(log) : { wins: 0, target: 4, clinched: false }
  const qStart = game?.quarter_start ? new Date(game.quarter_start) : new Date()
  const q = ready ? quarter(log, qStart) : { won: 0, elapsed: 0, length: 90, remaining: 90 }
  const cur = ready ? streak(log) : 0
  const hist = ready ? dayHistory(log, 28) : []

  return (
    <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark font={16} />
        <div style={{ ...sans, fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>Progress</div>
      </div>

      {/* Title */}
      <div style={{ marginTop: 22, padding: '24px 22px', borderRadius: 20, background: tokens.ink, color: '#fff' }}>
        <div style={{ ...eyebrow, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>The Title — what you're working toward</div>
        <div style={{ ...display, fontSize: 24, lineHeight: 1.2, marginTop: 10, color: '#fff' }}>
          {game?.game_line || 'Name your game in the You room.'}
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.16)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${q.length ? Math.round((q.elapsed / q.length) * 100) : 0}%`, background: tokens.gold }} />
          </div>
          <div style={{ ...sans, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 8 }}>
            Quarter day {q.elapsed} of {q.length} · {q.remaining} to go
          </div>
        </div>
      </div>

      {err && <p style={{ fontSize: 13, color: tokens.gold, marginTop: 16 }}>Couldn’t load the scoreboard. {err}</p>}
      {!ready && !err && <p style={{ color: tokens.ink3, fontSize: 15, marginTop: 20 }}>Tallying the board…</p>}

      {ready && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
            <Card label="Today" big={matchWon ? 'Won' : 'Open'} sub={matchWon ? 'a rep landed' : 'one rep wins it'} accent={matchWon ? tokens.blue : tokens.ink3} />
            <Card label="This week" big={`${wk.wins} / 7`} sub={wk.clinched ? 'series clinched' : `${wk.target} wins to clinch`} accent={wk.clinched ? '#3FA86A' : tokens.ink} />
            <Card label="This quarter" big={`${q.won}`} sub={`days won of ${q.elapsed}`} accent={tokens.ink} />
            <Card label="Streak" big={`${cur}`} sub={cur === 1 ? 'day in a row' : 'days in a row'} accent={tokens.blue} />
          </div>

          {/* 28-day climb */}
          <div style={{ marginTop: 20, padding: '20px 22px', border: `1px solid ${tokens.lineSoft}`, borderRadius: 18, background: tokens.panel, boxShadow: tokens.shadow }}>
            <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3, marginBottom: 12 }}>Last 28 days</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {hist.map((h, i) => {
                const today = i === hist.length - 1
                return <span key={i} style={{ width: 15, height: 15, borderRadius: 4, background: h ? tokens.blue : '#E8E8ED', border: `1px solid ${h ? tokens.blue : tokens.lineSoft}`, outline: today ? `1.5px solid ${tokens.gold}` : 'none', outlineOffset: 1.5 }} />
              })}
            </div>
            <div style={{ ...sans, fontSize: 11, fontWeight: 500, color: tokens.ink3, marginTop: 12 }}>gold = today</div>
          </div>
        </>
      )}
    </div>
  )
}

function Card({ label, big, sub, accent }) {
  return (
    <div style={{ padding: '18px 18px', border: `1px solid ${tokens.lineSoft}`, borderRadius: 18, background: tokens.panel, boxShadow: tokens.shadow }}>
      <div style={{ ...eyebrow, fontSize: 10.5, color: tokens.ink3 }}>{label}</div>
      <div style={{ ...display, fontSize: 30, lineHeight: 1, marginTop: 10, color: accent, fontVariantNumeric: 'tabular-nums' }}>{big}</div>
      <div style={{ ...sans, fontSize: 12.5, color: tokens.ink2, marginTop: 8 }}>{sub}</div>
    </div>
  )
}
