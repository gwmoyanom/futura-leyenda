-- Futura Leyenda - Supabase schema
-- Run this first in Supabase SQL Editor.

create table if not exists public.users (
  id text primary key,
  username text not null unique,
  display_name text not null,
  email text not null,
  role text not null default 'participant' check (role in ('admin', 'participant')),
  password_hash text not null,
  avatar text not null default '⚽',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id text primary key,
  phase text not null,
  group_name text,
  home_team jsonb not null,
  away_team jsonb not null,
  kickoff timestamptz not null,
  venue text,
  result jsonb,
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'finished'))
);

create table if not exists public.predictions (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  prediction jsonb not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  points_earned integer,
  unique (user_id, match_id)
);

create table if not exists public.maxi_messages (
  id text primary key,
  user_id text references public.users(id) on delete set null,
  author text not null,
  avatar text not null default '💌',
  text text not null check (char_length(text) between 5 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_matches_kickoff on public.matches(kickoff);
create index if not exists idx_matches_phase on public.matches(phase);
create index if not exists idx_predictions_user_id on public.predictions(user_id);
create index if not exists idx_predictions_match_id on public.predictions(match_id);
create index if not exists idx_maxi_messages_created_at on public.maxi_messages(created_at desc);
create index if not exists idx_maxi_messages_user_id on public.maxi_messages(user_id);

alter table public.users enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.maxi_messages enable row level security;
alter table public.app_config enable row level security;

-- This app currently uses friendly client-side auth, so the anon key needs
-- open table access. Keep only non-sensitive data here; never use a service key
-- in the frontend.
drop policy if exists "public users read" on public.users;
create policy "public users read" on public.users for select using (true);

drop policy if exists "public users insert" on public.users;
create policy "public users insert" on public.users for insert with check (true);

drop policy if exists "public users update" on public.users;
create policy "public users update" on public.users for update using (true) with check (true);

drop policy if exists "public matches read" on public.matches;
create policy "public matches read" on public.matches for select using (true);

drop policy if exists "public matches update" on public.matches;
create policy "public matches update" on public.matches for update using (true) with check (true);

drop policy if exists "public predictions read" on public.predictions;
create policy "public predictions read" on public.predictions for select using (true);

drop policy if exists "public predictions insert" on public.predictions;
create policy "public predictions insert" on public.predictions for insert with check (true);

drop policy if exists "public predictions update" on public.predictions;
create policy "public predictions update" on public.predictions for update using (true) with check (true);

drop policy if exists "public maxi messages read" on public.maxi_messages;
create policy "public maxi messages read" on public.maxi_messages for select using (true);

drop policy if exists "public maxi messages insert" on public.maxi_messages;
create policy "public maxi messages insert" on public.maxi_messages for insert with check (true);

drop policy if exists "public maxi messages update" on public.maxi_messages;
create policy "public maxi messages update" on public.maxi_messages for update using (true) with check (true);

drop policy if exists "public config read" on public.app_config;
create policy "public config read" on public.app_config for select using (true);

drop policy if exists "public config upsert" on public.app_config;
create policy "public config upsert" on public.app_config for all using (true) with check (true);
