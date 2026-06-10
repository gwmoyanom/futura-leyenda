-- Run this if your Supabase project was seeded before Group F was corrected.
-- It replaces Ukraine/UKR with Sweden/SWE in the Group F matches.

update public.matches
set home_team = '{"name":"Suecia","code":"SWE","flag":"🇸🇪"}'::jsonb
where id = 'm012';

update public.matches
set away_team = '{"name":"Suecia","code":"SWE","flag":"🇸🇪"}'::jsonb
where id in ('m033', 'm057');
