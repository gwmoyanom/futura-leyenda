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
  ('m001', 'group', 'A', '{"name":"México","code":"MEX","flag":"🇲🇽"}'::jsonb, '{"name":"Sudáfrica","code":"RSA","flag":"🇿🇦"}'::jsonb, '2026-06-11T15:00:00-06:00', 'Estadio Ciudad de México, México', null, 'upcoming'),
  ('m002', 'group', 'A', '{"name":"Corea del Sur","code":"KOR","flag":"🇰🇷"}'::jsonb, '{"name":"Chequia","code":"CZE","flag":"🇨🇿"}'::jsonb, '2026-06-11T22:00:00-06:00', 'Estadio Guadalajara, Zapopan, México', null, 'upcoming'),
  ('m003', 'group', 'B', '{"name":"Canadá","code":"CAN","flag":"🇨🇦"}'::jsonb, '{"name":"Bosnia","code":"BIH","flag":"🇧🇦"}'::jsonb, '2026-06-12T15:00:00-04:00', 'Estadio Toronto, Canadá', null, 'upcoming'),
  ('m004', 'group', 'D', '{"name":"EE.UU.","code":"USA","flag":"🇺🇸"}'::jsonb, '{"name":"Paraguay","code":"PAR","flag":"🇵🇾"}'::jsonb, '2026-06-12T21:00:00-04:00', 'Estadio Los Ángeles, EE.UU.', null, 'upcoming'),
  ('m005', 'group', 'B', '{"name":"Catar","code":"QAT","flag":"🇶🇦"}'::jsonb, '{"name":"Suiza","code":"SUI","flag":"🇨🇭"}'::jsonb, '2026-06-13T15:00:00-07:00', 'Estadio San Francisco, EE.UU.', null, 'upcoming'),
  ('m006', 'group', 'C', '{"name":"Brasil","code":"BRA","flag":"🇧🇷"}'::jsonb, '{"name":"Marruecos","code":"MAR","flag":"🇲🇦"}'::jsonb, '2026-06-13T18:00:00-04:00', 'Estadio Nueva York-Nueva Jersey, EE.UU.', null, 'upcoming'),
  ('m007', 'group', 'C', '{"name":"Haití","code":"HAI","flag":"🇭🇹"}'::jsonb, '{"name":"Escocia","code":"SCO","flag":"🏴󠁧󠁢󠁳󠁣󠁴󠁿"}'::jsonb, '2026-06-13T21:00:00-04:00', 'Estadio Boston, EE.UU.', null, 'upcoming'),
  ('m008', 'group', 'D', '{"name":"Australia","code":"AUS","flag":"🇦🇺"}'::jsonb, '{"name":"Turquía","code":"TUR","flag":"🇹🇷"}'::jsonb, '2026-06-14T00:00:00-07:00', 'BC Place, Vancouver, Canadá', null, 'upcoming'),
  ('m009', 'group', 'E', '{"name":"Alemania","code":"GER","flag":"🇩🇪"}'::jsonb, '{"name":"Curazao","code":"CUW","flag":"🇨🇼"}'::jsonb, '2026-06-14T13:00:00-05:00', 'Estadio Houston, EE.UU.', null, 'upcoming'),
  ('m010', 'group', 'F', '{"name":"Países Bajos","code":"NED","flag":"🇳🇱"}'::jsonb, '{"name":"Japón","code":"JPN","flag":"🇯🇵"}'::jsonb, '2026-06-14T16:00:00-05:00', 'Estadio Dallas, EE.UU.', null, 'upcoming'),
  ('m011', 'group', 'E', '{"name":"Costa de Marfil","code":"CIV","flag":"🇨🇮"}'::jsonb, '{"name":"Ecuador","code":"ECU","flag":"🇪🇨"}'::jsonb, '2026-06-14T19:00:00-05:00', 'Estadio Filadelfia, EE.UU.', null, 'upcoming'),
  ('m012', 'group', 'F', '{"name":"Ucrania","code":"UKR","flag":"🇺🇦"}'::jsonb, '{"name":"Túnez","code":"TUN","flag":"🇹🇳"}'::jsonb, '2026-06-14T22:00:00-06:00', 'Estadio Monterrey, México', null, 'upcoming'),
  ('m013', 'group', 'H', '{"name":"España","code":"ESP","flag":"🇪🇸"}'::jsonb, '{"name":"Cabo Verde","code":"CPV","flag":"🇨🇻"}'::jsonb, '2026-06-15T12:00:00-04:00', 'Estadio Atlanta, EE.UU.', null, 'upcoming'),
  ('m014', 'group', 'G', '{"name":"Bélgica","code":"BEL","flag":"🇧🇪"}'::jsonb, '{"name":"Egipto","code":"EGY","flag":"🇪🇬"}'::jsonb, '2026-06-15T15:00:00-07:00', 'BC Place, Vancouver, Canadá', null, 'upcoming'),
  ('m015', 'group', 'H', '{"name":"Arabia Saudita","code":"KSA","flag":"🇸🇦"}'::jsonb, '{"name":"Uruguay","code":"URU","flag":"🇺🇾"}'::jsonb, '2026-06-15T18:00:00-04:00', 'Estadio Miami, EE.UU.', null, 'upcoming'),
  ('m016', 'group', 'G', '{"name":"Irán","code":"IRN","flag":"🇮🇷"}'::jsonb, '{"name":"Nueva Zelanda","code":"NZL","flag":"🇳🇿"}'::jsonb, '2026-06-15T21:00:00-07:00', 'Estadio Los Ángeles, EE.UU.', null, 'upcoming'),
  ('m017', 'group', 'I', '{"name":"Francia","code":"FRA","flag":"🇫🇷"}'::jsonb, '{"name":"Senegal","code":"SEN","flag":"🇸🇳"}'::jsonb, '2026-06-16T15:00:00-04:00', 'Estadio Nueva York-Nueva Jersey, EE.UU.', null, 'upcoming'),
  ('m018', 'group', 'I', '{"name":"Iraq","code":"IRQ","flag":"🇮🇶"}'::jsonb, '{"name":"Noruega","code":"NOR","flag":"🇳🇴"}'::jsonb, '2026-06-16T18:00:00-04:00', 'Estadio Boston, EE.UU.', null, 'upcoming'),
  ('m019', 'group', 'J', '{"name":"Argentina","code":"ARG","flag":"🇦🇷"}'::jsonb, '{"name":"Argelia","code":"ALG","flag":"🇩🇿"}'::jsonb, '2026-06-16T21:00:00-05:00', 'Estadio Kansas City, EE.UU.', null, 'upcoming'),
  ('m020', 'group', 'J', '{"name":"Austria","code":"AUT","flag":"🇦🇹"}'::jsonb, '{"name":"Jordania","code":"JOR","flag":"🇯🇴"}'::jsonb, '2026-06-17T00:00:00-07:00', 'Estadio San Francisco, EE.UU.', null, 'upcoming'),
  ('m021', 'group', 'K', '{"name":"Portugal","code":"POR","flag":"🇵🇹"}'::jsonb, '{"name":"Jamaica","code":"JAM","flag":"🇯🇲"}'::jsonb, '2026-06-17T13:00:00-05:00', 'Estadio Houston, EE.UU.', null, 'upcoming'),
  ('m022', 'group', 'L', '{"name":"Inglaterra","code":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿"}'::jsonb, '{"name":"Croacia","code":"CRO","flag":"🇭🇷"}'::jsonb, '2026-06-17T16:00:00-05:00', 'Estadio Dallas, EE.UU.', null, 'upcoming'),
  ('m023', 'group', 'L', '{"name":"Ghana","code":"GHA","flag":"🇬🇭"}'::jsonb, '{"name":"Panamá","code":"PAN","flag":"🇵🇦"}'::jsonb, '2026-06-17T19:00:00-04:00', 'Estadio Toronto, Canadá', null, 'upcoming'),
  ('m024', 'group', 'K', '{"name":"Uzbekistán","code":"UZB","flag":"🇺🇿"}'::jsonb, '{"name":"Colombia","code":"COL","flag":"🇨🇴"}'::jsonb, '2026-06-17T22:00:00-06:00', 'Estadio Ciudad de México, México', null, 'upcoming'),
  ('m025', 'group', 'A', '{"name":"Chequia","code":"CZE","flag":"🇨🇿"}'::jsonb, '{"name":"Sudáfrica","code":"RSA","flag":"🇿🇦"}'::jsonb, '2026-06-18T12:00:00-04:00', 'Estadio Atlanta, EE.UU.', null, 'upcoming'),
  ('m026', 'group', 'B', '{"name":"Suiza","code":"SUI","flag":"🇨🇭"}'::jsonb, '{"name":"Bosnia","code":"BIH","flag":"🇧🇦"}'::jsonb, '2026-06-18T15:00:00-07:00', 'Estadio Los Ángeles, EE.UU.', null, 'upcoming'),
  ('m027', 'group', 'B', '{"name":"Canadá","code":"CAN","flag":"🇨🇦"}'::jsonb, '{"name":"Catar","code":"QAT","flag":"🇶🇦"}'::jsonb, '2026-06-18T18:00:00-07:00', 'BC Place, Vancouver, Canadá', null, 'upcoming'),
  ('m028', 'group', 'A', '{"name":"México","code":"MEX","flag":"🇲🇽"}'::jsonb, '{"name":"Corea del Sur","code":"KOR","flag":"🇰🇷"}'::jsonb, '2026-06-18T21:00:00-06:00', 'Estadio Guadalajara, Zapopan, México', null, 'upcoming'),
  ('m029', 'group', 'C', '{"name":"Escocia","code":"SCO","flag":"🏴󠁧󠁢󠁳󠁣󠁴󠁿"}'::jsonb, '{"name":"Marruecos","code":"MAR","flag":"🇲🇦"}'::jsonb, '2026-06-19T18:00:00-04:00', 'Estadio Boston, EE.UU.', null, 'upcoming'),
  ('m030', 'group', 'D', '{"name":"EE.UU.","code":"USA","flag":"🇺🇸"}'::jsonb, '{"name":"Australia","code":"AUS","flag":"🇦🇺"}'::jsonb, '2026-06-19T15:00:00-07:00', 'Estadio Seattle, EE.UU.', null, 'upcoming'),
  ('m031', 'group', 'C', '{"name":"Brasil","code":"BRA","flag":"🇧🇷"}'::jsonb, '{"name":"Haití","code":"HAI","flag":"🇭🇹"}'::jsonb, '2026-06-19T21:00:00-04:00', 'Estadio Filadelfia, EE.UU.', null, 'upcoming'),
  ('m032', 'group', 'D', '{"name":"Turquía","code":"TUR","flag":"🇹🇷"}'::jsonb, '{"name":"Paraguay","code":"PAR","flag":"🇵🇾"}'::jsonb, '2026-06-20T00:00:00-07:00', 'Estadio San Francisco, EE.UU.', null, 'upcoming'),
  ('m033', 'group', 'F', '{"name":"Países Bajos","code":"NED","flag":"🇳🇱"}'::jsonb, '{"name":"Ucrania","code":"UKR","flag":"🇺🇦"}'::jsonb, '2026-06-20T13:00:00-05:00', 'Estadio Houston, EE.UU.', null, 'upcoming'),
  ('m034', 'group', 'E', '{"name":"Alemania","code":"GER","flag":"🇩🇪"}'::jsonb, '{"name":"Costa de Marfil","code":"CIV","flag":"🇨🇮"}'::jsonb, '2026-06-20T16:00:00-04:00', 'Estadio Toronto, Canadá', null, 'upcoming'),
  ('m035', 'group', 'E', '{"name":"Ecuador","code":"ECU","flag":"🇪🇨"}'::jsonb, '{"name":"Curazao","code":"CUW","flag":"🇨🇼"}'::jsonb, '2026-06-20T20:00:00-05:00', 'Estadio Kansas City, EE.UU.', null, 'upcoming'),
  ('m036', 'group', 'F', '{"name":"Túnez","code":"TUN","flag":"🇹🇳"}'::jsonb, '{"name":"Japón","code":"JPN","flag":"🇯🇵"}'::jsonb, '2026-06-21T00:00:00-06:00', 'Estadio Monterrey, México', null, 'upcoming'),
  ('m037', 'group', 'H', '{"name":"España","code":"ESP","flag":"🇪🇸"}'::jsonb, '{"name":"Arabia Saudita","code":"KSA","flag":"🇸🇦"}'::jsonb, '2026-06-21T12:00:00-04:00', 'Estadio Atlanta, EE.UU.', null, 'upcoming'),
  ('m038', 'group', 'G', '{"name":"Bélgica","code":"BEL","flag":"🇧🇪"}'::jsonb, '{"name":"Irán","code":"IRN","flag":"🇮🇷"}'::jsonb, '2026-06-21T15:00:00-07:00', 'Estadio Los Ángeles, EE.UU.', null, 'upcoming'),
  ('m039', 'group', 'H', '{"name":"Uruguay","code":"URU","flag":"🇺🇾"}'::jsonb, '{"name":"Cabo Verde","code":"CPV","flag":"🇨🇻"}'::jsonb, '2026-06-21T18:00:00-04:00', 'Estadio Miami, EE.UU.', null, 'upcoming'),
  ('m040', 'group', 'G', '{"name":"Nueva Zelanda","code":"NZL","flag":"🇳🇿"}'::jsonb, '{"name":"Egipto","code":"EGY","flag":"🇪🇬"}'::jsonb, '2026-06-21T21:00:00-07:00', 'BC Place, Vancouver, Canadá', null, 'upcoming'),
  ('m041', 'group', 'J', '{"name":"Argentina","code":"ARG","flag":"🇦🇷"}'::jsonb, '{"name":"Austria","code":"AUT","flag":"🇦🇹"}'::jsonb, '2026-06-22T13:00:00-05:00', 'Estadio Dallas, EE.UU.', null, 'upcoming'),
  ('m042', 'group', 'I', '{"name":"Francia","code":"FRA","flag":"🇫🇷"}'::jsonb, '{"name":"Iraq","code":"IRQ","flag":"🇮🇶"}'::jsonb, '2026-06-22T17:00:00-04:00', 'Estadio Filadelfia, EE.UU.', null, 'upcoming'),
  ('m043', 'group', 'I', '{"name":"Noruega","code":"NOR","flag":"🇳🇴"}'::jsonb, '{"name":"Senegal","code":"SEN","flag":"🇸🇳"}'::jsonb, '2026-06-22T20:00:00-04:00', 'Estadio Nueva York-Nueva Jersey, EE.UU.', null, 'upcoming'),
  ('m044', 'group', 'J', '{"name":"Jordania","code":"JOR","flag":"🇯🇴"}'::jsonb, '{"name":"Argelia","code":"ALG","flag":"🇩🇿"}'::jsonb, '2026-06-22T23:00:00-07:00', 'Estadio San Francisco, EE.UU.', null, 'upcoming'),
  ('m045', 'group', 'K', '{"name":"Portugal","code":"POR","flag":"🇵🇹"}'::jsonb, '{"name":"Uzbekistán","code":"UZB","flag":"🇺🇿"}'::jsonb, '2026-06-23T13:00:00-05:00', 'Estadio Houston, EE.UU.', null, 'upcoming'),
  ('m046', 'group', 'L', '{"name":"Inglaterra","code":"ENG","flag":"🏴󠁧󠁢󠁥󠁮󠁧󠁿"}'::jsonb, '{"name":"Ghana","code":"GHA","flag":"🇬🇭"}'::jsonb, '2026-06-23T16:00:00-04:00', 'Estadio Boston, EE.UU.', null, 'upcoming'),
  ('m047', 'group', 'L', '{"name":"Panamá","code":"PAN","flag":"🇵🇦"}'::jsonb, '{"name":"Croacia","code":"CRO","flag":"🇭🇷"}'::jsonb, '2026-06-23T19:00:00-04:00', 'Estadio Toronto, Canadá', null, 'upcoming'),
  ('m048', 'group', 'K', '{"name":"Colombia","code":"COL","flag":"🇨🇴"}'::jsonb, '{"name":"Jamaica","code":"JAM","flag":"🇯🇲"}'::jsonb, '2026-06-23T22:00:00-06:00', 'Estadio Guadalajara, Zapopan, México', null, 'upcoming')
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


