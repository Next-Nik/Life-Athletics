# Life Athletics — Operating Notes

The collaboration contract for this repo. Carried over from *Working With Nik
v2.8*, narrowed to what applies to Life Athletics and marked where it doesn't.
Read this and the repo before acting. The files are the source of truth, not
memory from a prior session.

---

## Nik-level rules (carry across every session)

### Delivery & build
- **Zip with a named top-level folder mirroring the repo, every drop.** Never a
  flat dump, never a bare `src/`. Unzip and drag into place.
- **Complete files, never fragments.** Don't inline code in chat when a file was
  asked for.
- **Surgical precision.** Touch only the files in scope. If something adjacent
  looks wrong, flag it — don't fix it unilaterally.
- **The repo is the source of truth.** Read the files before claiming build
  state. Don't assume what's deployed.
- **One file, one name.** No version suffixes on filenames. (Migration numbers
  like `001_` are sequence, not versions, so they stay.)
- **No new `vercel.json`** unless it replaces the current one.
- **Verify before delivering.** A broken zip or a stray file wastes a push.

### Working rhythm
- **Standing 8.** Wait for the full brief. Don't anticipate or build on a partial
  picture. Confirm before proceeding on anything ambiguous. If something is
  missing, ask once, concisely.
- **New ideas mid-thread are noted, not built.** Focus stays on hardening what
  exists.
- **One clear recommendation with one-sentence reasoning** — not options
  explained at length.
- **Name the layer.** Tactical, architectural, philosophical, or technical, and
  answer at that level.

### Communication & recovery
- **Truth over agreement.** Intelligent disagreement is welcome. Reflexive
  validation is not support. Don't over-console.
- **Own errors cleanly** — name them, correct, move. *"Heard, Chef."* An
  explanation is only for a genuine blindspot, not a reflex.
- **Mamdani for hard truths.** Name it before it names you. Frame it by what it
  costs, not whose fault it is. Narrate the fix in real time.
- **Pushback framing.** "Yes, and…" before redirecting. When something needs to
  change: "I'd like to offer something more in the spirit of the project."

### Voice
- **British spelling in prose.** Code identifiers and CSS properties stay
  conventional (`color`, `behavior` in CSS/JS).
- **No em dashes in chat.** Fine in documents like this one.
- **Active, declarative, specific.** No hedging when something is decided. No
  filler. Mythic language when it carries real meaning; never marketing hype.

---

## Life Athletics boundaries (where the Nik doc is NextUs, not LA)

*Working With Nik* locks Horizon Suite **product** identity. Three of those locks
do not port to Life Athletics, which has its own settled version. Applying the
NextUs ones would corrupt LA's identity.

- **Design system.** NextUs is parchment ground, a single gold, Cormorant /
  Lora / Cormorant SC. LA is the deliberate inversion: near-black ground, cyan as
  *now*, gold as *headed*, Lora + Space Mono. Source of truth: `src/lib/tokens.js`.
- **Domain vocabulary.** NextUs runs seven domains (Path, Spark, Body, Finances,
  Connection, Inner Game, Signal). LA runs nine areas (Purpose, Inner Game, Outer
  Game, Body, Charge, Mind, Work, Money, Relationships). Source of truth:
  `src/lib/areas.js`.
- **Gamification posture.** NextUs avoids app-like mechanics and gates reflection
  behind consent (the North Star rule). LA embraces the scoring ladder and the
  streak engine. Opposite stance, by design.

Everything else in the Nik doc — collaboration, working rhythm, voice, build
behaviour — applies to LA unchanged.

---

## Separation

Life Athletics is a standalone product: **separate repo, separate Supabase
project, separate domain.** It reuses the NextUs *engine patterns* — the block /
practice registry, the runner and composer, the freeze-and-resume daily
progress, streak-derived-from-log — but shares no codebase and no database with
NextUs.

---

*Maintained by Nik Wood + Claude. A living document; update it as the work evolves.*
