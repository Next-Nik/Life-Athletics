// ─────────────────────────────────────────────────────────────
// areas.js — the nine areas, as data.
//
// This is the content table the domain-agnostic engine reads. The
// engine (runner, composer, reframe, scouting dial) never names an
// area; it asks this file. Nine scripts, one machine. Adding a tenth
// area costs nothing but its words.
//
// Each area carries:
//   key       — stable id, never shown (used in the DB area column)
//   label     — what the user sees
//   engine    — the three-engine grouping: 'body' | 'charge' | 'mind'
//   accent    — the area's own accent hex
//   seed      — starter content the area ships with. A suggestion the
//               user can overwrite; nothing here is a frame.
//     reframe   — the live-rep script: caught thought, its cost, the switch
//     read      — the default self-scouting read (the body line)
//     prescribe — the default "train the gap" prescription verb + line
//     practices — the two starter practices: the doing (kind:'doing',
//                 surfaces in the morning) and the sustaining
//                 (kind:'sustaining', surfaces in the evening). They are
//                 seeded inactive — the user switches on what they train.
//                 Money's doing is the owned Money Moves practice, so it
//                 isn't listed here; only its sustaining is.
// ─────────────────────────────────────────────────────────────

export const AREAS = [
  {
    key: 'purpose', label: 'Purpose', engine: null, accent: '#C8A2E8',
    seed: {
      reframe: {
        caught:  "It's too late to start.",
        cost:    'keeps your game unnamed and your days on autopilot.',
        reframe: "What's the first move that's actually mine?",
      },
      read: '',
      prescribe: { verb: 'Install', line: 'name one rep a day that\'s yours' },
      practices: [
        { kind: 'doing',      label: 'Take one step that\'s yours', entrance: 'morning', cadence: 'daily' },
        { kind: 'sustaining', label: 'Write a line on what mattered', entrance: 'evening', cadence: 'daily' },
      ],
    },
  },
  {
    key: 'inner', label: 'Inner Game', engine: null, accent: '#9FE5C6',
    seed: {
      reframe: {
        caught:  "I'm handling this badly.",
        cost:    'judges you instead of steadying you.',
        reframe: "What's actually happening right now?",
      },
      read: '',
      prescribe: { verb: 'Reps', line: 'a downshift before the day starts' },
      practices: [
        { kind: 'doing',      label: 'A short reset before the day', entrance: 'morning', cadence: 'daily' },
        { kind: 'sustaining', label: 'Name the feeling, name what\'s real', entrance: 'evening', cadence: 'daily' },
        { kind: 'sustaining', label: 'Breathe with me', entrance: 'anytime', cadence: 'daily', runMode: 'intervals', config: { breath: 'pacer' } },
      ],
    },
  },
  {
    key: 'outer', label: 'Outer Game', engine: null, accent: '#7FC8FF',
    seed: {
      reframe: {
        caught:  "They'll see I don't belong here.",
        cost:    "pulls you out of the room before you've arrived.",
        reframe: 'Who can I be fully present with right now?',
      },
      read: '',
      prescribe: { verb: 'Maintain', line: 'hold it, light touch' },
      practices: [
        { kind: 'doing',      label: 'Show up fully in one moment', entrance: 'morning', cadence: 'daily' },
        { kind: 'sustaining', label: 'Notice how you came across', entrance: 'evening', cadence: 'daily' },
      ],
    },
  },
  {
    key: 'body', label: 'Body', engine: 'body', accent: '#6FD08A',
    seed: {
      reframe: {
        caught:  "I don't have time to train.",
        cost:    'skips the rep entirely, so nothing compounds.',
        reframe: "What's the smallest rep I do have time for?",
      },
      read: '',
      prescribe: { verb: 'Reps', line: 'spread across strength, mobility, endurance' },
      practices: [
        { kind: 'doing',      label: 'Move with real effort', entrance: 'morning', cadence: '3x', runMode: 'timer', config: { minutes: 30 } },
        { kind: 'sustaining', label: 'Rest and refuel', entrance: 'evening', cadence: 'daily' },
      ],
    },
  },
  {
    key: 'charge', label: 'Charge', engine: 'charge', accent: '#5FE2EE',
    seed: {
      reframe: {
        caught:  "I can't afford to rest.",
        cost:    "burns the reserve you're already running on.",
        reframe: 'What does resting make possible tomorrow?',
      },
      read: '',
      prescribe: { verb: 'Install', line: 'one real downshift a day' },
      practices: [
        { kind: 'doing',      label: 'Do one thing that fills you', entrance: 'morning', cadence: 'daily' },
        { kind: 'sustaining', label: 'Wind down without a screen', entrance: 'evening', cadence: 'daily' },
        { kind: 'doing',      label: 'Energy breath', entrance: 'morning', cadence: 'daily', runMode: 'intervals', config: { breath: 'charge', rounds: 3, workSeconds: 20, restSeconds: 10 } },
        { kind: 'sustaining', label: 'Settle breath', entrance: 'evening', cadence: 'daily', runMode: 'intervals', config: { breath: 'open', rounds: 3 } },
      ],
    },
  },
  {
    key: 'mind', label: 'Mind', engine: 'mind', accent: '#E8C26A',
    seed: {
      reframe: {
        caught:  "I'm not smart enough to learn this.",
        cost:    "closes the door before you've tried the first page.",
        reframe: "What's the next small thing I can learn?",
      },
      read: '',
      prescribe: { verb: 'Reps', line: 'a deliberate block of focused learning' },
      practices: [
        { kind: 'doing',      label: 'Twenty focused minutes', entrance: 'morning', cadence: 'weekdays' },
        { kind: 'sustaining', label: 'Put it down and let it settle', entrance: 'evening', cadence: 'daily' },
      ],
    },
  },
  {
    key: 'work', label: 'Work', engine: null, accent: '#F2A85F',
    seed: {
      reframe: {
        caught:  "I'm not good enough for this.",
        cost:    'freezes you before the first real move.',
        reframe: "What's one piece I can do well right now?",
      },
      read: '',
      prescribe: { verb: 'Maintain', line: 'coast and watch' },
      practices: [
        { kind: 'doing',      label: 'One block of deep work', entrance: 'morning', cadence: 'weekdays' },
        { kind: 'sustaining', label: 'Close the loop, leave it clean', entrance: 'evening', cadence: 'weekdays' },
      ],
    },
  },
  {
    key: 'money', label: 'Money', engine: null, accent: '#ECB44A',
    seed: {
      reframe: {
        caught:  "I can't afford it.",
        cost:    'ends the search before it ever starts.',
        reframe: 'How could I afford it?',
      },
      read: '',
      prescribe: { verb: 'Reps', line: 'one money move a week' },
      // The doing practice for Money is the owned Money Moves (seeded
      // separately, active). Only the sustaining is listed here.
      practices: [
        { kind: 'sustaining', label: 'Track one thing, plug one leak', entrance: 'evening', cadence: 'daily' },
      ],
    },
  },
  {
    key: 'relationships', label: 'Relationships', engine: null, accent: '#F28FB0',
    seed: {
      reframe: {
        caught:  "They don't care anyway.",
        cost:    'stops you reaching out, and the distance grows.',
        reframe: "What's one bid I could make today?",
      },
      read: '',
      prescribe: { verb: 'Maintain', line: 'keep showing up' },
      practices: [
        { kind: 'doing',      label: 'Reach out to someone who matters', entrance: 'morning', cadence: 'daily' },
        { kind: 'sustaining', label: 'Repair or appreciate one thing', entrance: 'evening', cadence: 'daily' },
      ],
    },
  },
]

// The three engines, named — used for the "body of work" grouping.
export const ENGINES = ['body', 'charge', 'mind']

export const AREA_KEYS = AREAS.map(a => a.key)
export const areaByKey = key => AREAS.find(a => a.key === key) || null
export const areaLabel = key => (areaByKey(key)?.label) || key
export const accentFor = key => (areaByKey(key)?.accent) || '#139CDD'
