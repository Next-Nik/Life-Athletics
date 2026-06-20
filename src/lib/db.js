// ─────────────────────────────────────────────────────────────
// db.js — the data layer.
//
// Every Supabase read/write the app needs, in one place, so components
// never touch the client directly. All of it is user-scoped; RLS does
// the enforcing, we just pass the rows.
//
//   ── practices ──
//   ensureMoneyMoves — retire Money Moves (it is not a settled tool yet).
//   seedPractices    — lay down the starter practices for every area the
//                      first time, inactive.
//   loadPractices    — all of a user's practices, ordered for the day.
//   setActive        — the composer's on/off.
//   setCadence       — change a practice's cadence.
//   createPractice   — add your own.
//
//   ── the rep log ──
//   loadLog / loadLogs / logRep — one row per rep; streak and history
//                      are derived off these, never stored.
//
//   ── the day line ──
//   ensureDayLine    — freeze the active line for an entrance on the
//                      first visit of the day, so the day resumes.
//
//   ── self-scouting standing ──
//   loadScouting / seedScouting / saveScouting — user-owned standing;
//                      saveScouting only writes when the user drags.
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'
import { MONEY_MOVES } from './practiceModel'
import { AREAS } from './areas'

// ── practices ───────────────────────────────────────────────────
export async function ensureMoneyMoves(userId) {
  // Money Moves isn't a settled tool yet, so it must not be locked onto
  // anyone's day. Don't seed it; if an old active one exists, switch it off.
  // (The row is left in place, just inactive, so nothing is lost.)
  await supabase
    .from('la_practices')
    .update({ active: false })
    .eq('user_id', userId).eq('area', 'money').eq('label', 'Money Moves').eq('active', true)
  return null
}

