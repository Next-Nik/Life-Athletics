// ─────────────────────────────────────────────────────────────
// useSession.js — the session, no login step.
//
// The tables are RLS-scoped to auth.uid(), so the app still needs a
// session — but it makes one itself, anonymously, the moment it loads.
// No email, no password, no screen. The session persists across reloads,
// so you stay in. (Requires Anonymous sign-ins enabled in Supabase:
// Authentication → Providers → Anonymous.)
//
// Returns { session, user, loading, authError }.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let alive = true

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!alive) return
      if (data.session) { setSession(data.session); setLoading(false); return }

      // No session yet — create one anonymously. No email round trip.
      const { data: anon, error } = await supabase.auth.signInAnonymously()
      if (!alive) return
      if (error) { setAuthError(error.message || String(error)); setLoading(false); return }
      setSession(anon.session ?? null)
      setLoading(false)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (alive) setSession(s ?? null)
    })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  return { session, user: session?.user ?? null, loading, authError }
}
