-- ─────────────────────────────────────────────────────────────────────────────
-- 003_radiant_core.sql
-- The correct structure, laid at the root. One grammar, nine areas, no
-- privileged engines and no competing shape taxonomy. Additive: this creates
-- the new spine alongside the old tables, which a later migration retires once
-- every surface reads from here.
--
--   Scout (la_scouting, already present) sets where you are and where you're
--   headed per area. The gap is the training brief.
--
-- Four new tables carry the rest of the loop:
--   la_protocols — the frameworks you train an area with. An ordered set of
--                  moves/steps + a scheme, a chosen colour (so you can spot it
--                  on a week), and a run config. Standard protocols ship
--                  client-side as templates; forking one writes a row here.
--   la_cycles    — the planning block. A cycle is N weeks (default 4), each
--                  week labelled (Base / Build / Peak / Deload). A single
--                  repeating week is the degenerate case (weeks = 1).
--   la_schedule  — per (user, area, week_index, weekday) the ordered protocols
--                  that run that day. An absent/empty day reads as rest.
--   la_sessions  — one row per logged session, the three-beat: ready → work →
--                  land. Source of truth for the streak ladder and the read.
--
-- areas are text keys (purpose, inner, outer, body, charge, mind, work, money,
-- relationships) — never an enum — so the keys in src/lib/areas.js stay the
-- single source of truth. Weekday is 0=Mon … 6=Sun throughout.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- Shared touch-updated-at fn already exists from 001 (public.la_touch_updated_at).

-- ── Protocols ────────────────────────────────────────────────────────────────
create table if not exists public.la_protocols (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  area        text not null,

  name        text not null,
  scheme      text,                                  -- e.g. '3 × 5', '40:00', 'daily'
  rows        jsonb not null default '[]'::jsonb,    -- ordered moves/steps: [{ n, sets, reps, sec, cue, … }]
  run_mode    text not null default 'open',          -- timer | intervals | steps | open
  log_type    text not null default 'done',          -- done | count | value
  run_config  jsonb not null default '{}'::jsonb,    -- run-mode specifics: { minutes, rounds, seeds, breath, … }

  color       text not null default 'sky',           -- protocol-colour key (see PROTOCOL_COLORS) — spot it on a week
  source      text not null default 'own',           -- own | standard  (which library it came from)

  active      boolean not null default true,
  position    integer not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.la_protocols is
  'The frameworks you train an area with. rows is the ordered move/step list with its scheme; color is the user-chosen spotting colour; tenure (brass→copper→verdigris) is derived from la_sessions, never stored.';
comment on column public.la_protocols.color is
  'Protocol-colour key from src/lib/tokens.js PROTOCOL_COLORS. The medallion core; the tenure metal is the ring around it.';

create index if not exists idx_la_protocols_user_area on public.la_protocols (user_id, area, position);
alter table public.la_protocols enable row level security;
drop policy if exists "own protocols" on public.la_protocols;
create policy "own protocols" on public.la_protocols
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop trigger if exists la_protocols_touch on public.la_protocols;
create trigger la_protocols_touch before update on public.la_protocols
  for each row execute function public.la_touch_updated_at();

-- ── Cycles (the block) ───────────────────────────────────────────────────────
create table if not exists public.la_cycles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  area        text not null,

  weeks       smallint not null default 4 check (weeks between 1 and 12),
  week_labels jsonb not null default '["Base","Build","Peak","Deload"]'::jsonb,
  started_on  date not null default current_date,    -- anchors which week is "now"

  updated_at  timestamptz not null default now(),

  unique (user_id, area)
);
comment on table public.la_cycles is
  'The planning block for an area: a cycle of N weeks (default 4). The current week is derived from started_on. weeks = 1 is a single repeating week.';

alter table public.la_cycles enable row level security;
drop policy if exists "own cycles" on public.la_cycles;
create policy "own cycles" on public.la_cycles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop trigger if exists la_cycles_touch on public.la_cycles;
create trigger la_cycles_touch before update on public.la_cycles
  for each row execute function public.la_touch_updated_at();

-- ── Schedule (the rhythm) ────────────────────────────────────────────────────
create table if not exists public.la_schedule (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  area         text not null,

  week_index   smallint not null default 0 check (week_index between 0 and 11),  -- which week of the cycle
  weekday      smallint not null check (weekday between 0 and 6),                -- 0=Mon … 6=Sun
  protocol_ids jsonb not null default '[]'::jsonb,                               -- ordered la_protocols.id[]

  updated_at   timestamptz not null default now(),

  unique (user_id, area, week_index, weekday)
);
comment on table public.la_schedule is
  'Per (user, area, week_index, weekday) the ordered protocols that run that day. An absent or empty row reads as rest. Cadence is a consequence of the schedule, not a separate field.';

create index if not exists idx_la_schedule_user_area on public.la_schedule (user_id, area, week_index);
alter table public.la_schedule enable row level security;
drop policy if exists "own schedule" on public.la_schedule;
create policy "own schedule" on public.la_schedule
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop trigger if exists la_schedule_touch on public.la_schedule;
create trigger la_schedule_touch before update on public.la_schedule
  for each row execute function public.la_touch_updated_at();

-- ── Sessions (the three-beat log) ────────────────────────────────────────────
create table if not exists public.la_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  area         text not null,
  protocol_id  uuid references public.la_protocols(id) on delete set null,
  name         text,                                  -- snapshot of the protocol name at log time

  ready        jsonb,                                 -- the read before: light by default, richer for Body
  work         jsonb,                                 -- what was run (payload: reps, moves done, value, …)
  land         jsonb,                                 -- how it landed: { effort, energy_after, note }

  counted      boolean not null default true,         -- does this rep count toward the day / streak
  occurred_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
comment on table public.la_sessions is
  'One row per logged session, the three beats ready → work → land. Source of truth for the time ladder (cadence-aware streak, Series, Quarter) and for the read. Nothing interpretive is stored; the standing is derived.';
comment on column public.la_sessions.counted is
  'Whether the session counts toward the day and the streak. A day is won if any counted session landed that day.';

create index if not exists idx_la_sessions_user_time on public.la_sessions (user_id, occurred_at desc);
create index if not exists idx_la_sessions_user_area_time on public.la_sessions (user_id, area, occurred_at desc);
create index if not exists idx_la_sessions_protocol_time on public.la_sessions (protocol_id, occurred_at desc);
alter table public.la_sessions enable row level security;
drop policy if exists "own sessions" on public.la_sessions;
create policy "own sessions" on public.la_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
