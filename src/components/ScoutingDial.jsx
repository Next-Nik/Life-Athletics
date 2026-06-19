// ─────────────────────────────────────────────────────────────
// ScoutingDial.jsx — the self-scouting report.
//
// The whole-life view: nine areas on a radar, the solid web is where
// each stands now, the dashed gold web is where it's headed. The space
// between is the quarter's training. Tap an area to read it; drag the
// ramp to set Now or Headed. Dragging is the only writer — saveScouting
// fires on release. The system never moves a marker on its own.
//
// Geometry ported from scouting-report-v3, widened from eight spokes to
// nine (40° each).
// ─────────────────────────────────────────────────────────────
import { useMemo, useRef, useState } from 'react'
import { tokens, serif, mono } from '../lib/tokens'
import { AREAS } from '../lib/areas'
import { GRADES, gradeIndex, gradeColor, gradeLabel, bandPos, gapLabel } from '../lib/scoring'

const cx = 160, cy = 160, r0 = 44, r1 = 140, labelR = 158
const N = AREAS.length
const ang = i => (-90 + i * (360 / N)) * Math.PI / 180
const rad = p => r0 + p * (r1 - r0)
const pt = (p, i) => ({ x: cx + rad(p) * Math.cos(ang(i)), y: cy + rad(p) * Math.sin(ang(i)) })

