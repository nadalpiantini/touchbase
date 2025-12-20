-- Query para obtener información del esquema de las tablas relacionadas con torneos
SELECT
  table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'touchbase_teams',
    'touchbase_tournament_teams',
    'touchbase_tournaments',
    'touchbase_matches'
  )
ORDER BY
  table_name,
  ordinal_position;
