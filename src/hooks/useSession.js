// ─────────────────────────────────────────────────────────────
// useSession.js — the auth session.
//
// One hook the app reads to know who (if anyone) is signed in. The
// tables are RLS-scoped to auth.uid(), so nothing persists until there
// is a session. Returns { session, user, loading }.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseConfigured)

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

  return { session, user: session?.user ?? null, loading }
}
