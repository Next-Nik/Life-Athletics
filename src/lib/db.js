// ─────────────────────────────────────────────────────────────
// db.js — the data layer.
//
// Every Supabase read/write the slice needs, in one place, so the
// components never touch the client directly. All of it is user-scoped;
// RLS does the enforcing, we just pass the rows.
//
//   ensureMoneyMoves — the one owned practice. Seeded on first load from
//                      the locked MONEY_MOVES object, then it's a normal row.
//   loadLog / logRep — the rep log. logRep writes one row; everything
//                      derived (streak, history) is read off these.
//   loadScouting / seedScouting / saveScouting — the self-scouting
//                      standing. seedScouting lays down the nine areas
//                      from their defaults; saveScouting is the only
//                      writer, and it only writes when the user drags.
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'
import { MONEY_MOVES } from './practiceModel'
import { AREAS } from './areas'

// ── the owned Money Moves practice ──────────────────────────────
export async function ensureMoneyMoves(userId) {
  const { data: found } = await supabase
    .from('la_practices')
    .select('*')
    .eq('user_id', userId).eq('area', 'money').eq('label', 'Money Moves')
    .maybeSingle()
  if (found) return found

  const row = {
    user_id: userId,
    area: MONEY_MOVES.area, shape: MONEY_MOVES.shape, label: MONEY_MOVES.label, ask: MONEY_MOVES.ask,
    run_mode: MONEY_MOVES.runMode, log_type: MONEY_MOVES.logType, source: MONEY_MOVES.source,
    entrance: MONEY_MOVES.entrance, cadence: MONEY_MOVES.cadence, config: MONEY_MOVES.config,
    position: 0, active: true,
  }
  const { data, error } = await supabase.from('la_practices').insert(row).select().single()
  if (error) throw error
  return data
}

export async function setCadence(practiceId, cadence) {
  const { error } = await supabase.from('la_practices').update({ cadence }).eq('id', practiceId)
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
  // normalise to the shape scoring.js reads
  return (data || []).map(r => ({ ...r, occurredAt: r.occurred_at }))
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

// ── self-scouting standing ──────────────────────────────────────
export async function loadScouting(userId) {
  const { data, error } = await supabase
    .from('la_scouting')
    .select('area, now_value, target_value, read_note, prescribe')
    .eq('user_id', userId)
  if (error) throw error
  return data || []
}

// Lay down the nine areas the first time, from their seed text. Markers
// start at 0 — the user sets where they actually stand. Idempotent.
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

export async function saveScouting(userId, area, { now_value, target_value }) {
  const patch = { user_id: userId, area }
  if (now_value != null) patch.now_value = now_value
  if (target_value != null) patch.target_value = target_value
  const { error } = await supabase
    .from('la_scouting')
    .upsert(patch, { onConflict: 'user_id,area' })
  if (error) throw error
}
