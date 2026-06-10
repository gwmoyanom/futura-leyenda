-- Run this if your Supabase project was seeded before Jamaica was replaced.
-- It replaces Jamaica/JAM with RD Congo/COD in all matches.

update public.matches
set home_team = '{"name":"RD Congo","code":"COD","flag":"🇨🇩"}'::jsonb
where home_team->>'code' = 'JAM';

update public.matches
set away_team = '{"name":"RD Congo","code":"COD","flag":"🇨🇩"}'::jsonb
where away_team->>'code' = 'JAM';
