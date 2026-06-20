// ─────────────────────────────────────────────────────────────
// Onboarding.jsx — the front door. Three beats: permission (are you
// allowed to live the life you want), name your game (the Title you're
// working toward), and a hand-off into the scout. On finish it writes the
// game line, flips onboarded, and starts the quarter clock.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { tokens, sans, display, eyebrow } from '../lib/tokens'
import Wordmark from './Wordmark'

function ymd(d = new Date()) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default function Onboarding({ onDone, save }) {
  const [beat, setBeat] = useState('permission')
  const [line, setLine] = useState('')
  const [busy, setBusy] = useState(false)

  async function grant() {
    setBusy(true)
    try { await save({ permission: true }) } finally { setBusy(false) }
    setBeat('game')
  }
  async function finish() {
    setBusy(true)
    try {
      await save({ game_line: line.trim() || null, onboarded: true, quarter_start: ymd() })
      onDone?.()
    } finally { setBusy(false) }
  }

  const Shell = ({ children }) => (
    <div style={{ minHeight: '100dvh', background: tokens.bg, color: tokens.ink, ...sans, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 26px' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', width: '100%' }}>
        <Wordmark font={16} />
        <div style={{ marginTop: 40 }}>{children}</div>
      </div>
    </div>
  )

  if (beat === 'permission') {
    return (
      <Shell>
        <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3 }}>Before anything else</div>
        <h1 style={{ ...display, fontSize: 34, lineHeight: 1.08, letterSpacing: '-0.02em', margin: '12px 0 0' }}>
          Are you allowed to live the life you actually want?
        </h1>
        <p style={{ fontSize: 16, color: tokens.ink2, lineHeight: 1.55, marginTop: 16 }}>
          Most people never give themselves permission. That&rsquo;s the first move. Everything here is built on it.
        </p>
        <button onClick={grant} disabled={busy} style={cta()}>Yes. Give myself permission</button>
      </Shell>
    )
  }

  if (beat === 'game') {
    return (
      <Shell>
        <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3 }}>Name your game</div>
        <h1 style={{ ...display, fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '12px 0 0' }}>
          What are you working toward?
        </h1>
        <p style={{ fontSize: 15, color: tokens.ink2, lineHeight: 1.55, marginTop: 14 }}>
          One line. The life you&rsquo;re training for. You can change it anytime.
        </p>
        <textarea
          value={line} onChange={e => setLine(e.target.value)} rows={3}
          placeholder="e.g. Strong, free, and present — building something that lasts."
          style={{ width: '100%', marginTop: 18, ...sans, fontSize: 17, lineHeight: 1.5, color: tokens.ink, background: '#fff', border: `1px solid ${tokens.line}`, borderRadius: 14, padding: '15px 16px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <button onClick={finish} disabled={busy} style={cta()}>See where I stand</button>
        <button onClick={finish} disabled={busy} style={{ ...sans, fontSize: 13, color: tokens.ink3, background: 'none', border: 'none', cursor: 'pointer', display: 'block', margin: '14px auto 0' }}>Skip for now</button>
      </Shell>
    )
  }

  return null
}

function cta() {
  return {
    width: '100%', marginTop: 28, padding: 16, ...sans, fontSize: 15, fontWeight: 600,
    letterSpacing: '0.01em', cursor: 'pointer', borderRadius: 980, color: '#fff',
    background: tokens.blue, border: 'none',
  }
}
