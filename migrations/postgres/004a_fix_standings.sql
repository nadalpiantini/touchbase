-- ============================================================
-- TouchBase Migration 004a: Fix Standings View
-- Fixes the touchbase_standings view creation issue
-- ============================================================

-- Drop the view if it exists (in case of partial creation)
DROP VIEW IF EXISTS touchbase_standings;

-- Recreate the standings view with corrected logic
CREATE OR REPLACE VIEW touchbase_standings AS
SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.season_id,
    tour.id AS tournament_id,
    tour.name AS tournament_name,

    -- Games Played
    COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) AS games_played,

    -- Wins
    COUNT(DISTINCT CASE
        WHEN m.status = 'completed' AND m.winner_team_id = t.id THEN m.id
    END) AS wins,

    -- Losses
    COUNT(DISTINCT CASE
        WHEN m.status = 'completed' AND m.winner_team_id IS NOT NULL AND m.winner_team_id != t.id THEN m.id
    END) AS losses,

    -- Ties
    COUNT(DISTINCT CASE
        WHEN m.status = 'completed' AND m.winner_team_id IS NULL AND m.score_home = m.score_away THEN m.id
    END) AS ties,

    -- Runs scored (for)
    COALESCE(SUM(CASE
        WHEN m.team_home = t.id THEN m.score_home
        WHEN m.team_away = t.id THEN m.score_away
        ELSE 0
    END), 0) AS runs_for,

    -- Runs allowed (against)
    COALESCE(SUM(CASE
        WHEN m.team_home = t.id THEN m.score_away
        WHEN m.team_away = t.id THEN m.score_home
        ELSE 0
    END), 0) AS runs_against,

    -- Run differential
    (COALESCE(SUM(CASE
        WHEN m.team_home = t.id THEN m.score_home
        WHEN m.team_away = t.id THEN m.score_away
        ELSE 0
    END), 0) - COALESCE(SUM(CASE
        WHEN m.team_home = t.id THEN m.score_away
        WHEN m.team_away = t.id THEN m.score_home
        ELSE 0
    END), 0)) AS run_differential,

    -- Win Percentage
    CASE
        WHEN COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) > 0
        THEN ROUND(
            COUNT(DISTINCT CASE WHEN m.status = 'completed' AND m.winner_team_id = t.id THEN m.id END)::NUMERIC * 100.0 /
            COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END),
            1
        )
        ELSE 0.0
    END AS win_percentage

FROM touchbase_teams t
LEFT JOIN touchbase_tournament_teams tt ON tt.team_id = t.id
LEFT JOIN touchbase_tournaments tour ON tour.id = tt.tournament_id
LEFT JOIN touchbase_matches m ON m.tournament_id = tour.id
    AND (m.team_home = t.id OR m.team_away = t.id)

GROUP BY t.id, t.name, t.season_id, tour.id, tour.name;

COMMENT ON VIEW touchbase_standings IS 'Real-time tournament standings with wins, losses, runs, and win percentage';

-- ============================================================
-- End of migration
-- ============================================================
