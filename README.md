# Life Athletics — foundation kit

The decided spine, lifted from the NextUs frame and the locked LA prototypes.
This is the part everything else hangs off; it was the blocker, so it's first.
Separate repo, separate Supabase — nothing here touches NextUs.

## What's in here

```
sql/001_life_athletics_core.sql   the whole schema for the new Supabase project
src/lib/tokens.js                 the dark instrument design system (cyan now / gold headed)
src/lib/areas.js                  the nine areas as a content table — one machine, nine scripts
src/lib/practiceModel.js          the locked practice object + the five protocol shapes
src/lib/scoring.js                the two ladders: quality (Off→Strong) + time (Rep→…→Title)
```

## NextUs → Life Athletics, what mapped to what

| NextUs (proven)                          | Life Athletics (here)                    | Note |
|------------------------------------------|------------------------------------------|------|
| `practiceBlocks.js` registry             | `areas.js` + `practiceModel.js`          | LA practices are user-authored, so the "registry" is the user's own practices keyed by area, not a fixed house line |
| `daily_practice_progress` (135)          | `la_daily_progress`                      | same freeze-the-line-and-resume pattern, verbatim |
| `practice_shapes` (128)                  | folded into `la_practices.active/entrance/position` | the standing line is derived, no separate shapes table for v1 |
| `137_training` (types/schedule/sessions) | `la_practices` + `la_practice_log`       | one unified object supersedes the training-specific shape; fitness is its richest config |
| `daily_sessions` wins/victory_line (110) | `la_practice_log.payload` (steps mode)   | the Money Moves capture is one log row's payload |
| streak via `trailingStreak` (prototype)  | `scoring.js` `streak()`                  | derived, never stored |
| WinTheDay flame-hold                      | `mountHoldToCommit` (already extracted)  | lives on the LA side now; becomes a React component next |
| light ground + single gold               | `tokens.js` dark + cyan/gold + 4 grades  | the design inversion, exact hexes from the prototypes |

## Calls I made (override any of these)

- **Mind is in** — nine areas, not the eight in `scouting-report-v3`. The dial needs
  9 spokes (40° each) instead of 8; one geometry change, no redesign.
- **No `la_shapes` table.** The day's line is `active` practices for an entrance,
  ordered by `position`, frozen into `la_daily_progress` on entry. If you want a
  per-entrance saved arrangement distinct from the practice's home entrance, that's
  a table to add back — say the word.
- **Standing is user-owned, full stop.** `la_scouting` has no system writes, no
  promotion trigger, no audit column. The marker moves only when the user drags it.
- **`shape` lives on the practice**, defaulting run/log but not locking them — an
  owned practice can override (a Keystone that logs `value` instead of `done`).

## The next slice (proposed)

Wire **Money, end to end**, against these files:

1. `mountHoldToCommit` → a React `<HoldToCommit>` (the charge ring).
2. The Money Moves practice card + run flow (`steps × done`) reading/writing
   `la_practices` / `la_practice_log` on the new Supabase.
3. The self-scouting report (9-spoke dial + the now/headed ramp) reading
   `la_scouting`, dragging to write it.
4. `PracticeRunner` / `PracticeComposer` ported to drive the day's line.

That exercises the proven engine and the net-new scoring surface together, on the
most-developed area, before we fan out to the other eight.
