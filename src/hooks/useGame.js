// ─────────────────────────────────────────────────────────────
// useGame.js — the purpose layer. One hook that loads (and ensures) the
// user's game row: what they're working toward, the quarter clock, and
// whether they've been through the front door. Returns { game, loading,
// save, reload }.
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react'
import { ensureGame, saveGame } from '../lib/db'

export function useGame(userId) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try { setGame(await ensureGame(userId)) }
    finally { setLoading(false) }
  }, [userId])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try { const g = await ensureGame(userId); if (alive) setGame(g) }
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive = false }
  }, [userId])

  const save = useCallback(async (fields) => {
    const next = await saveGame(userId, fields)
    setGame(next)
    return next
  }, [userId])

  return { game, loading, save, reload }
}
