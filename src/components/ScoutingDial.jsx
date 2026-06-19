// ─────────────────────────────────────────────────────────────
// ScoutingDial.jsx — the self-scouting report, on white.
// Nine areas on a radar: solid blue web = now, dashed gold = headed.
// Tap an area to read it; drag the ramp to set Now or Headed. Dragging is
// the only writer; the system never moves a marker on its own.
// ─────────────────────────────────────────────────────────────
import { useMemo, useRef, useState } from 'react'
import { tokens, sans, display, eyebrow, ASSETS } from '../lib/tokens'
import { AREAS } from '../lib/areas'
import { GRADES, gradeIndex, gradeColor, gradeLabel, bandPos, gapLabel } from '../lib/scoring'

const cx = 160, cy = 160, r0 = 44, r1 = 140, labelR = 158
const N = AREAS.length
const ang = i => (-90 + i * (360 / N)) * Math.PI / 180
const rad = p => r0 + p * (r1 - r0)
const pt = (p, i) => ({ x: cx + rad(p) * Math.cos(ang(i)), y: cy + rad(p) * Math.sin(ang(i)) })

export default function ScoutingDial({ scouting, onSave }) {
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
  const [drag, setDrag] = useState({})

  const valOf = (key, field) => drag[`${key}:${field}`] ?? rows.find(r => r.key === key)[field]

  const nowPoly = rows.map((r, i) => { const p = pt(valOf(r.key, 'now'), i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')
  const tgtPoly = rows.map((r, i) => { const p = pt(valOf(r.key, 'target'), i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')

  const cur = rows[sel]
  const nowV = valOf(cur.key, 'now')
  const tgtV = valOf(cur.key, 'target')

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
    setNh(Math.abs(v - nowV) <= Math.abs(v - tgtV) ? 'now' : 'headed')
    dragging.current = true
    rampRef.current.setPointerCapture?.(e.pointerId)
    applyDrag(v)
  }
  function onMove(e) { if (dragging.current) applyDrag(rampVal(e)) }
  function onUp() { if (dragging.current) { dragging.current = false; commit() } }

  const W = 520
  const gi = gradeIndex(nowV)

  return (
    <div>
      {/* dial */}
      <div style={{ position: 'relative', border: `1px solid ${tokens.lineSoft}`, borderRadius: 22, background: tokens.panel, boxShadow: tokens.shadow, padding: '18px 12px 12px' }}>
        <img src={ASSETS.mark} alt="" aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', width: 116, height: 116, transform: 'translate(-50%,-50%)', opacity: 0.06, pointerEvents: 'none' }} />
        <svg viewBox="-34 -24 388 388" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible', position: 'relative' }}>
          {[0.25, 0.5, 0.75, 1].map((b, z) => (
            <circle key={z} cx={cx} cy={cy} r={rad(b)} fill="none" stroke={z % 2 ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)'} strokeWidth="1" />
          ))}
          {rows.map((_, i) => {
            const a = ang(i)
            return <line key={i} x1={cx + r0 * Math.cos(a)} y1={cy + r0 * Math.sin(a)} x2={cx + r1 * Math.cos(a)} y2={cy + r1 * Math.sin(a)} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          })}
          <polygon points={tgtPoly} fill="none" stroke={tokens.gold} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="4 4" />
          <polygon points={nowPoly} fill={tokens.blue} fillOpacity="0.08" stroke={tokens.blue} strokeOpacity="0.55" strokeWidth="1.5" />
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
                <circle cx={p.x} cy={p.y} r="4.6" fill={c} />
                {i === sel && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={tokens.ink} strokeOpacity="0.5" strokeWidth="1.25" />}
                <text x={lx} y={ly + dy} textAnchor={anchor} style={{ ...sans, fontSize: 11, fontWeight: 600, fill: tokens.ink, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.label}</text>
                <text x={lx} y={ly + dy + 14} textAnchor={anchor} style={{ ...sans, fontSize: 9.5, fontWeight: 500, fill: i === sel ? c : tokens.ink3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{gradeLabel(r.now)}</text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={r0 - 6} fill="rgba(0,0,0,0.015)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          <text x={cx} y={cy + 4} textAnchor="middle" style={{ ...sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', fill: tokens.ink2, textTransform: 'uppercase' }}>YOU</text>
        </svg>
      </div>

      {/* read panel */}
      <div style={{ marginTop: 16, border: `1px solid ${tokens.lineSoft}`, borderRadius: 22, background: tokens.panel, boxShadow: tokens.shadow, padding: '22px 24px' }}>
        <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3 }}>The Read</div>
        <h2 style={{ ...display, fontSize: 30, margin: '8px 0 0', lineHeight: 1.05, letterSpacing: '-0.01em' }}>{cur.label}</h2>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 12, border: `1px solid ${tokens.line}`, borderRadius: 999, padding: '6px 14px', ...sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: tokens.ink }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: gradeColor(nowV) }} />
          {gradeLabel(nowV)}
        </span>

        {/* ramp */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ ...sans, fontSize: 11, fontWeight: 500, color: tokens.ink3 }}>Drag either marker</span>
            <div style={{ display: 'inline-flex', border: `1px solid ${tokens.line}`, borderRadius: 999, padding: 3 }}>
              {['now', 'headed'].map(k => {
                const on = nh === k
                return (
                  <button key={k} onClick={() => setNh(k)} style={{
                    ...sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                    border: 0, borderRadius: 999, padding: '5px 13px', cursor: 'pointer',
                    color: on ? '#fff' : tokens.ink2, background: on ? (k === 'now' ? tokens.blue : tokens.gold) : 'transparent',
                  }}>{k}</button>
                )
              })}
            </div>
          </div>
          <svg ref={rampRef} viewBox="0 0 520 120" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ display: 'block', width: '100%', height: 'auto', cursor: 'ew-resize', touchAction: 'none' }}>
            <path d="M0,100 L0,74 C175,66 350,36 520,28 L520,100 Z" fill={`${gradeColor(nowV)}1A`} stroke={gradeColor(nowV)} strokeOpacity="0.5" strokeWidth="1" />
            {[130, 260, 390].map(x => <line key={x} x1={x} y1="24" x2={x} y2="104" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />)}
            <line x1="0" y1="100" x2="520" y2="100" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
            {GRADES.map((g, k) => <text key={g} x={65 + k * 130} y="90" textAnchor="middle" style={{ ...sans, fontSize: 12.5, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase', fill: k === gi ? gradeColor(nowV) : tokens.ink3 }}>{g}</text>)}
            <line x1={nowV * W} y1="22" x2={nowV * W} y2="106" stroke={tokens.blue} strokeWidth="2.6" />
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
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${tokens.lineSoft}` }}>
          <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3 }}>Train the gap</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: tokens.blue, marginTop: 8 }}>{cur.prescribe}</div>
        </div>
      </div>
    </div>
  )
}
