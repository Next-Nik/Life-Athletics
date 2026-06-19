// ─────────────────────────────────────────────────────────────
// scoring.js — the two ladders, read-only.
//
// Two axes, kept apart on purpose:
//
//   QUALITY — where an area stands. Off → Building → Solid → Strong.
//             A continuous 0..1 now-value lands in one of four bands.
//             The user sets this by dragging the marker in the
//             self-scouting report. The SYSTEM NEVER MOVES IT. There is
//             no auto-promotion, no audit on adjustment. The target is
//             freely adjustable anytime; we trust the user entirely.
//             These functions only *read* a value into a band — they
//             never decide one.
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

import { STANDING } from './tokens'

// ── QUALITY: the four-grade scale ───────────────────────────────
export const GRADES = ['Off', 'Building', 'Solid', 'Strong']
export const GRADE_KEYS = ['off', 'building', 'solid', 'strong']
const BOUNDS = [0, 0.25, 0.5, 0.75] // lower edge of each band

export function gradeIndex(v) {
  return v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3
}
export function gradeKey(v)  { return GRADE_KEYS[gradeIndex(v)] }
export function gradeLabel(v) { return GRADES[gradeIndex(v)] }
export function gradeColor(v) { return STANDING[gradeKey(v)] }

// Where inside its band a value sits — early / mid / late. Lets the
// read say "Solid, late" without inventing more bands.
export function bandPos(v) {
  const within = (v - BOUNDS[gradeIndex(v)]) / 0.25
  return within < 0.34 ? 'early' : within < 0.67 ? 'mid' : 'late'
}

// The gap between now and headed, in grades — the quarter's training.
// Positive = grades to climb; 0 = same band; negative = easing off.
export function gradeGap(nowV, headedV) {
  return gradeIndex(headedV) - gradeIndex(nowV)
}
export function gapLabel(nowV, headedV) {
  const j = gradeGap(nowV, headedV)
  if (j > 0) return `${j} grade${j > 1 ? 's' : ''} to train`
  if (j === 0) return 'same band'
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
