-- Futura Leyenda - initial data
-- Run after schema.sql. Safe to run more than once.

insert into public.users (id, username, display_name, email, role, password_hash, avatar, approved, created_at)
values
  ('u001', 'admin', 'Organizador', 'admin@example.com', 'admin', 'admin123', '🏆', true, '2026-06-01T00:00:00Z'),
  ('u002', 'carlos', 'Carlos Pérez', 'carlos@example.com', 'participant', 'pass123', '⚽', true, '2026-06-02T00:00:00Z'),
  ('u003', 'ana', 'Ana García', 'ana@example.com', 'participant', 'pass123', '🌟', true, '2026-06-02T00:00:00Z'),
  ('u004', 'pedro', 'Pedro Martínez', 'pedro@example.com', 'participant', 'pass123', '🎯', false, '2026-06-03T00:00:00Z')
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  email = excluded.email,
  role = excluded.role,
  password_hash = excluded.password_hash,
  avatar = excluded.avatar,
  approved = excluded.approved,
  created_at = excluded.created_at;

insert into public.matches (id, phase, group_name, home_team, away_team, kickoff, venue, result, status)
values
  ('m001', 'group', 'A', '{"name":"México","code":"MEX","flag":"🇲🇽"}', '{"name":"Uruguay","code":"URU","flag":"🇺🇾"}', '2026-06-14T18:00:00-05:00', 'Estadio Azteca, Ciudad de México', null, 'upcoming'),
  ('m002', 'group', 'A', '{"name":"Argentina","code":"ARG","flag":"🇦🇷"}', '{"name":"Ecuador","code":"ECU","flag":"🇪🇨"}', '2026-06-15T16:00:00-05:00', 'MetLife Stadium, Nueva York', null, 'upcoming'),
  ('m003', 'group', 'B', '{"name":"Brasil","code":"BRA","flag":"🇧🇷"}', '{"name":"Colombia","code":"COL","flag":"🇨🇴"}', '2026-06-16T14:00:00-05:00', 'SoFi Stadium, Los Ángeles', null, 'upcoming'),
  ('m004', 'group', 'B', '{"name":"España","code":"ESP","flag":"🇪🇸"}', '{"name":"Marruecos","code":"MAR","flag":"🇲🇦"}', '2026-06-16T20:00:00-05:00', 'AT&T Stadium, Dallas', '{"home":2,"away":1}', 'finished'),
  ('m005', 'group', 'C', '{"name":"Francia","code":"FRA","flag":"🇫🇷"}', '{"name":"Alemania","code":"GER","flag":"🇩🇪"}', '2026-06-17T16:00:00-05:00', 'Levi''s Stadium, San Francisco', '{"home":1,"away":1}', 'live'),
  ('m006', 'group', 'C', '{"name":"Portugal","code":"POR","flag":"🇵🇹"}', '{"name":"Senegal","code":"SEN","flag":"🇸🇳"}', '2026-06-17T20:00:00-05:00', 'Gillette Stadium, Boston', null, 'upcoming'),
  ('m007', 'group', 'D', '{"name":"Japón","code":"JPN","flag":"🇯🇵"}', '{"name":"Marruecos","code":"MAR","flag":"🇲🇦"}', '2026-06-18T15:00:00-05:00', 'Las Vegas Stadium, Las Vegas', null, 'upcoming'),
  ('m008', 'group', 'D', '{"name":"Croacia","code":"CRO","flag":"🇭🇷"}', '{"name":"México","code":"MEX","flag":"🇲🇽"}', '2026-06-19T19:00:00-05:00', 'NRG Stadium, Houston', null, 'upcoming'),
  ('m053', 'round16', null, '{"name":"Ganador A1","code":"W_A1","flag":"⚽"}', '{"name":"Ganador B2","code":"W_B2","flag":"⚽"}', '2026-07-03T16:00:00-05:00', 'SoFi Stadium, Los Ángeles', null, 'upcoming'),
  ('m054', 'round16', null, '{"name":"Ganador B1","code":"W_B1","flag":"⚽"}', '{"name":"Ganador A2","code":"W_A2","flag":"⚽"}', '2026-07-03T20:00:00-05:00', 'AT&T Stadium, Dallas', null, 'upcoming'),
  ('m061', 'semifinal', null, '{"name":"Semifinalista 1","code":"SF1","flag":"⚽"}', '{"name":"Semifinalista 2","code":"SF2","flag":"⚽"}', '2026-07-15T16:00:00-05:00', 'MetLife Stadium, Nueva York', null, 'upcoming'),
  ('m062', 'semifinal', null, '{"name":"Semifinalista 3","code":"SF3","flag":"⚽"}', '{"name":"Semifinalista 4","code":"SF4","flag":"⚽"}', '2026-07-15T20:00:00-05:00', 'Levi''s Stadium, San Francisco', null, 'upcoming'),
  ('m063', 'final', null, '{"name":"Finalista A","code":"F1","flag":"⚽"}', '{"name":"Finalista B","code":"F2","flag":"⚽"}', '2026-07-19T19:00:00-05:00', 'MetLife Stadium, Nueva York', null, 'upcoming')
