-- ─────────────────────────────────────────────────────────────
-- 002_game_and_standard.sql
-- Phases 3, 4, 6. Run after 001.
--   la_game      — the purpose layer: what you're working toward (the
--                  Title), the quarter start, onboarding + permission.
--   la_scouting  — three new columns: the "best in the world" standard,
--                  the standard shape, and the far Horizon value (the
--                  dream beyond this quarter's Target).
-- ─────────────────────────────────────────────────────────────

create table if not exists public.la_game (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  game_line     text,                                  -- the Title: what you're working toward
  quarter_start date not null default current_date,    -- the 90-day clock
  onboarded     boolean not null default false,
  permission    boolean not null default false,        -- "allowed to live the life you want"
  updated_at    timestamptz not null default now()
);

alter table public.la_game enable row level security;
do $$ begin
  create policy "own game" on public.la_game
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$ begin
  create trigger la_game_touch before update on public.la_game
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- scouting: the standard (Phase 6) and the far Horizon (Phase 6)
alter table public.la_scouting add column if not exists standard      text;
alter table public.la_scouting add column if not exists shape         text not null default 'generalist';
alter table public.la_scouting add column if not exists horizon_value real not null default 0
  check (horizon_value between 0 and 1);
