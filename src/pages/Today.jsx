// ─────────────────────────────────────────────────────────────
// Today.jsx — the day. White ground, the lockup.
//
// Whatever practices are switched on, grouped by time of day, each run
// or logged with one tap. Steps practices (Money Moves) open the walk;
// everything else logs done. The composer lives one tap away. Done-state
// and streaks are read from the log; the day's line is frozen so a
// half-finished day resumes.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react'
import { tokens, sans, display, eyebrow } from '../lib/tokens'
import { areaByKey } from '../lib/areas'
import { groupByEntrance, hasRunner } from '../lib/day'
import {
  seedPractices, loadPractices, loadLogs, logRep,
  setActive, setCadence, createPractice, ensureDayLine,
} from '../lib/db'
import { dayWon, streak } from '../lib/scoring'
import Wordmark from '../components/Wordmark'
import RunRouter from '../components/RunRouter'
import DayComposer from '../components/DayComposer'

export default function Today({ userId }) {
  const [practices, setPractices] = useState(null)
  const [logsBy, setLogsBy] = useState({})
  const [running, setRunning] = useState(null)
  const [managing, setManaging] = useState(false)
  const [err, setErr] = useState(null)

  const reload = useCallback(async () => {
    const [ps, logs] = await Promise.all([loadPractices(userId), loadLogs(userId, 60)])
    const by = {}
    for (const r of logs) {
      ;(by[r.practice_id] ||= []).push({ ...r, occurredAt: r.occurred_at })
    }
    setPractices(ps)
    setLogsBy(by)

    // freeze the active line per entrance, best effort — never blocks render
    const active = ps.filter(p => p.active)
    const groups = groupByEntrance(active)
    groups.forEach(g => {
      ensureDayLine(userId, g.entrance, g.items.map(p => p.id)).catch(() => {})
    })
  }, [userId])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await seedPractices(userId)
        if (alive) await reload()
      } catch (e) { if (alive) setErr(e.message || String(e)) }
    })()
    return () => { alive = false }
  }, [userId, reload])

  async function onDone(p) {
    try { await logRep(userId, p, {}); await reload() }
    catch (e) { setErr(e.message) }
  }
  async function onRunLogged(p, out) {
    const note = out?.line || out?.capture || out?.reframe || null
    try { await logRep(userId, p, { payload: out || {}, note }); await reload() }
    catch (e) { setErr(e.message) }
    setRunning(null)
  }
  async function onToggle(p, active) {
    setPractices(list => list.map(x => x.id === p.id ? { ...x, active } : x))
    try { await setActive(p.id, active); await reload() } catch (e) { setErr(e.message) }
  }
  async function onAdd(area, label) {
    try { await createPractice(userId, { area, label }); await reload() } catch (e) { setErr(e.message) }
  }

  if (running) {
    return (
      <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
        <RunRouter practice={running} onLogged={(out) => onRunLogged(running, out)} onClose={() => setRunning(null)} />
      </div>
    )
  }

  const active = (practices || []).filter(p => p.active)
  const groups = groupByEntrance(active)
  const doneCount = active.filter(p => dayWon(logsBy[p.id] || [])).length

  return (
    <div style={{ maxWidth: 472, margin: '0 auto', padding: '22px 22px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark font={16} />
        <div style={{ ...sans, fontWeight: 600, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: tokens.ink3 }}>Today</div>
      </div>

      {managing ? (
        <DayComposer
          practices={practices || []}
          onToggle={onToggle}
          onAdd={onAdd}
          onClose={() => setManaging(false)}
        />
      ) : (
        <>
          <h1 style={{ ...display, fontSize: 32, margin: '22px 0 0', letterSpacing: '-0.02em' }}>Today</h1>
          {active.length > 0 && (
            <div style={{ display: 'inline-block', ...sans, fontSize: 12.5, color: tokens.ink2, background: tokens.bg2, borderRadius: 999, padding: '6px 14px', marginTop: 12 }}>
              <b style={{ color: tokens.ink, fontWeight: 600 }}>{doneCount} of {active.length}</b> done today
            </div>
          )}

          {err && <p style={{ fontSize: 13, color: tokens.gold, marginTop: 16 }}>Something went wrong. {err}</p>}
          {!practices && !err && <p style={{ color: tokens.ink3, fontSize: 15, marginTop: 22 }}>Lining up today…</p>}

          {practices && active.length === 0 && (
            <div style={{ marginTop: 28, padding: '26px 22px', border: `1px solid ${tokens.lineSoft}`, borderRadius: 18, background: tokens.bg2, textAlign: 'center' }}>
              <p style={{ fontSize: 16, color: tokens.ink, lineHeight: 1.5 }}>Your day is empty.</p>
              <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5, marginTop: 6 }}>Switch on the practices you want to train.</p>
            </div>
          )}

          {groups.map(g => (
            <div key={g.entrance} style={{ marginTop: 26 }}>
              <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3, marginBottom: 10 }}>{g.label}</div>
              {g.items.map(p => (
                <PracticeRow
                  key={p.id}
                  practice={p}
                  log={logsBy[p.id] || []}
                  onDone={() => onDone(p)}
                  onRun={() => setRunning(p)}
                />
              ))}
            </div>
          ))}

          {practices && (
            <button onClick={() => setManaging(true)} style={{
              width: '100%', marginTop: 26, padding: 15, ...sans, fontSize: 14, fontWeight: 600,
              letterSpacing: '0.02em', cursor: 'pointer', borderRadius: 14,
              color: tokens.ink2, background: 'none', border: `1px dashed ${tokens.line}`,
            }}>Compose your day</button>
          )}
        </>
      )}
    </div>
  )
}

function PracticeRow({ practice, log, onDone, onRun }) {
  const area = areaByKey(practice.area)
  const done = dayWon(log)
  const cur = streak(log)
  const runner = hasRunner(practice)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px',
      border: `1px solid ${tokens.lineSoft}`, borderRadius: 16, marginBottom: 10,
      background: tokens.panel, boxShadow: tokens.shadow,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: area?.accent || tokens.blue, flex: '0 0 auto' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...sans, fontSize: 15.5, fontWeight: 500, color: tokens.ink }}>{practice.label}</div>
        <div style={{ ...sans, fontSize: 12.5, color: tokens.ink3, marginTop: 2 }}>
          {area?.label}{cur > 0 ? ` · ${cur} ${cur === 1 ? 'day' : 'days'} in a row` : ''}
        </div>
      </div>
      {runner ? (
        <button onClick={onRun} style={btn(done)}>{done ? 'Again' : 'Run'}</button>
      ) : (
        <button onClick={done ? undefined : onDone} disabled={done} style={btn(done)}>{done ? 'Done ✓' : 'Done'}</button>
      )}
    </div>
  )
}

function btn(done) {
  return {
    flex: '0 0 auto', ...sans, fontSize: 13, fontWeight: 600, letterSpacing: '0.02em',
    cursor: done ? 'default' : 'pointer', borderRadius: 980, padding: '9px 18px',
    color: done ? tokens.strong || '#3FA86A' : '#fff',
    background: done ? 'transparent' : tokens.blue,
    border: done ? `1px solid ${tokens.strong || '#3FA86A'}` : 'none',
  }
}
