-- ─────────────────────────────────────────────────────────────────────────────
-- 001_life_athletics_core.sql
--
-- The whole spine for the new (separate) Life Athletics Supabase project, in
-- one migration. Borrows the NextUs frame wholesale — the same user-scoped RLS,
-- the same touch-updated-at trigger, the same "freeze the day's line and resume"
-- pattern from daily_practice_progress — and adds the two things that are net-new
-- to Life Athletics: the unified practice object, and the self-scouting standing.
--
-- Tables:
--   la_practices      — the practice object (the locked model). One row per
--                       user-authored or owned practice, across all nine areas.
--   la_practice_log   — one row per logged rep/run. The single source of truth;
--                       streaks, histories, and the rollup ladder are all derived
--                       from these rows in app (scoring.js). Nothing is stored.
--   la_scouting       — per (user, area) standing: the now-value and the headed
--                       target. USER-OWNED and freely editable. The system never
--                       writes these; there is no promotion logic and no audit.
--   la_daily_progress — runner resume. Freezes the day's practice line on entry
--                       and remembers the beat, so leaving and returning lands you
--                       exactly where you were. (Port of daily_practice_progress.)
--
-- areas are stored as text keys (purpose, inner, outer, body, charge, mind, work,
-- money, relationships) — never an enum, so renaming or adding an area needs no
-- migration. The keys are the source of truth in src/lib/areas.js.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- Shared touch-updated-at trigger fn (one for the whole project).
create or replace function public.la_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. The practice object ───────────────────────────────────────────────────
create table if not exists public.la_practices (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,

  area        text not null,        -- one of the nine area keys
  shape       text not null default 'daily_line',
                                    -- daily_line | keystone | setup | live_rep | weekly_review | standard

  label       text not null,
  ask         text,                 -- the practice's question / prompt

  -- the two load-bearing fields
  run_mode    text not null default 'steps'
                check (run_mode in ('timer','intervals','steps','open')),
  log_type    text not null default 'done'
                check (log_type in ('done','count','value')),

  source      text not null default 'open'
                check (source in ('owned','open')),
  entrance    text not null default 'anytime'
                check (entrance in ('morning','midday','evening','anytime')),

  cadence     text not null default 'daily'
                check (cadence in ('daily','weekdays','3x','custom')),
  custom_days integer[] not null default '{}',   -- 0=Mon … 6=Sun, only for 'custom'

  -- run-mode-specific config: { seeds[], durations[], skills[], rounds, holdMs, line{} }
  config      jsonb not null default '{}'::jsonb,

  position    integer not null default 0,        -- order within an entrance
  active      boolean not null default true,     -- is it in the standing line

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_la_practices_user_entrance
  on public.la_practices (user_id, entrance, position);
create index if not exists idx_la_practices_user_area
  on public.la_practices (user_id, area);

alter table public.la_practices enable row level security;
drop policy if exists "own practices" on public.la_practices;
create policy "own practices" on public.la_practices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists la_practices_touch on public.la_practices;
create trigger la_practices_touch before update on public.la_practices
  for each row execute function public.la_touch_updated_at();

-- ── 2. The log — the one source of truth ─────────────────────────────────────
create table if not exists public.la_practice_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  practice_id uuid references public.la_practices(id) on delete set null,

  area        text not null,        -- denormalized for fast per-area rollups
  occurred_at timestamptz not null default now(),

  -- the streak-bearing flag: a real rep that should count toward the day.
  counted     boolean not null default true,

  -- what the rep recorded, by log_type:
  --   done  → payload holds the qualitative capture (selected moves, sharpen/
  --           feedback, the victory line)
  --   count → count holds the number
  --   value → value + unit hold the measure (e.g. 92.5 kg, 25 min, 1 pitch)
  count       integer,
  value       numeric,
  unit        text,
  payload     jsonb not null default '{}'::jsonb,
  note        text,

  created_at  timestamptz not null default now()
);

create index if not exists idx_la_log_user_time
  on public.la_practice_log (user_id, occurred_at desc);
create index if not exists idx_la_log_user_area_time
  on public.la_practice_log (user_id, area, occurred_at desc);
create index if not exists idx_la_log_practice_time
  on public.la_practice_log (practice_id, occurred_at desc);

alter table public.la_practice_log enable row level security;
drop policy if exists "own log" on public.la_practice_log;
create policy "own log" on public.la_practice_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 3. Self-scouting standing — user-owned, never system-written ─────────────
create table if not exists public.la_scouting (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  area         text not null,

  now_value    real not null default 0      check (now_value    between 0 and 1),
  target_value real not null default 0      check (target_value between 0 and 1),

  read_note    text,                         -- "the read": the body line
  prescribe    text,                         -- "train the gap": the prescription line

  updated_at   timestamptz not null default now(),

  unique (user_id, area)
);

alter table public.la_scouting enable row level security;
drop policy if exists "own scouting" on public.la_scouting;
create policy "own scouting" on public.la_scouting
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists la_scouting_touch on public.la_scouting;
create trigger la_scouting_touch before update on public.la_scouting
  for each row execute function public.la_touch_updated_at();

-- ── 4. Runner resume — freeze the day's line, remember the beat ──────────────
create table if not exists public.la_daily_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  entrance      text not null,

  practice_date date not null,
  practice_ids  jsonb not null default '[]'::jsonb,   -- frozen line for the day, in order
  step_index    integer not null default 0,
  completed     boolean not null default false,

  updated_at    timestamptz not null default now(),

  unique (user_id, entrance)
);

alter table public.la_daily_progress enable row level security;
drop policy if exists "own progress" on public.la_daily_progress;
create policy "own progress" on public.la_daily_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists la_progress_touch on public.la_daily_progress;
create trigger la_progress_touch before update on public.la_daily_progress
  for each row execute function public.la_touch_updated_at();

commit;

-- ── Verification ─────────────────────────────────────────────────────────────
--   select table_name from information_schema.tables
--     where table_schema='public' and table_name like 'la_%';
--   -- expect: la_practices, la_practice_log, la_scouting, la_daily_progress
