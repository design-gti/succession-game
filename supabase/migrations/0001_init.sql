-- Fill the Seat: Talentlytica booth game
-- Paste in Supabase SQL Editor → Run

-- 1. Tables

create table public.plays (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  player_name text not null check (char_length(player_name) between 1 and 24),
  score int not null check (score between 0 and 100),
  persona text not null,
  first_pick_fit int not null,
  final_fit int not null,
  best_match_found boolean not null default false,
  match_checks_used int not null check (match_checks_used >= 0),
  duration_seconds int
);

create table public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event text not null,
  payload jsonb not null default '{}'::jsonb
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid,
  name text not null,
  company text,
  email text not null,
  score int,
  persona text
);

-- 2. Indexes

create index plays_leaderboard_idx on public.plays (created_at, score desc);
create index events_session_idx on public.events (session_id, created_at);

-- 3. Row Level Security

alter table public.plays  enable row level security;
alter table public.events enable row level security;
alter table public.leads  enable row level security;

-- plays: anon can insert and read (leaderboard)
create policy plays_insert on public.plays for insert to anon with check (true);
create policy plays_select on public.plays for select to anon using (true);

-- events: insert only
create policy events_insert on public.events for insert to anon with check (true);

-- leads: insert only (PII write-only from client)
create policy leads_insert on public.leads for insert to anon with check (true);
