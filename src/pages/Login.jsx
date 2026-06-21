// ─────────────────────────────────────────────────────────────
// Login.jsx — the front door, the NextUs way: one-tap Google first,
// email as the fallback, and a one-tap guest pass so the frictionless
// start LA always had is still there. Radiant skin.
//
// Needs, in the LA Supabase project:
//   • Authentication → Providers → Google  (enabled, with the OAuth
//     client + this app's URL in the redirect allow-list)
//   • Authentication → Providers → Anonymous  (for the guest pass)
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { tokens, sans, serif, eyebrow } from '../lib/tokens'
import Wordmark from '../components/Wordmark'

const card = {
  width: '100%', maxWidth: 380, background: tokens.panel, border: `1px solid ${tokens.line}`,
  borderRadius: 22, boxShadow: tokens.shadow, padding: '30px 26px 28px', position: 'relative', overflow: 'hidden',
}
const input = {
  width: '100%', padding: '13px 15px', background: tokens.bg, border: `1px solid ${tokens.line}`,
  borderRadius: 12, ...sans, fontSize: 16, color: tokens.ink, outline: 'none', marginBottom: 11, boxSizing: 'border-box',
}
const label = { ...eyebrow, fontSize: 9.5, color: tokens.ink2, display: 'block', marginBottom: 7 }

function GoogleButton() {
  async function go() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }
  return (
    <button onClick={go} style={{
      width: '100%', padding: '13px 16px', background: tokens.panel, border: `1.5px solid ${tokens.line}`,
      borderRadius: 12, ...sans, fontWeight: 600, fontSize: 15, color: tokens.ink, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Continue with Google
    </button>
  )
}

export default function Login() {
  const [mode, setMode] = useState('signin')   // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [busyGuest, setBusyGuest] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function signIn() {
    if (!email || !password) { setError('Enter your email and password.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message.toLowerCase().includes('not confirmed') ? 'Confirm your email first — check your inbox.' : 'Email or password incorrect.'); return }
    window.location.replace('/')
  }

  async function signUp() {
    if (!email || !password) { setError('Fill in your email and password.'); return }
    if (password.length < 8) { setError('Password needs at least 8 characters.'); return }
    if (password !== confirm) { setError("Passwords don't match."); return }
    setLoading(true); setError(''); setNotice('')
    const { error: upErr } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (upErr && !upErr.message.toLowerCase().includes('already registered')) { setLoading(false); setError(upErr.message); return }
    const { error: inErr } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (inErr?.message?.toLowerCase().includes('not confirmed')) { setNotice('Almost there — check your email, click the link, then come back.'); return }
    if (inErr) { setError('That account exists. Use the right password, or reset it.'); return }
    window.location.replace('/')
  }

  async function guest() {
    setBusyGuest(true); setError('')
    const { error } = await supabase.auth.signInAnonymously()
    if (error) { setBusyGuest(false); setError('Guest start needs Anonymous sign-ins on in Supabase.'); return }
    window.location.replace('/')
  }

  const isUp = mode === 'signup'

  return (
    <div style={{ minHeight: '100dvh', background: tokens.bg, color: tokens.ink, ...sans, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ marginBottom: 22 }}><Wordmark font={22} /></div>
      <div style={card}>
        <div style={{ position: 'absolute', top: -70, right: -50, width: 220, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${tokens.skySoft}, transparent 70%)`, pointerEvents: 'none' }} />
        <h1 style={{ ...serif, fontWeight: 500, fontSize: 27, letterSpacing: '-0.01em', margin: 0, color: tokens.ink, position: 'relative' }}>
          {isUp ? 'Start training.' : 'Welcome back.'}
        </h1>
        <p style={{ ...sans, fontSize: 14.5, color: tokens.ink2, marginTop: 6, marginBottom: 22, lineHeight: 1.5 }}>
          {isUp ? 'One account. Your standing, your protocols, your cycle, kept.' : 'Pick up where you left off.'}
        </p>

        <GoogleButton />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: tokens.line }} />
          <span style={{ ...eyebrow, fontSize: 9.5, color: tokens.ink3 }}>or</span>
          <div style={{ flex: 1, height: 1, background: tokens.line }} />
        </div>

        <label style={label}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && !isUp && signIn()} placeholder="you@email.com" autoComplete="email" style={input} />
        <label style={label}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && !isUp && signIn()} placeholder={isUp ? 'At least 8 characters' : '••••••••'} autoComplete={isUp ? 'new-password' : 'current-password'} style={input} />
        {isUp && (<><label style={label}>Confirm password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" style={input} /></>)}

        <button onClick={isUp ? signUp : signIn} disabled={loading} style={{
          width: '100%', padding: 15, marginTop: 4, background: tokens.ink, color: tokens.bg, border: 0, borderRadius: 12,
          ...sans, fontWeight: 700, fontSize: 15, letterSpacing: '0.02em', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.55 : 1,
        }}>{loading ? 'One moment…' : isUp ? 'Create account' : 'Sign in'}</button>

        {notice && <p style={{ ...sans, fontSize: 13.5, color: tokens.skyInk, marginTop: 12, lineHeight: 1.5 }}>{notice}</p>}
        {error && <p style={{ ...sans, fontSize: 13.5, color: tokens.copperInk, marginTop: 12, lineHeight: 1.5 }}>{error}</p>}

        <button onClick={() => { setMode(isUp ? 'signin' : 'signup'); setError(''); setNotice('') }} style={{
          width: '100%', marginTop: 16, background: 'transparent', border: 0, ...sans, fontSize: 13.5, color: tokens.ink2, cursor: 'pointer',
        }}>{isUp ? 'Have an account? Sign in' : "New here? Create an account"}</button>
      </div>

      <button onClick={guest} disabled={busyGuest} style={{
        marginTop: 18, background: 'transparent', border: 0, ...sans, fontSize: 13, color: tokens.ink3, cursor: busyGuest ? 'default' : 'pointer', textDecoration: 'underline',
      }}>{busyGuest ? 'Starting…' : 'Just looking? Continue as guest'}</button>
    </div>
  )
}