export default function ScoutingDial({ scouting, onSave }) {
  // merge area order with stored values
  const rows = useMemo(() => AREAS.map(a => {
    const s = scouting.find(r => r.area === a.key) || {}
    return {
      key: a.key, label: a.label,
      now: s.now_value ?? 0, target: s.target_value ?? 0,
      read: s.read_note ?? a.seed.read,
      prescribe: s.prescribe ?? `${a.seed.prescribe.verb} · ${a.seed.prescribe.line}`,
    }
  }), [scouting])

  const [sel, setSel] = useState(rows.findIndex(r => r.key === 'money'))
  const [nh, setNh] = useState('now')
  // local optimistic values while dragging
  const [drag, setDrag] = useState({}) // { 'money:now': 0.4 }

  const valOf = (key, field) => drag[`${key}:${field}`] ?? rows.find(r => r.key === key)[field]

  const nowPoly = rows.map((r, i) => { const p = pt(valOf(r.key, 'now'), i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')
  const tgtPoly = rows.map((r, i) => { const p = pt(valOf(r.key, 'target'), i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')

  const cur = rows[sel]
  const nowV = valOf(cur.key, 'now')
  const tgtV = valOf(cur.key, 'target')

  // ── ramp drag ──
  const rampRef = useRef(null)
  const dragging = useRef(false)
  function rampVal(e) {
    const r = rampRef.current.getBoundingClientRect()
    const x = e.touches ? e.touches[0].clientX : e.clientX
    return Math.max(0, Math.min(1, (x - r.left) / r.width))
  }
  function applyDrag(v) {
    setDrag(d => ({ ...d, [`${cur.key}:${nh === 'now' ? 'now' : 'target'}`]: v }))
  }
  function commit() {
    const field = nh === 'now' ? 'now_value' : 'target_value'
    onSave?.(cur.key, { [field]: valOf(cur.key, nh === 'now' ? 'now' : 'target') })
  }
  function onDown(e) {
    const v = rampVal(e)
    // grab whichever marker is nearer
    setNh(Math.abs(v - nowV) <= Math.abs(v - tgtV) ? 'now' : 'headed')
    dragging.current = true
    rampRef.current.setPointerCapture?.(e.pointerId)
    applyDrag(v)
  }
  function onMove(e) { if (dragging.current) applyDrag(rampVal(e)) }
  function onUp() { if (dragging.current) { dragging.current = false; commit() } }

  const W = 520
  const gi = gradeIndex(nowV), ti = gradeIndex(tgtV)

  return (
    <div>
      {/* dial */}
      <div style={{ border: `1px solid ${tokens.line}`, borderRadius: 18, background: `linear-gradient(180deg, ${tokens.bgLift}, rgba(8,10,14,0.6))`, padding: '18px 12px 12px' }}>
        <svg viewBox="-34 -24 388 388" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}>
          {/* bands */}
          {[0.25, 0.5, 0.75, 1].map((b, z) => (
            <circle key={z} cx={cx} cy={cy} r={rad(b)} fill="none" stroke={z % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.022)'} strokeWidth="1" />
          ))}
          {/* spokes */}
          {rows.map((_, i) => {
            const a = ang(i)
            return <line key={i} x1={cx + r0 * Math.cos(a)} y1={cy + r0 * Math.sin(a)} x2={cx + r1 * Math.cos(a)} y2={cy + r1 * Math.sin(a)} stroke={tokens.line} strokeWidth="1" />
          })}
          {/* target web (dashed gold) */}
          <polygon points={tgtPoly} fill="none" stroke={tokens.gold} strokeOpacity="0.34" strokeWidth="1" strokeDasharray="4 4" />
          {/* now web */}
          <polygon points={nowPoly} fill={tokens.cyan} fillOpacity="0.05" stroke={tokens.cyan} strokeOpacity="0.3" strokeWidth="1.25" />
          {/* markers + labels */}
          {rows.map((r, i) => {
            const p = pt(r.now, i), tp = pt(r.target, i)
            const a = ang(i), cos = Math.cos(a), sin = Math.sin(a)
            const lx = cx + labelR * cos, ly = cy + labelR * sin
            const anchor = cos > 0.34 ? 'start' : cos < -0.34 ? 'end' : 'middle'
            const dy = Math.abs(cos) <= 0.34 ? (sin < 0 ? -4 : 12) : 0
            const c = gradeColor(r.now)
            return (
              <g key={r.key} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
                <circle cx={tp.x} cy={tp.y} r="3.2" fill="none" stroke={tokens.gold} strokeWidth="1.4" />
                <circle cx={p.x} cy={p.y} r="4.4" fill={c} style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
                {i === sel && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={tokens.ink} strokeOpacity="0.55" strokeWidth="1.25" />}
                <text x={lx} y={ly + dy} textAnchor={anchor} style={{ ...serif, fontSize: 12, fontWeight: 500, fill: tokens.ink, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{r.label}</text>
                <text x={lx} y={ly + dy + 14} textAnchor={anchor} style={{ ...mono, fontSize: 9.5, fill: i === sel ? c : tokens.ink3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{gradeLabel(r.now)}</text>
              </g>
            )
          })}
          {/* hub */}
          <circle cx={cx} cy={cy} r={r0 - 6} fill="rgba(255,255,255,0.015)" stroke={tokens.line} strokeWidth="1" />
          <text x={cx} y={cy + 4} textAnchor="middle" style={{ ...mono, fontSize: 10, letterSpacing: '0.18em', fill: tokens.ink2, textTransform: 'uppercase' }}>YOU</text>
        </svg>
      </div>

      {/* read panel */}
      <div style={{ marginTop: 16, border: `1px solid ${tokens.line}`, borderRadius: 18, background: tokens.panel, padding: '20px 22px' }}>
        <div style={{ ...mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: tokens.ink3 }}>The Read</div>
        <h2 style={{ ...serif, fontSize: 30, fontWeight: 600, margin: '8px 0 0', lineHeight: 1.05 }}>{cur.label}</h2>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 12, border: `1px solid ${tokens.line}`, borderRadius: 999, padding: '6px 14px', ...mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: tokens.ink }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: gradeColor(nowV), boxShadow: `0 0 9px ${gradeColor(nowV)}` }} />
          {gradeLabel(nowV)}
        </span>

        {/* ramp */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ ...mono, fontSize: 11, color: tokens.ink3 }}>Drag either marker</span>
            <div style={{ display: 'inline-flex', border: `1px solid ${tokens.line}`, borderRadius: 999, padding: 3 }}>
              {['now', 'headed'].map(k => {
                const on = nh === k
                return (
                  <button key={k} onClick={() => setNh(k)} style={{
                    ...mono, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                    border: 0, borderRadius: 999, padding: '5px 13px', cursor: 'pointer',
                    color: on ? tokens.bg : tokens.ink2, background: on ? (k === 'now' ? tokens.cyan : tokens.gold) : 'transparent',
                  }}>{k}</button>
                )
              })}
            </div>
          </div>
          <svg ref={rampRef} viewBox="0 0 520 120" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ display: 'block', width: '100%', height: 'auto', cursor: 'ew-resize', touchAction: 'none' }}>
            <path d="M0,100 L0,74 C175,66 350,36 520,28 L520,100 Z" fill={`${gradeColor(nowV)}1A`} stroke={gradeColor(nowV)} strokeOpacity="0.45" strokeWidth="1" />
            {[130, 260, 390].map(x => <line key={x} x1={x} y1="24" x2={x} y2="104" stroke={tokens.line} strokeWidth="1" />)}
            <line x1="0" y1="100" x2="520" y2="100" stroke={tokens.lineStrong} strokeWidth="1" />
            {GRADES.map((g, k) => <text key={g} x={65 + k * 130} y="90" textAnchor="middle" style={{ ...serif, fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', fill: k === gi ? gradeColor(nowV) : tokens.ink3 }}>{g}</text>)}
            {/* needle (now) */}
            <line x1={nowV * W} y1="22" x2={nowV * W} y2="106" stroke={gradeColor(nowV)} strokeWidth="2.4" style={{ filter: `drop-shadow(0 0 6px ${gradeColor(nowV)})` }} />
            {/* target */}
            <line x1={tgtV * W} y1="22" x2={tgtV * W} y2="106" stroke={tokens.gold} strokeWidth="1.8" strokeDasharray="3 3" />
            <polygon points={`${tgtV * W - 6},22 ${tgtV * W + 6},22 ${tgtV * W},30`} fill={tokens.gold} />
          </svg>
          <p style={{ fontSize: 14, color: tokens.ink2, marginTop: 12 }}>
            Now <b style={{ color: gradeColor(nowV) }}>{gradeLabel(nowV)}, {bandPos(nowV)}</b>
            &nbsp;→&nbsp; Headed <b style={{ color: tokens.gold }}>{gradeLabel(tgtV)}, {bandPos(tgtV)}</b>
            &nbsp;· <span style={{ color: tokens.gold }}>{gapLabel(nowV, tgtV)}</span>
          </p>
        </div>

        <p style={{ fontSize: 16, lineHeight: 1.5, color: tokens.ink, marginTop: 18 }}>{cur.read}</p>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${tokens.line}` }}>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: tokens.ink3 }}>Train the gap</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: tokens.cyan, marginTop: 8 }}>{cur.prescribe}</div>
        </div>
      </div>
    </div>
  )
}
