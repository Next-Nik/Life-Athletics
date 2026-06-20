// ─────────────────────────────────────────────────────────────
// ScoutingDial.jsx — the self-scouting report, on white.
// Nine areas on a radar: solid blue web = now, dashed gold = where you're
// headed. Tap an area to read it. The ramp sets Now, This quarter, or
// Someday — dragging is the only writer. Under the read sit the area's
// practices (switch them on) and the standard (what winning looks like).
// ─────────────────────────────────────────────────────────────
import { useMemo, useRef, useState } from 'react'
import { tokens, sans, display, eyebrow, ASSETS } from '../lib/tokens'
import { AREAS } from '../lib/areas'
import { score10, scoreColor, gapLabel } from '../lib/scoring'
import TrainingTool from './TrainingTool'

const cx = 160, cy = 160, r0 = 44, r1 = 140, labelR = 160
const N = AREAS.length
const ang = i => (-90 + i * (360 / N)) * Math.PI / 180
const rad = p => r0 + p * (r1 - r0)
const pt = (p, i) => ({ x: cx + rad(p) * Math.cos(ang(i)), y: cy + rad(p) * Math.sin(ang(i)) })

const KIND_FIELD = { now: 'now_value', target: 'target_value', horizon: 'horizon_value' }
const KIND_LABEL = { now: 'Now', target: 'This quarter', horizon: 'Someday' }

