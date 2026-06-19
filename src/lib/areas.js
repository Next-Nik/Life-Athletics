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
//               are the engines; everything else is null. (Body/Charge/
//               Mind are the three engines under the body of work.)
//   accent    — the area's own accent hex (from the reframe prototype).
//               When an area paints the ground, this is the glow.
//   seed      — starter content the area ships with. Everything here is
//               a suggestion the user can overwrite; nothing is a frame.
//     reframe   — the live-rep script: caught thought, its cost, the switch
//     read      — the default self-scouting read (the body line)
//     prescribe — the default "train the gap" prescription verb +
//                 line: Install (name one rep a day), Reps (active
//                 training), or Maintain (protect the floor)
//
// The order here is the canonical area order (Purpose first, then the
// two games, then the three engines, then Work / Money / Relationships).
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
      read: "Can't yet name what you're playing for.",
      prescribe: { verb: 'Install', line: 'name one rep a day that\'s yours' },
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
      read: 'Anxiety runs the open. Reactive most mornings.',
      prescribe: { verb: 'Reps', line: 'a downshift before the day starts' },
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
      read: 'Reads a room. Presents clean.',
      prescribe: { verb: 'Maintain', line: 'hold it, light touch' },
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
      read: 'Trains three times a week. Sleep is okay.',
      prescribe: { verb: 'Reps', line: 'spread across strength, mobility, endurance' },
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
      read: 'Never really rests. Scrolls instead. Fried by Friday.',
      prescribe: { verb: 'Install', line: 'one real downshift a day' },
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
      read: 'Curious, but learning is incidental, not trained.',
      prescribe: { verb: 'Reps', line: 'a deliberate block of focused learning' },
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
      read: 'Competent, respected. Not stretched.',
      prescribe: { verb: 'Maintain', line: 'coast and watch' },
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
      read: 'Earns fine. No system. Nothing invested.',
      prescribe: { verb: 'Reps', line: 'one money move a week' },
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
      read: 'Close partner. Real friends.',
      prescribe: { verb: 'Maintain', line: 'keep showing up' },
    },
  },
]

// The three engines, named — used for the "body of work" grouping in
// the scouting view. Everything else stands on its own.
export const ENGINES = ['body', 'charge', 'mind']

export const AREA_KEYS = AREAS.map(a => a.key)
export const areaByKey = key => AREAS.find(a => a.key === key) || null
export const accentFor = key => (areaByKey(key)?.accent) || '#5FE2EE'
