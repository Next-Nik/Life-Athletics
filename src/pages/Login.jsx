// Login.jsx — magic link, white ground, the mark.
import { useState } from 'react'
import { tokens, sans, display, eyebrow, ASSETS } from '../lib/tokens'
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
      email: e, options: { emailRedirectTo: window.location.origin },
    })
    if (error) { setState('error'); setMsg(error.message) }
    else { setState('sent') }
  }

  return (
    <div style={{
      minHeight: '100dvh', background: tokens.bg, color: tokens.ink, ...sans,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <img src={ASSETS.mark} alt="Life Athletics" width={88} height={88} style={{ display: 'block', margin: '0 auto 22px' }} />
        <div style={{ ...eyebrow, fontSize: 11, color: tokens.ink3 }}>The sport of living well</div>
        <h1 style={{ ...display, fontSize: 34, margin: '14px 0 0', lineHeight: 1.06, letterSpacing: '-0.01em' }}>
          Step onto<br />the field.
        </h1>
        <p style={{ fontSize: 15, color: tokens.ink2, lineHeight: 1.5, margin: '14px 0 24px' }}>
          A sign-in link lands in your inbox. Tap it and you&rsquo;re on the field &mdash; no password.
        </p>

        {state === 'sent' ? (
          <div style={{ border: `1px solid ${tokens.lineSoft}`, borderRadius: 16, background: tokens.bg2, padding: '18px 18px', textAlign: 'left' }}>
            <div style={{ ...eyebrow, fontSize: 11, color: tokens.blue }}>Check your inbox</div>
            <p style={{ fontSize: 14.5, color: tokens.ink, marginTop: 8, lineHeight: 1.5 }}>Sent a link to <b>{email.trim()}</b>. Open it on this device and you&rsquo;re back on the field.</p>
          </div>
        ) : (
          <>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder="you@email.com"
              style={{ width: '100%', padding: '14px 16px', ...sans, fontSize: 16, color: tokens.ink, background: tokens.bg2, border: `1px solid ${tokens.line}`, borderRadius: 12, outline: 'none', textAlign: 'center' }}
            />
            <button onClick={send} disabled={state === 'sending'} style={{
              width: '100%', marginTop: 12, padding: 14, ...sans, fontSize: 14, fontWeight: 600,
              letterSpacing: '0.02em', cursor: 'pointer', borderRadius: 980,
              color: '#fff', background: tokens.blue, border: 'none',
              opacity: state === 'sending' ? 0.6 : 1,
            }}>{state === 'sending' ? 'Sending…' : 'Send my link'}</button>
            {state === 'error' && <p style={{ fontSize: 12.5, color: tokens.gold, marginTop: 12 }}>{msg}</p>}
          </>
        )}
      </div>
    </div>
  )
}
