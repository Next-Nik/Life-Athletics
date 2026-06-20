// ─────────────────────────────────────────────────────────────
// scoring.js — the two ladders, read-only.
//
// Two axes, kept apart on purpose:
//
//   QUALITY — where an area stands, on a 0–10 self-rating the user
//             sets by dragging the marker. The SYSTEM NEVER MOVES IT.
//
//   TIME    — how reps roll up. Rep → Match → Series → Quarter → Title.
//             Rep: one possession (one logged run).
//             Match: a day — won if at least one counted rep landed.
//             Series: a week, best-of-seven, clinched at 4 won days.
//             Quarter: a 90-day challenge.
//             Title: the championship / season.
//             These ARE computed — they're a readout of the log, not a
//             judgement. A streak is just the trailing run of won days.
//
// Nothing here writes. Standing lives in la_scouting (user-owned);
// rollups are derived from la_practice_log rows at read time.
// ─────────────────────────────────────────────────────────────


// ── QUALITY: a 0–10 self-scouting scale ─────────────────────────
// The stored value is a 0..1 position (where the marker sits on the
// ramp). We read it as a 0–10 score for display. 0 isn't a verdict,
// it's a starting line. The user owns it; the system never moves it.
export function score10(v) { return Math.round((v ?? 0) * 10) }

// A gentle low→high colour, no red. Muted grey at 0 climbing to brand
// blue at 10, so a higher read simply looks more alive.
export function scoreColor(v) {
  const t = Math.max(0, Math.min(1, v ?? 0))
  const mix = (a, b) => Math.round(a + (b - a) * t)
  return `rgb(${mix(176, 19)}, ${mix(176, 156)}, ${mix(182, 221)})`
}

// The gap to the target, in points — the quarter's training.
export function gapLabel(nowV, headedV) {
  const j = score10(headedV) - score10(nowV)
  if (j > 0) return `+${j} to train`
  if (j === 0) return 'on target'
  return 'easing off'
}

// ── TIME: the rollup ladder ─────────────────────────────────────
// All rollups read a log: an array of entries shaped at minimum
// { occurredAt: Date|string, counted: boolean }. `counted` is the
// streak-bearing flag (a real rep that should count toward the day).

const dayKey = d => (typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10))

// MATCH — a day is won if any counted rep landed that day.
export function dayWon(log, date = new Date()) {
  const k = dayKey(date)
  return log.some(e => e.counted && dayKey(e.occurredAt) === k)
}

// Build a trailing day-history (oldest→newest) of booleans for the last
// `n` days, today last. This is what the 28-dot strip renders.
export function dayHistory(log, n = 28, today = new Date()) {
  const won = new Set(log.filter(e => e.counted).map(e => dayKey(e.occurredAt)))
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    out.push(won.has(dayKey(d)))
  }
  return out
}

// STREAK — trailing run of won days, today backwards. Pass either a
// log or a boolean history. (Matches the prototype's trailingStreak.)
export function streak(input, today = new Date()) {
  const hist = Array.isArray(input) && typeof input[0] === 'boolean'
    ? input
    : dayHistory(input, 365, today)
  let s = 0
  for (let i = hist.length - 1; i >= 0; i--) { if (hist[i]) s++; else break }
  return s
}
export function bestStreak(history) {
  let best = 0, run = 0
  for (const h of history) { run = h ? run + 1 : 0; if (run > best) best = run }
  return best
}

// SERIES — a week, best-of-seven, clinched at 4 won days. Returns the
// won/lost tally for the current (or given) week and whether it clinched.
export function series(log, weekStart = startOfWeek()) {
  let wins = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart); d.setDate(d.getDate() + i)
    if (dayWon(log, d)) wins++
  }
  return { wins, losses: 7 - wins, clinched: wins >= 4, target: 4 }
}

// QUARTER — a 90-day challenge. Days won out of the window elapsed.
export function quarter(log, start, today = new Date()) {
  const begin = new Date(start)
  const elapsed = Math.min(90, Math.floor((today - begin) / 86400000) + 1)
  let won = 0
  for (let i = 0; i < elapsed; i++) {
    const d = new Date(begin); d.setDate(d.getDate() + i)
    if (dayWon(log, d)) won++
  }
  return { won, elapsed, length: 90, remaining: Math.max(0, 90 - elapsed) }
}

// Monday-based week start, matching the 0=Mon weekday convention.
export function startOfWeek(from = new Date()) {
  const d = new Date(from)
  const dow = (d.getDay() + 6) % 7 // 0=Mon
  d.setDate(d.getDate() - dow); d.setHours(0, 0, 0, 0)
  return d
}
