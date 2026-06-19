// ─────────────────────────────────────────────────────────────
// App.jsx — the first thing that serves.
//
// Not the product yet. A deliberate deploy check: it renders the LA
// design language straight from the locked tokens, reads the nine areas
// from the content table, and reports whether Supabase is wired. Aim a
// test subdomain at this, confirm it serves and the env is set, then
// the Money slice gets built on top.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { tokens, serif, mono } from './lib/tokens'
import { AREAS } from './lib/areas'
import { supabase, supabaseConfigured } from './lib/supabase'

function Row({ label, ok, note }) {
  const dot = ok === null ? tokens.ink3 : ok ? tokens.cyan : tokens.gold
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: `1px solid ${tokens.line}` }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, boxShadow: ok ? `0 0 8px ${dot}` : 'none', flex: '0 0 auto' }} />
      <span style={{ ...mono, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: tokens.ink2, flex: 1 }}>{label}</span>
      <span style={{ ...mono, fontSize: 12, color: tokens.ink3 }}>{note}</span>
    </div>
  )
}

export default function App() {
  const [db, setDb] = useState(supabaseConfigured ? null : false)

  useEffect(() => {
    let alive = true
    if (!supabase) return
    supabase.auth.getSession()
      .then(() => { if (alive) setDb(true) })
      .catch(() => { if (alive) setDb(false) })
    return () => { alive = false }
  }, [])

  return (
    <div style={{
      minHeight: '100dvh', background: tokens.bg, color: tokens.ink,
      fontFamily: serif.fontFamily, WebkitFontSmoothing: 'antialiased',
      backgroundImage: `radial-gradient(120% 70% at 50% 4%, ${tokens.glow}, transparent 56%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ ...mono, fontSize: 13, letterSpacing: '0.26em', textTransform: 'uppercase' }}>
          LIFE <b style={{ color: tokens.cyan }}>ATHLETICS</b>
        </div>
        <div style={{ ...mono, fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: tokens.ink3, marginTop: 18 }}>
          Deploy check
        </div>
        <h1 style={{ fontWeight: 600, fontSize: 30, lineHeight: 1.08, margin: '8px 0 0' }}>
          The stack is serving.
        </h1>
        <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5, margin: '10px 0 26px' }}>
          The shell is up and rendering the design language. When the panel below is all live,
          the engine slice goes on top.
        </p>

        <div style={{ background: tokens.panel, border: `1px solid ${tokens.line}`, borderRadius: 14, padding: '6px 18px 14px' }}>
          <Row label="Build & render" ok={true} note="vite · react" />
          <Row label="Design tokens" ok={true} note="dark · cyan/gold" />
          <Row label="Areas loaded" ok={AREAS.length === 9} note={`${AREAS.length} of 9`} />
          <Row
            label="Supabase"
            ok={db}
            note={db === null ? 'checking…' : db ? 'reachable' : supabaseConfigured ? 'unreachable' : 'set VITE_ env vars'}
          />
        </div>

        <p style={{ ...mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: tokens.ink3, lineHeight: 1.7, marginTop: 22 }}>
          {supabaseConfigured
            ? 'env wired · safe to point a subdomain here'
            : 'add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in vercel'}
        </p>
      </div>
    </div>
  )
}
