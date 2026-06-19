// Login.jsx — magic link. No passwords, matching the house auth.
import { useState } from 'react'
import { tokens, serif, mono } from '../lib/tokens'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [msg, setMsg] = useState('')

  async function send() {
    const e = email.trim()
    if (!e) return
    setState('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) { setState('error'); setMsg(error.message) }
    else { setState('sent') }
  }

  return (
    <div style={{
      minHeight: '100dvh', background: tokens.bg, color: tokens.ink, fontFamily: serif.fontFamily,
      backgroundImage: `radial-gradient(120% 70% at 50% 4%, ${tokens.glow}, transparent 56%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ ...mono, fontSize: 14, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase' }}>LIFE <b style={{ color: tokens.cyan }}>ATHLETICS</b></div>
        <h1 style={{ ...serif, fontSize: 27, fontWeight: 600, margin: '20px 0 0', lineHeight: 1.1 }}>Step onto the field.</h1>
        <p style={{ fontSize: 14, color: tokens.ink2, lineHeight: 1.5, margin: '9px 0 22px' }}>
          A sign-in link comes to your inbox. No password.
        </p>

        {state === 'sent' ? (
          <div style={{ border: `1px solid ${tokens.line}`, borderRadius: 12, background: tokens.panel, padding: '18px 18px' }}>
            <div style={{ ...mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: tokens.cyan }}>Check your inbox</div>
            <p style={{ fontSize: 14.5, color: tokens.ink, marginTop: 8, lineHeight: 1.5 }}>Sent a link to <b>{email.trim()}</b>. Open it on this device to land back here signed in.</p>
          </div>
        ) : (
          <>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder="you@email.com"
              style={{ width: '100%', padding: '13px 15px', ...serif, fontSize: 16, color: tokens.ink, background: tokens.panel2, border: `1px solid ${tokens.line}`, borderRadius: 11, outline: 'none' }}
            />
            <button onClick={send} disabled={state === 'sending'} style={{
              width: '100%', marginTop: 12, padding: 14, ...mono, fontSize: 13, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 40,
              color: tokens.bg, background: tokens.cyan, border: 'none', boxShadow: '0 0 18px rgba(95,226,238,0.25)',
              opacity: state === 'sending' ? 0.6 : 1,
            }}>{state === 'sending' ? 'Sending…' : 'Send my link →'}</button>
            {state === 'error' && <p style={{ ...mono, fontSize: 12, color: tokens.gold, marginTop: 12 }}>{msg}</p>}
          </>
        )}
      </div>
    </div>
  )
}