on conflict (id) do update set
  phase = excluded.phase,
  group_name = excluded.group_name,
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  kickoff = excluded.kickoff,
  venue = excluded.venue,
  result = excluded.result,
  status = excluded.status;

insert into public.predictions (id, user_id, match_id, prediction, submitted_at, created_at, updated_at, points_earned)
values
  ('p001', 'u002', 'm004', '{"home":2,"away":0}', '2026-06-14T10:00:00Z', '2026-06-14T10:00:00Z', '2026-06-14T10:00:00Z', 1),
  ('p002', 'u002', 'm005', '{"home":1,"away":1}', '2026-06-14T10:05:00Z', '2026-06-14T10:05:00Z', '2026-06-14T10:05:00Z', null),
  ('p003', 'u003', 'm004', '{"home":3,"away":1}', '2026-06-14T11:00:00Z', '2026-06-14T11:00:00Z', '2026-06-14T11:00:00Z', 1),
  ('p004', 'u003', 'm005', '{"home":2,"away":0}', '2026-06-14T11:10:00Z', '2026-06-14T11:10:00Z', '2026-06-14T11:10:00Z', null)
on conflict (user_id, match_id) do update set
  prediction = excluded.prediction,
  submitted_at = excluded.submitted_at,
  updated_at = excluded.updated_at,
  points_earned = excluded.points_earned;

insert into public.app_config (key, value)
values (
  'main',
  '{
    "version": "1.0",
    "project": {
      "name": "Futura Leyenda",
      "babyName": "Maximiliano",
      "birthDate": "2026-07-09T00:00:00",
      "tagline": "Mientras el mundo busca un campeón, nosotros celebramos el nacimiento de una futura leyenda."
    },
    "tournament": {
      "name": "FIFA World Cup 2026",
      "inaugurationDate": "2026-06-14T16:00:00",
      "completionDate": "2026-07-19T23:59:59",
      "groupPhaseEndDate": "2026-07-02T23:59:59",
      "knockoutPhaseStartDate": "2026-07-03T00:00:00"
    },
    "api": {
      "provider": "football-data.org",
      "competitionCode": "WC",
      "documentsUrl": "https://www.football-data.org/documentation"
    },
    "rules": {
      "exactScore": { "points": 3, "description": "Resultado exacto (ej: 2-1 correcto)" },
      "correctResult": { "points": 1, "description": "Resultado correcto (victoria/empate) sin marcador exacto" },
      "goldenBoot": { "points": 5, "description": "Acertar al goleador del torneo" },
      "champion": { "points": 10, "description": "Acertar al campeón del Mundial" },
      "finalist": { "points": 4, "description": "Acertar a un finalista" }
    },
    "prizes": [
      { "position": 1, "label": "Campeón 🥇", "description": "Premio principal — revelado en la baby shower" },
      { "position": 2, "label": "Subcampeón 🥈", "description": "Premio secundario" },
      { "position": 3, "label": "Tercer lugar 🥉", "description": "Premio de consolación" }
    ]
  }'::jsonb
)
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();
