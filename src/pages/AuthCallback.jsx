// ─────────────────────────────────────────────────────────────
// AuthCallback.jsx — the landing pad after Google (or an email link).
// The Supabase client auto-exchanges the code in the URL on load, so we
// just wait for a session to appear and drop the user into the app.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { tokens, sans } from '../lib/tokens'
import Wordmark from '../components/Wordmark'

export default function AuthCallback() {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    let done = false
    const go = () => { if (!done) { done = true; window.location.replace('/') } }

    supabase?.auth.getSession().then(({ data }) => { if (data.session?.user) go() })
    const { data: sub } = supabase?.auth.onAuthStateChange((_e, s) => { if (s?.user) go() }) || { data: { subscription: { unsubscribe() {} } } }

    const t = setTimeout(() => { if (!done) setStuck(true) }, 6000)
    return () => { clearTimeout(t); sub.subscription.unsubscribe() }
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: tokens.bg, color: tokens.ink, ...sans, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', textAlign: 'center' }}>
      <div style={{ maxWidth: 360 }}>
        <Wordmark />
        {!stuck ? (
          <p style={{ fontSize: 15, color: tokens.ink3, marginTop: 18 }}>Signing you in&hellip;</p>
        ) : (
          <p style={{ fontSize: 14.5, color: tokens.ink2, lineHeight: 1.55, marginTop: 18 }}>
            That took longer than it should. <a href="/login" style={{ color: tokens.brassInk }}>Head back to sign in.</a>
          </p>
        )}
      </div>
    </div>
  )
}