export async function loadPractices(userId) {
  const { data, error } = await supabase
    .from('la_practices').select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// Idempotent. Ensures Money Moves, then lays down each area's starter
// practices (inactive) for any not already present.
export async function seedPractices(userId) {
  await ensureMoneyMoves(userId)
  const existing = await loadPractices(userId)
  const have = new Set(existing.map(p => `${p.area}::${p.label}`))

  const rows = []
  AREAS.forEach(a => {
    ;(a.seed.practices || []).forEach((sp, i) => {
      if (have.has(`${a.key}::${sp.label}`)) return
      rows.push({
        user_id: userId, area: a.key,
        shape: sp.shape || 'keystone',
        label: sp.label, ask: sp.ask || null,
        run_mode: sp.runMode || 'open', log_type: sp.logType || 'done',
        source: 'open', entrance: sp.entrance || 'anytime',
        cadence: sp.cadence || 'daily', config: sp.config || {},
        position: sp.position ?? (i + 1), active: sp.active ?? false,
      })
    })
  })

  if (rows.length) {
    const { error } = await supabase.from('la_practices').insert(rows)
    if (error) throw error
  }
  return loadPractices(userId)
}

export async function setActive(practiceId, active) {
  const { error } = await supabase.from('la_practices').update({ active }).eq('id', practiceId)
  if (error) throw error
}

export async function setCadence(practiceId, cadence) {
  const { error } = await supabase.from('la_practices').update({ cadence }).eq('id', practiceId)
  if (error) throw error
}

export async function createPractice(userId, { area, label, entrance = 'anytime', cadence = 'daily' }) {
  const row = {
    user_id: userId, area, shape: 'keystone',
    label: (label || '').trim() || 'New practice', ask: null,
    run_mode: 'open', log_type: 'done', source: 'open',
    entrance, cadence, config: {}, position: 50, active: true,
  }
  const { data, error } = await supabase.from('la_practices').insert(row).select().single()
  if (error) throw error
  return data
}

export async function saveConfig(practiceId, config) {
  const { error } = await supabase.from('la_practices').update({ config }).eq('id', practiceId)
  if (error) throw error
}

// ── the rep log ─────────────────────────────────────────────────
export async function loadLog(userId, practiceId, sinceDays = 60) {
  const since = new Date(); since.setDate(since.getDate() - sinceDays)
  const { data, error } = await supabase
    .from('la_practice_log')
    .select('id, occurred_at, counted, payload, note')
    .eq('user_id', userId).eq('practice_id', practiceId)
    .gte('occurred_at', since.toISOString())
    .order('occurred_at', { ascending: false })
  if (error) throw error
  return (data || []).map(r => ({ ...r, occurredAt: r.occurred_at }))
}

// All of a user's recent log rows, for grouping per practice on the day.
export async function loadLogs(userId, sinceDays = 60) {
  const since = new Date(); since.setDate(since.getDate() - sinceDays)
  const { data, error } = await supabase
    .from('la_practice_log')
    .select('id, practice_id, occurred_at, counted, payload, note')
    .eq('user_id', userId)
    .gte('occurred_at', since.toISOString())
    .order('occurred_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function logRep(userId, practice, { payload = {}, note = null } = {}) {
  const row = {
    user_id: userId, practice_id: practice.id, area: practice.area,
    occurred_at: new Date().toISOString(), counted: true, payload, note,
  }
  const { data, error } = await supabase.from('la_practice_log').insert(row).select().single()
  if (error) throw error
  return data
}

// ── the day line ────────────────────────────────────────────────
function ymdLocal(d = new Date()) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Freeze the active line for an entrance on the first visit of the day.
// Returns the frozen practice_ids. Done-state itself is read from the
// log, so resuming a half-done day is automatic; this just keeps the
// line stable if practices are toggled later in the day.
export async function ensureDayLine(userId, entrance, activeIds) {
  const today = ymdLocal()
  const { data: row } = await supabase
    .from('la_daily_progress').select('*')
    .eq('user_id', userId).eq('entrance', entrance).maybeSingle()

  if (row && row.practice_date === today) {
    return Array.isArray(row.practice_ids) ? row.practice_ids : activeIds
  }
  const patch = {
    user_id: userId, entrance, practice_date: today,
    practice_ids: activeIds, step_index: 0, completed: false,
  }
  const { error } = await supabase
    .from('la_daily_progress')
    .upsert(patch, { onConflict: 'user_id,entrance' })
  if (error) throw error
  return activeIds
}

// ── self-scouting standing ──────────────────────────────────────
export async function loadScouting(userId) {
  const { data, error } = await supabase
    .from('la_scouting')
    .select('area, now_value, target_value, horizon_value, read_note, prescribe, standard, shape')
    .eq('user_id', userId)
  if (error) throw error
  return data || []
}

export async function seedScouting(userId) {
  const have = await loadScouting(userId)
  if (have.length >= AREAS.length) return have
  const haveKeys = new Set(have.map(r => r.area))
  const missing = AREAS.filter(a => !haveKeys.has(a.key)).map(a => ({
    user_id: userId, area: a.key,
    now_value: 0, target_value: 0,
    read_note: a.seed.read,
    prescribe: `${a.seed.prescribe.verb} · ${a.seed.prescribe.line}`,
  }))
  if (missing.length) {
    const { error } = await supabase.from('la_scouting').insert(missing)
    if (error) throw error
  }
  return loadScouting(userId)
}

export async function saveScouting(userId, area, fields) {
  const patch = { user_id: userId, area }
  for (const k of ['now_value', 'target_value', 'horizon_value', 'standard', 'shape']) {
    if (fields[k] != null) patch[k] = fields[k]
  }
  const { error } = await supabase
    .from('la_scouting')
    .upsert(patch, { onConflict: 'user_id,area' })
  if (error) throw error
}

// ── the game (purpose + the quarter clock) ──────────────────────
function ymd(d = new Date()) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export async function loadGame(userId) {
  const { data, error } = await supabase
    .from('la_game').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data || null
}

// Ensure a game row exists; returns it. Quarter clock starts today.
export async function ensureGame(userId) {
  const found = await loadGame(userId)
  if (found) return found
  const row = { user_id: userId, game_line: null, quarter_start: ymd(), onboarded: false, permission: false }
  const { data, error } = await supabase.from('la_game').upsert(row, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}

export async function saveGame(userId, fields) {
  const patch = { user_id: userId }
  for (const k of ['game_line', 'quarter_start', 'onboarded', 'permission']) {
    if (fields[k] !== undefined) patch[k] = fields[k]
  }
  const { data, error } = await supabase
    .from('la_game').upsert(patch, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}
