-- Adds optional curated insight links for live match spotlight cards.
-- Run this once in Supabase SQL Editor if your matches table already exists.

alter table public.matches
  add column if not exists insight_links jsonb not null default '[]'::jsonb;

-- Example shape:
-- update public.matches
-- set insight_links = '[{"title":"Analisis del partido","url":"https://www.youtube.com/watch?v=nAPmAjWZUSQ","source":"YouTube"}]'::jsonb
-- where id = 'm001';
