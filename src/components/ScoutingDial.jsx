// ─────────────────────────────────────────────────────────────
// ScoutingDial.jsx — the Scout, as the radiant instrument.
// Nine areas on a dial: the now-shape lit from the centre, the headed
// shape a clean gold ring around it. The centre glows — radiance, the
// becoming. Tap an area to read it; the ramp sets Now / This quarter /
// Someday, and dragging is the only writer. Under the read sits the
// area's training. Data contract is unchanged from before.
// ─────────────────────────────────────────────────────────────
import { useMemo, useRef, useState } from 'react'
import { tokens, sans, display, eyebrow } from '../lib/tokens'
import { AREAS } from '../lib/areas'
import { score10, gapLabel } from '../lib/scoring'
import TrainingTool from './TrainingTool'

const cx = 160, cy = 160, r0 = 40, r1 = 140, labelR = 160
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
      read: s.read_note ?? (a.seed?.read || ''),
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
    return Math.round(raw * 10) / 10
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
    setDrag(d => ({ ...d, [`${cur.key}:${nearest(v)}`]: v }))
  }
  function onMove(e) { if (dragging.current) applyDrag(rampVal(e)) }
  function onUp() { if (dragging.current) { dragging.current = false; commit() } }

  return (
    <div>
      {/* the dial */}
      <div style={{ position: 'relative', border: `1px solid ${tokens.line}`, borderRadius: 22, background: tokens.panel, boxShadow: tokens.shadow, padding: '18px 12px 12px', overflow: 'hidden' }}>
        <svg viewBox="-40 -28 400 400" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible', position: 'relative' }}>
          <defs>
            <radialGradient id="laCore" cx={cx} cy={cy} r={r1} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={tokens.sky} stopOpacity="0.80" />
              <stop offset="32%" stopColor={tokens.sky} stopOpacity="0.30" />
              <stop offset="70%" stopColor={tokens.sky} stopOpacity="0.07" />
              <stop offset="100%" stopColor={tokens.sky} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="laNow" cx={cx} cy={cy} r={r1} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6CB6FF" stopOpacity="0.60" />
              <stop offset="55%" stopColor={tokens.sky} stopOpacity="0.30" />
              <stop offset="100%" stopColor={tokens.cobalt} stopOpacity="0.18" />
            </radialGradient>
            <radialGradient id="laSpark" cx={cx} cy={cy} r="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EAF4FF" stopOpacity="1" />
              <stop offset="100%" stopColor={tokens.sky} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* radiant core */}
          <circle cx={cx} cy={cy} r={r1 + 6} fill="url(#laCore)" />

          {/* rings */}
          {[0.25, 0.5, 0.75, 1].map((b, z) => (
            <circle key={z} cx={cx} cy={cy} r={rad(b)} fill="none" stroke={b === 1 ? 'rgba(24,19,12,0.18)' : 'rgba(24,19,12,0.10)'} strokeWidth="1" />
          ))}
          {/* pulse rings */}
          <circle cx={cx} cy={cy} r={r0 + 30} fill="none" stroke={tokens.sky} strokeOpacity="0.16" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={r0 + 14} fill="none" stroke={tokens.sky} strokeOpacity="0.24" strokeWidth="1" />

          {/* spokes */}
          {rows.map((_, i) => {
            const a = ang(i)
            return <line key={i} x1={cx + r0 * Math.cos(a)} y1={cy + r0 * Math.sin(a)} x2={cx + r1 * Math.cos(a)} y2={cy + r1 * Math.sin(a)} stroke="rgba(24,19,12,0.09)" strokeWidth="1" />
          })}

          {/* HEADED — gold ring: glow underlay + clean line */}
          <polygon points={tgtPoly} fill="none" stroke={tokens.goldHi} strokeOpacity="0.22" strokeWidth="5" strokeLinejoin="round" />
          <polygon points={tgtPoly} fill="none" stroke={tokens.brass} strokeWidth="1.7" strokeLinejoin="round" />

          {/* NOW — lit from the centre */}
          <polygon points={nowPoly} fill="url(#laNow)" stroke={tokens.graphite} strokeWidth="1.9" strokeLinejoin="round" />

          {/* markers + labels */}
          {rows.map((r, i) => {
            const p = pt(valOf(r.key, 'now'), i), tp = pt(valOf(r.key, 'target'), i)
            const a = ang(i), cos = Math.cos(a), sin = Math.sin(a)
            const lx = cx + labelR * cos, ly = cy + labelR * sin
            const anchor = cos > 0.34 ? 'start' : cos < -0.34 ? 'end' : 'middle'
            const dy = Math.abs(cos) <= 0.34 ? (sin < 0 ? -5 : 13) : 0
            return (
              <g key={r.key} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
                <circle cx={tp.x} cy={tp.y} r="3.2" fill={tokens.panel} stroke={tokens.brass} strokeWidth="2.2" />
                {i === sel && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={tokens.sky} strokeOpacity="0.8" strokeWidth="1.8" />}
                <circle cx={p.x} cy={p.y} r="4.4" fill={tokens.graphite} stroke={tokens.panel} strokeWidth="1.3" />
                <text x={lx} y={ly + dy} textAnchor={anchor} style={{ ...sans, fontSize: 13, fontWeight: 600, fill: i === sel ? tokens.ink : tokens.ink2 }}>{r.label}</text>
                <text x={lx} y={ly + dy + 13} textAnchor={anchor} style={{ ...mono(), fontSize: 11, fontWeight: 600, fill: tokens.ink2 }}>{score10(valOf(r.key, 'now'))}</text>
              </g>
            )
          })}

          {/* radiant heart */}
          <circle cx={cx} cy={cy} r="26" fill="url(#laSpark)" />
          <circle cx={cx} cy={cy} r="7" fill="none" stroke="#CDE6FF" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="2.6" fill="#F2F9FF" />
        </svg>
      </div>

      {/* legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...sans, fontSize: 12.5, color: tokens.ink2 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: tokens.graphite }} /> Now
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...sans, fontSize: 12.5, color: tokens.ink2 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', border: `2px solid ${tokens.brass}`, boxSizing: 'border-box' }} /> Headed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...sans, fontSize: 12.5, color: tokens.ink2 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: `radial-gradient(circle, ${tokens.sky}, transparent 62%)` }} /> Radiance
        </span>
      </div>

      {/* read panel */}
      <div style={{ marginTop: 16, border: `1px solid ${tokens.line}`, borderRadius: 22, background: tokens.panel, boxShadow: tokens.shadow, padding: '22px 22px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -70, right: -50, width: 220, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${tokens.skySoft}, transparent 70%)`, pointerEvents: 'none' }} />
        <h2 style={{ ...display, fontSize: 31, margin: 0, lineHeight: 1.02, position: 'relative', color: tokens.ink }}>{cur.label}</h2>

        {/* now / headed numerals */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18 }}>
          <div>
            <div style={{ ...eyebrow, fontSize: 9.5, color: tokens.ink2, marginBottom: 5 }}>Now</div>
            <div style={{ ...mono(), fontWeight: 600, fontSize: 40, lineHeight: 0.85, color: tokens.ink }}>{score10(nowV)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...eyebrow, fontSize: 9.5, color: tokens.brassInk, marginBottom: 5 }}>Headed</div>
            <div style={{ ...mono(), fontWeight: 600, fontSize: 40, lineHeight: 0.85, color: tokens.goldHi, textShadow: '0 2px 18px rgba(216,158,28,0.4)' }}>{score10(tgtV)}</div>
          </div>
        </div>

        {/* the ramp — drag to set */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ ...sans, fontSize: 11, fontWeight: 500, color: tokens.ink3 }}>Drag to set</span>
            <div style={{ display: 'inline-flex', border: `1px solid ${tokens.line}`, borderRadius: 999, padding: 3 }}>
              {['now', 'target', 'horizon'].map(k => {
                const on = nh === k
                const bg = k === 'now' ? tokens.graphite : tokens.brass
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
            <defs>
              <linearGradient id="laRamp" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={tokens.cobalt} />
                <stop offset="60%" stopColor={tokens.sky} />
                <stop offset="100%" stopColor="#41A6F2" />
              </linearGradient>
            </defs>
            {/* faint full ramp */}
            <path d="M0,100 L0,74 C175,66 350,36 520,28 L520,100 Z" fill="rgba(24,19,12,0.06)" />
            {/* climbed portion, clipped to now via width rect mask-free: draw ramp then overlay */}
            <clipPath id="laClip"><rect x="0" y="0" width={nowV * W} height="120" /></clipPath>
            <path d="M0,100 L0,74 C175,66 350,36 520,28 L520,100 Z" fill="url(#laRamp)" clipPath="url(#laClip)" />
            {[130, 260, 390].map(x => <line key={x} x1={x} y1="24" x2={x} y2="104" stroke="rgba(24,19,12,0.10)" strokeWidth="1" />)}
            <line x1="0" y1="100" x2="520" y2="100" stroke="rgba(24,19,12,0.18)" strokeWidth="1" />
            <text x="6" y="90" textAnchor="start" style={{ ...mono(), fontSize: 12.5, fontWeight: 600, fill: tokens.ink3 }}>0</text>
            <text x="260" y="90" textAnchor="middle" style={{ ...mono(), fontSize: 12.5, fontWeight: 600, fill: tokens.ink3 }}>5</text>
            <text x="514" y="90" textAnchor="end" style={{ ...mono(), fontSize: 12.5, fontWeight: 600, fill: tokens.ink3 }}>10</text>
            {/* someday (faint) */}
            <line x1={horV * W} y1="30" x2={horV * W} y2="104" stroke={tokens.brass} strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="2 4" />
            <circle cx={horV * W} cy="26" r="4" fill="none" stroke={tokens.brass} strokeOpacity="0.55" strokeWidth="1.5" />
            {/* this quarter */}
            <line x1={tgtV * W} y1="22" x2={tgtV * W} y2="106" stroke={tokens.brass} strokeWidth="2" strokeDasharray="4 3" />
            <circle cx={tgtV * W} cy="26" r="6.5" fill={tokens.panel} stroke={tokens.brass} strokeWidth="3" />
            {/* now */}
            <line x1={nowV * W} y1="22" x2={nowV * W} y2="106" stroke={tokens.sky} strokeWidth="2.8" />
            <circle cx={nowV * W} cy="26" r="7" fill={tokens.sky} stroke={tokens.panel} strokeWidth="3" />
          </svg>
          <p style={{ ...sans, fontSize: 13.5, color: tokens.ink2, marginTop: 12 }}>
            Now <b style={{ ...mono(), color: tokens.ink }}>{score10(nowV)}</b>
            &nbsp;→&nbsp; This quarter <b style={{ ...mono(), color: tokens.brassInk }}>{score10(tgtV)}</b>
            &nbsp;· <span style={{ color: tokens.brassInk }}>{gapLabel(nowV, tgtV)}</span>
          </p>
        </div>

        {/* the read — yours to write */}
        <div style={{ marginTop: 18 }}>
          <div style={{ ...eyebrow, fontSize: 10, color: tokens.ink2, marginBottom: 9 }}>The read</div>
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

        {/* the standard — what good looks like here, your words */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${tokens.lineSoft}` }}>
          <div style={{ ...eyebrow, fontSize: 10, color: tokens.ink2, marginBottom: 9 }}>What good looks like here</div>
          <textarea
            value={stdDraft != null ? stdDraft : cur.standard}
            onChange={e => setStdDraft(e.target.value)}
            onFocus={() => setStdDraft(cur.standard)}
            onBlur={() => { if (stdDraft != null && stdDraft !== cur.standard) onSave?.(cur.key, { standard: stdDraft }); setStdDraft(null) }}
            placeholder="The bar you're holding yourself to, in your own words."
            rows={2}
            style={{ width: '100%', ...sans, fontSize: 15, lineHeight: 1.5, color: tokens.ink, background: tokens.bg, border: `1px solid ${tokens.line}`, borderRadius: 12, padding: '12px 14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* the bridge: this area's training */}
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

// local helper so we can spread mono() as a style object
function mono() { return { fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontVariantNumeric: 'tabular-nums' } }
