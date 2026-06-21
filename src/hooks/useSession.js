// ─────────────────────────────────────────────────────────────
// useSession.js — the session.
//
// Tracks the Supabase auth session and nothing more. No auto sign-in:
// a visitor with no session sees the Login screen (Continue with Google,
// email, or a one-tap guest pass). The tables are RLS-scoped to
// auth.uid(), so a session is still required — it's just chosen now,
// the NextUs way, instead of created silently.
//
// Returns { session, user, loading, authError }.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [authError] = useState(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let alive = true

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (alive) setSession(s ?? null)
    })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  return { session, user: session?.user ?? null, loading, authError }
}
