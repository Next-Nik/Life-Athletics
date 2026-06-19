// ─────────────────────────────────────────────────────────────
// practiceModel.js — the practice object, the locked model.
//
// One object type serves every practice in every area. Fitness is its
// richest configuration; finance its leanest. Two fields are load-
// bearing and decide everything about how a practice runs and what it
// records:
//
//   runMode — how the rep is performed
//     'timer'     — a single timed block (Train: name the edge, run the
//                   ring, capture what got sharper)
//     'intervals' — repeated work/rest rounds
//     'steps'     — pick moves → see each made (hold-to-commit) → line
//                   (Money Moves)
//     'open'      — a free reactive rep, no clock (the Reframe:
//                   catch → cost → switch)
//
//   logType — what the rep writes to the log
//     'done'  — a binary: it happened
//     'count' — a number of things (reps, calls, pages)
//     'value' — a measured value (weight, minutes, dollars)
//
// `source` says who filled the practice:
//   'owned' — ships with its fields pre-filled (Money Moves, a 3x5)
//   'open'  — a blank the user labels and fills themselves
//
// The unit the user sees and runs is always called a **practice** —
// never block, shape, or module. (The prototypes say "shape"; in the
// product it is "practice." This file is the place that name is true.)
//
// Practices celebrate the move, never promise the outcome. The model
// has nowhere to store a promised result on purpose.
// ─────────────────────────────────────────────────────────────

export const RUN_MODES = ['timer', 'intervals', 'steps', 'open']
export const LOG_TYPES  = ['done', 'count', 'value']
export const SOURCES    = ['owned', 'open']

// User-facing organizational axis. The areas decide *content*; the
// time of day decides *when it surfaces*. Navigation is by entrance,
// not by area.
export const ENTRANCES = ['morning', 'midday', 'evening', 'anytime']

// Cadence — drives the streak engine's expectation of a "due" day.
// custom_days: array of ints, 0=Mon … 6=Sun (matches the NextUs
// training_schedule weekday convention).
export const CADENCES = [
  { key: 'daily',    label: 'Daily' },
  { key: 'weekdays', label: 'Weekdays' },
  { key: '3x',       label: '3× / week' },
  { key: 'custom',   label: 'Custom' },
]
export const cadenceLabel = k => (CADENCES.find(c => c.key === k) || {}).label || k

// ── The five protocol shapes (+ the calibration layer) ──────────
//
// Every practice across every area is one of five recurring shapes.
// A shape is a template: it sets the run/log defaults and the beat
// structure, then the area's content fills it. "Standard" is not a
// runnable practice — it's the calibration layer where the user gives
// personal meaning to what Strong means in an area ("best in the
// world" for them). It produces no log rows; it tunes the target.
export const SHAPES = {
  daily_line: {
    key: 'daily_line', label: 'Daily Line',
    runMode: 'steps', logType: 'done',
    blurb: 'Pick the moves, see each one made, set the day. The Money Moves shape.',
  },
  keystone: {
    key: 'keystone', label: 'Keystone Act',
    runMode: 'timer', logType: 'done',
    blurb: 'One focused block. Name the edge, run it, capture what got sharper. The Train shape.',
  },
  setup: {
    key: 'setup', label: 'Setup',
    runMode: 'steps', logType: 'done',
    blurb: 'A short prep act that makes the real rep possible later.',
  },
  live_rep: {
    key: 'live_rep', label: 'Live Rep',
    runMode: 'open', logType: 'done',
    blurb: 'A reactive rep run in the moment — catch, cost, switch. The Reframe shape.',
  },
  weekly_review: {
    key: 'weekly_review', label: 'Weekly Review',
    runMode: 'open', logType: 'done',
    blurb: 'Read the week back, name what moved, reset the target. Runs on the Series cadence.',
  },
  standard: {
    key: 'standard', label: 'Standard',
    runMode: null, logType: null, calibration: true,
    blurb: 'Not a rep. Define what Strong means to you in this area. Tunes the target; logs nothing.',
  },
}
export const SHAPE_KEYS = Object.keys(SHAPES)

// A fresh practice. Pass an area key and (optionally) a shape; the
// shape seeds run/log defaults, the caller fills the rest.
export function makePractice({
  area,
  shape = 'daily_line',
  label = '',
  ask = '',
  entrance = 'anytime',
  source = 'open',
  cadence = 'daily',
  config = {},
} = {}) {
  const s = SHAPES[shape] || SHAPES.daily_line
  return {
    area,
    shape,
    label,
    ask,
    entrance,
    source,
    cadence,
    customDays: [],
    runMode: s.runMode,
    logType: s.logType,
    config,        // run-mode-specific: { seeds[], durations[], skills[], rounds, … }
    position: 0,
    active: true,
  }
}

// The Money Moves practice, as the canonical owned example — the exact
// object the engine prototype runs, lifted into the model so the first
// vertical slice has a real row to stand on.
export const MONEY_MOVES = makePractice({
  area: 'money',
  shape: 'daily_line',
  label: 'Money Moves',
  ask: 'What are you doing today to make money?',
  entrance: 'morning',
  source: 'owned',
  cadence: 'daily',
  config: {
    maxMoves: 3,
    holdMs: 2400,
    seeds: [
      'Send one pitch',
      'Make one sales call',
      'Ship a piece of the project',
      'Follow up with a warm lead',
      'Post one thing that builds the audience',
      'Ask for what the work is worth',
    ],
    line: { prompt: "Tonight, what's true?", placeholder: 'I made all three moves and stayed in the game…' },
  },
})
