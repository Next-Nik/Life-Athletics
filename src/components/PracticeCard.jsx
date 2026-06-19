// ─────────────────────────────────────────────────────────────
// PracticeCard.jsx — a practice at rest.
//
// The card the day shows before you run. Area + name + ask, the spec
// tags (run/log/entrance/source), the cadence pills, the streak/best/
// last-28 stats, and the 28-day history strip with today flagged gold.
// All of it reads the practice object and the derived log — nothing is
// stored that can be computed.
// ─────────────────────────────────────────────────────────────
import { tokens, serif, mono } from '../lib/tokens'
import { CADENCES, cadenceLabel } from '../lib/practiceModel'
import { streak, bestStreak, dayHistory } from '../lib/scoring'

export default function PracticeCard({ practice, log, onRun, onCadence }) {
  const history = dayHistory(log, 28)
  const cur = streak(log)
  const best = Math.max(bestStreak(history), cur)
  const last28 = history.filter(Boolean).length
  const doneToday = history[history.length - 1]

  const tag = (k, v) => (
    <span style={{ ...mono, fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: tokens.ink3, border: `1px solid ${tokens.line}`, borderRadius: 999, padding: '4px 10px' }}>
      {k} <b style={{ color: tokens.ink2, fontWeight: 700 }}>{v}</b>
    </span>
  )

  return (
    <div style={{ border: `1px solid ${tokens.line}`, borderRadius: 16, background: tokens.panel, overflow: 'hidden' }}>
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ ...mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: tokens.gold }}>
          Money · Power pillar
        </div>
        <div style={{ ...serif, fontSize: 25, fontWeight: 600, lineHeight: 1.1, marginTop: 5 }}>{practice.label}</div>
        <div style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.55, marginTop: 9 }}>{practice.ask}</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
          {tag('run', practice.run_mode)}{tag('log', practice.log_type)}
          {tag('entrance', practice.entrance)}
          <span style={{ ...mono, fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: tokens.ink2, border: `1px solid ${tokens.line}`, borderRadius: 999, padding: '4px 10px', fontWeight: 700 }}>{practice.source}</span>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ ...mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: tokens.ink3, marginBottom: 8 }}>Cadence</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {CADENCES.map(c => {
              const on = practice.cadence === c.key
              return (
                <button key={c.key} onClick={() => onCadence?.(c.key)} style={{
                  ...mono, fontSize: 12, letterSpacing: '0.03em', cursor: 'pointer',
                  color: on ? tokens.bg : tokens.ink2, background: on ? tokens.cyan : 'transparent',
                  border: `1px solid ${on ? tokens.cyan : tokens.line}`, borderRadius: 999, padding: '6px 13px',
                  fontWeight: on ? 700 : 400,
                }}>{cadenceLabel(c.key)}</button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 30, padding: '18px 20px 0' }}>
        <Stat v={cur} k="Day streak" accent />
        <Stat v={best} k="Best" />
        <Stat v={last28} k="Last 28" />
      </div>

      <div style={{ padding: '16px 20px 4px' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {history.map((h, i) => {
            const today = i === history.length - 1
            return (
              <span key={i} style={{
                width: 13, height: 13, borderRadius: 4, display: 'inline-block',
                background: h ? tokens.cyan : 'rgba(255,255,255,0.06)',
                border: `1px solid ${h ? tokens.cyan : tokens.line}`,
                boxShadow: h ? '0 0 6px rgba(95,226,238,0.5)' : 'none',
                outline: today ? `1.5px solid ${tokens.gold}` : 'none', outlineOffset: 1,
              }} />
            )
          })}
        </div>
        <div style={{ ...mono, fontSize: 11, letterSpacing: '0.05em', color: tokens.ink3, marginTop: 9 }}>Last 28 days · gold = today</div>
      </div>

      <button onClick={onRun} style={{
        width: 'calc(100% - 40px)', margin: '18px 20px 20px', padding: 14, ...mono,
        fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        cursor: 'pointer', borderRadius: 40,
        color: doneToday ? tokens.cyan : tokens.bg,
        background: doneToday ? 'transparent' : tokens.cyan,
        border: doneToday ? `1px solid ${tokens.cyan}` : 'none',
        boxShadow: doneToday ? 'none' : '0 0 18px rgba(95,226,238,0.25)',
      }}>{doneToday ? 'Done today · run again' : "Run today's moves →"}</button>
    </div>
  )
}

function Stat({ v, k, accent }) {
  return (
    <div>
      <div style={{ ...serif, fontSize: 24, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: accent ? tokens.cyan : tokens.ink }}>{v}</div>
      <div style={{ ...mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: tokens.ink3, marginTop: 5 }}>{k}</div>
    </div>
  )
}