export default function ScoutingDial({ scouting, onSave, practices = [], logsBy = {}, onToggle, onCadence, onSaveSteps, onRun, onLog, onAdd }) {
  const rows = useMemo(() => AREAS.map(a => {
    const s = scouting.find(r => r.area === a.key) || {}
    return {
      key: a.key, label: a.label,
      now: s.now_value ?? 0, target: s.target_value ?? 0, horizon: s.horizon_value ?? 0,
      read: s.read_note ?? a.seed.read,
      standard: s.standard ?? '',
    }
  }), [scouting])

  const [sel, setSel] = useState(0)
  const [nh, setNh] = useState('now')
  const [drag, setDrag] = useState({})
  const [stdDraft, setStdDraft] = useState(null)
  const [readDraft, setReadDraft] = useState(null)

  const valOf = (key, kind) => drag[`${key}:${kind}`] ?? rows.find(r => r.key === key)[kind]

  const nowPoly = rows.map((r, i) => { const p = pt(valOf(r.key, 'now'), i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')
  const tgtPoly = rows.map((r, i) => { const p = pt(valOf(r.key, 'target'), i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')

  const cur = rows[sel]
  const nowV = valOf(cur.key, 'now')
  const tgtV = valOf(cur.key, 'target')
  const horV = valOf(cur.key, 'horizon')

  const rampRef = useRef(null)
  const dragging = useRef(false)
  const W = 520

  function rampVal(e) {
    const r = rampRef.current.getBoundingClientRect()
    const x = e.touches ? e.touches[0].clientX : e.clientX
    const raw = Math.max(0, Math.min(1, (x - r.left) / r.width))
    return Math.round(raw * 10) / 10 // snap to whole 0–10 points
  }
  function applyDrag(v) { setDrag(d => ({ ...d, [`${cur.key}:${nh}`]: v })) }
  function commit() { onSave?.(cur.key, { [KIND_FIELD[nh]]: valOf(cur.key, nh) }) }
  function nearest(v) {
    const ds = [['now', nowV], ['target', tgtV], ['horizon', horV]]
    ds.sort((a, b) => Math.abs(a[1] - v) - Math.abs(b[1] - v))
    return ds[0][0]
  }
  function onDown(e) {
    const v = rampVal(e)
    setNh(nearest(v))
    dragging.current = true
    rampRef.current.setPointerCapture?.(e.pointerId)
    // apply on next tick so nh is set
    setDrag(d => ({ ...d, [`${cur.key}:${nearest(v)}`]: v }))
  }
  function onMove(e) { if (dragging.current) applyDrag(rampVal(e)) }
  function onUp() { if (dragging.current) { dragging.current = false; commit() } }

  return (
    <div>
      {/* dial */}
      <div style={{ position: 'relative', border: `1px solid ${tokens.lineSoft}`, borderRadius: 22, background: tokens.panel, boxShadow: tokens.shadow, padding: '18px 12px 12px' }}>
        <img src={ASSETS.mark} alt="" aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', width: 116, height: 116, transform: 'translate(-50%,-50%)', opacity: 0.05, pointerEvents: 'none' }} />
        <svg viewBox="-40 -28 400 400" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible', position: 'relative' }}>
          {[0.25, 0.5, 0.75, 1].map((b, z) => (
            <circle key={z} cx={cx} cy={cy} r={rad(b)} fill="none" stroke={b === 1 ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)'} strokeWidth="1" />
          ))}
          {rows.map((_, i) => {
            const a = ang(i)
            return <line key={i} x1={cx + r0 * Math.cos(a)} y1={cy + r0 * Math.sin(a)} x2={cx + r1 * Math.cos(a)} y2={cy + r1 * Math.sin(a)} stroke="rgba(0,0,0,0.09)" strokeWidth="1" />
          })}
          <polygon points={tgtPoly} fill="none" stroke={tokens.gold} strokeOpacity="0.9" strokeWidth="1.6" strokeDasharray="5 4" />
          <polygon points={nowPoly} fill={tokens.blue} fillOpacity="0.1" stroke={tokens.blue} strokeOpacity="0.85" strokeWidth="2" />
          {rows.map((r, i) => {
            const p = pt(valOf(r.key, 'now'), i), tp = pt(valOf(r.key, 'target'), i)
            const a = ang(i), cos = Math.cos(a), sin = Math.sin(a)
            const lx = cx + labelR * cos, ly = cy + labelR * sin
            const anchor = cos > 0.34 ? 'start' : cos < -0.34 ? 'end' : 'middle'
            const dy = Math.abs(cos) <= 0.34 ? (sin < 0 ? -5 : 13) : 0
            const c = scoreColor(valOf(r.key, 'now'))
            return (
              <g key={r.key} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
                <circle cx={tp.x} cy={tp.y} r="3.4" fill="#fff" stroke={tokens.gold} strokeWidth="2.2" />
                <circle cx={p.x} cy={p.y} r="4.6" fill={c} stroke="#fff" strokeWidth="1.3" />
                {i === sel && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={tokens.blue} strokeOpacity="0.7" strokeWidth="1.6" />}
                <text x={lx} y={ly + dy} textAnchor={anchor} style={{ ...sans, fontSize: 13.5, fontWeight: 600, fill: tokens.ink }}>{r.label}</text>
                <text x={lx} y={ly + dy + 13} textAnchor={anchor} style={{ ...sans, fontSize: 11, fontWeight: 700, fill: c }}>{score10(valOf(r.key, 'now'))}</text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={r0 - 6} fill="#F5F5F7" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
        </svg>
      </div>

      {/* legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...sans, fontSize: 13, color: tokens.ink }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: tokens.blue }} /> Where you are
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...sans, fontSize: 13, color: tokens.ink }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', border: `2.5px solid ${tokens.gold}`, boxSizing: 'border-box' }} /> Where you want to be
        </span>
      </div>

      {/* read panel */}
      <div style={{ marginTop: 16, border: `1px solid ${tokens.lineSoft}`, borderRadius: 22, background: tokens.panel, boxShadow: tokens.shadow, padding: '22px 24px' }}>
        <h2 style={{ ...display, fontSize: 30, margin: 0, lineHeight: 1.05, letterSpacing: '-0.01em' }}>{cur.label}</h2>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 12, border: `1px solid ${tokens.line}`, borderRadius: 999, padding: '6px 14px', ...sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', color: tokens.ink }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: scoreColor(nowV) }} />
          {score10(nowV)} / 10
        </span>

        {/* ramp */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ ...sans, fontSize: 11, fontWeight: 500, color: tokens.ink3 }}>Drag to set</span>
            <div style={{ display: 'inline-flex', border: `1px solid ${tokens.line}`, borderRadius: 999, padding: 3 }}>
              {['now', 'target', 'horizon'].map(k => {
                const on = nh === k
                const bg = k === 'now' ? tokens.blue : tokens.gold
                return (
                  <button key={k} onClick={() => setNh(k)} style={{
                    ...sans, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.01em',
                    border: 0, borderRadius: 999, padding: '5px 11px', cursor: 'pointer',
                    color: on ? '#fff' : tokens.ink2, background: on ? bg : 'transparent',
                  }}>{KIND_LABEL[k]}</button>
                )
              })}
            </div>
          </div>
          <svg ref={rampRef} viewBox="0 0 520 120" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ display: 'block', width: '100%', height: 'auto', cursor: 'ew-resize', touchAction: 'none' }}>
            <path d="M0,100 L0,74 C175,66 350,36 520,28 L520,100 Z" fill={scoreColor(nowV)} fillOpacity="0.1" stroke={scoreColor(nowV)} strokeOpacity="0.5" strokeWidth="1" />
            {[130, 260, 390].map(x => <line key={x} x1={x} y1="24" x2={x} y2="104" stroke="rgba(0,0,0,0.10)" strokeWidth="1" />)}
            <line x1="0" y1="100" x2="520" y2="100" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
            <text x="6" y="90" textAnchor="start" style={{ ...sans, fontSize: 12.5, fontWeight: 600, fill: tokens.ink3 }}>0</text>
            <text x="260" y="90" textAnchor="middle" style={{ ...sans, fontSize: 12.5, fontWeight: 600, fill: tokens.ink3 }}>5</text>
            <text x="514" y="90" textAnchor="end" style={{ ...sans, fontSize: 12.5, fontWeight: 600, fill: tokens.ink3 }}>10</text>
            {/* someday (faint) */}
            <line x1={horV * W} y1="30" x2={horV * W} y2="104" stroke={tokens.gold} strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="2 4" />
            <circle cx={horV * W} cy="26" r="4" fill="none" stroke={tokens.gold} strokeOpacity="0.55" strokeWidth="1.5" />
            {/* this quarter */}
            <line x1={tgtV * W} y1="22" x2={tgtV * W} y2="106" stroke={tokens.gold} strokeWidth="2" strokeDasharray="3 3" />
            <polygon points={`${tgtV * W - 6},22 ${tgtV * W + 6},22 ${tgtV * W},30`} fill={tokens.gold} />
            {/* now */}
            <line x1={nowV * W} y1="22" x2={nowV * W} y2="106" stroke={tokens.blue} strokeWidth="2.8" />
          </svg>
          <p style={{ fontSize: 14, color: tokens.ink2, marginTop: 12 }}>
            Now <b style={{ color: scoreColor(nowV) }}>{score10(nowV)}</b>
            &nbsp;→&nbsp; This quarter <b style={{ color: tokens.gold }}>{score10(tgtV)}</b>
            &nbsp;· <span style={{ color: tokens.gold }}>{gapLabel(nowV, tgtV)}</span>
          </p>
        </div>

        {/* the read — yours to write */}
        <div style={{ marginTop: 18 }}>
          <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3, marginBottom: 9 }}>The read</div>
          <textarea
            value={readDraft != null ? readDraft : cur.read}
            onChange={e => setReadDraft(e.target.value)}
            onFocus={() => setReadDraft(cur.read)}
            onBlur={() => { if (readDraft != null && readDraft !== cur.read) onSave?.(cur.key, { read_note: readDraft }); setReadDraft(null) }}
            placeholder="Where's this at right now? In your words."
            rows={2}
            style={{ width: '100%', ...sans, fontSize: 15, lineHeight: 1.5, color: tokens.ink, background: tokens.bg, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* the standard */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${tokens.lineSoft}` }}>
          <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3, marginBottom: 9 }}>What winning looks like here</div>
          <textarea
            value={stdDraft != null ? stdDraft : cur.standard}
            onChange={e => setStdDraft(e.target.value)}
            onFocus={() => setStdDraft(cur.standard)}
            onBlur={() => { if (stdDraft != null && stdDraft !== cur.standard) onSave?.(cur.key, { standard: stdDraft }); setStdDraft(null) }}
            placeholder="Define Strong for you. The bar you're holding yourself to."
            rows={2}
            style={{ width: '100%', ...sans, fontSize: 15, lineHeight: 1.5, color: tokens.ink, background: tokens.bg, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* the bridge: this area's training tool */}
        {onToggle && (
          <TrainingTool
            key={cur.key}
            areaKey={cur.key}
            practices={practices}
            logsBy={logsBy}
            onToggle={onToggle}
            onCadence={onCadence}
            onSaveSteps={onSaveSteps}
            onRun={onRun}
            onLog={onLog}
            onAdd={onAdd}
          />
        )}
      </div>
    </div>
  )
}
