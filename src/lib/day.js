// ─────────────────────────────────────────────────────────────
// day.js — the day's organising axis.
//
// Practices belong to an *area* (their content) but surface by *time of
// day* (the entrance). The day is read top to bottom: morning, midday,
// evening, anytime. This file is the only place that order and those
// labels live, so the day surface and the composer agree.
// ─────────────────────────────────────────────────────────────

export const ENTRANCE_ORDER = ['morning', 'midday', 'evening', 'anytime']

export const ENTRANCE_LABELS = {
  morning: 'Morning',
  midday:  'Midday',
  evening: 'Evening',
  anytime: 'Anytime',
}

// Group a flat practice list into ordered entrance sections, each sorted
// by position. Empty sections are dropped.
export function groupByEntrance(practices) {
  const groups = {}
  for (const e of ENTRANCE_ORDER) groups[e] = []
  for (const p of practices) {
    const e = ENTRANCE_ORDER.includes(p.entrance) ? p.entrance : 'anytime'
    groups[e].push(p)
  }
  for (const e of ENTRANCE_ORDER) {
    groups[e].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  }
  return ENTRANCE_ORDER
    .map(e => ({ entrance: e, label: ENTRANCE_LABELS[e], items: groups[e] }))
    .filter(g => g.items.length)
}

// A practice opens the full walk only when it's a steps practice with
// seeds to pick from (Money Moves). Everything else logs with one tap.
export function hasRunner(p) {
  return runnerKind(p) !== null
}

// Which runner a practice opens, or null to log with one tap.
export function runnerKind(p) {
  const m = p.run_mode
  if (p.config?.breath) return 'breath'
  if (m === 'steps' && Array.isArray(p.config?.seeds) && p.config.seeds.length > 0) return 'steps'
  if (m === 'timer' || m === 'intervals') return 'timer'
  if (m === 'open' && p.config?.reframe) return 'reframe'
  return null
}
