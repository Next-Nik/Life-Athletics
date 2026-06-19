// ─────────────────────────────────────────────────────────────
// PracticeCard.jsx — a practice at rest. White Apple card, soft lift.
// Area + name + ask, spec tags, cadence pills, streak/best/last-28, and
// the 28-day strip with today flagged gold. All derived from the log.
// ─────────────────────────────────────────────────────────────
import { tokens, sans, display, eyebrow } from '../lib/tokens'
import { CADENCES, cadenceLabel } from '../lib/practiceModel'
import { streak, bestStreak, dayHistory } from '../lib/scoring'

export default function PracticeCard({ practice, log, onRun, onCadence }) {
  const history = dayHistory(log, 28)
  const cur = streak(log)
  const best = Math.max(bestStreak(history), cur)
  const last28 = history.filter(Boolean).length
  const doneToday = history[history.length - 1]

  const tag = (k, v) => (
    <span style={{ ...sans, fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: tokens.ink3, border: `1px solid ${tokens.line}`, borderRadius: 999, padding: '5px 11px' }}>
      {k} <b style={{ color: tokens.ink, fontWeight: 600 }}>{v}</b>
    </span>
  )

  return (
    <div style={{ border: `1px solid ${tokens.lineSoft}`, borderRadius: 20, background: tokens.panel, boxShadow: tokens.shadow, overflow: 'hidden' }}>
      <div style={{ padding: '26px 24px 0' }}>
        <div style={{ ...eyebrow, fontSize: 11, color: tokens.gold }}>Money · Power pillar</div>
        <div style={{ ...display, fontSize: 30, lineHeight: 1.05, marginTop: 9, letterSpacing: '-0.01em' }}>{practice.label}</div>
        <div style={{ fontSize: 15, color: tokens.ink2, lineHeight: 1.55, marginTop: 11 }}>{practice.ask}</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 18 }}>
          {tag('run', practice.run_mode)}{tag('log', practice.log_type)}
          {tag('entrance', practice.entrance)}
          <span style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: tokens.ink, border: `1px solid ${tokens.line}`, borderRadius: 999, padding: '5px 11px' }}>{practice.source}</span>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3, marginBottom: 9 }}>Cadence</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CADENCES.map(c => {
              const on = practice.cadence === c.key
              return (
                <button key={c.key} onClick={() => onCadence?.(c.key)} style={{
                  ...sans, fontSize: 12.5, letterSpacing: '0.01em', cursor: 'pointer',
                  color: on ? '#fff' : tokens.ink2, background: on ? tokens.blue : 'transparent',
                  border: `1px solid ${on ? tokens.blue : tokens.line}`, borderRadius: 999, padding: '7px 14px',
                  fontWeight: on ? 600 : 500,
                }}>{cadenceLabel(c.key)}</button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 34, padding: '22px 24px 0' }}>
        <Stat v={cur} k="Day streak" accent />
        <Stat v={best} k="Best" />
        <Stat v={last28} k="Last 28" />
      </div>

      <div style={{ padding: '18px 24px 4px' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {history.map((h, i) => {
            const today = i === history.length - 1
            return (
              <span key={i} style={{
                width: 14, height: 14, borderRadius: 4, display: 'inline-block',
                background: h ? tokens.blue : '#E8E8ED',
                border: `1px solid ${h ? tokens.blue : tokens.lineSoft}`,
                outline: today ? `1.5px solid ${tokens.gold}` : 'none', outlineOffset: 1.5,
              }} />
            )
          })}
        </div>
        <div style={{ ...sans, fontSize: 11, fontWeight: 500, letterSpacing: '0.02em', color: tokens.ink3, marginTop: 10 }}>Last 28 days · gold = today</div>
      </div>

      <button onClick={onRun} style={{
        width: 'calc(100% - 48px)', margin: '22px 24px 24px', padding: 14, ...sans,
        fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', cursor: 'pointer', borderRadius: 980,
        color: doneToday ? tokens.blue : '#fff',
        background: doneToday ? 'transparent' : tokens.blue,
        border: doneToday ? `1px solid ${tokens.blue}` : 'none',
      }}>{doneToday ? 'Done today · run again' : "Run today's moves"}</button>
    </div>
  )
}

function Stat({ v, k, accent }) {
  return (
    <div>
      <div style={{ ...display, fontWeight: accent ? 400 : 300, fontSize: 30, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: accent ? tokens.blue : tokens.ink }}>{v}</div>
      <div style={{ ...sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: tokens.ink3, marginTop: 6 }}>{k}</div>
    </div>
  )
}
