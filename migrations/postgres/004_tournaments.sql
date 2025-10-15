-- ============================================================
-- TouchBase Migration 004: Tournaments & Standings (PostgreSQL)
-- Enables tournament management with automatic bracket generation
-- Prefix: touchbase_*
-- ============================================================

-- Tournament format enum
DO $$ BEGIN
    CREATE TYPE touchbase_tournament_format AS ENUM (
        'round_robin',
        'knockout',
        'groups_knockout',
        'double_elimination'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tournament status enum
DO $$ BEGIN
    CREATE TYPE touchbase_tournament_status AS ENUM (
        'draft',
        'scheduled',
        'in_progress',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Match status enum
DO $$ BEGIN
    CREATE TYPE touchbase_match_status AS ENUM (
        'scheduled',
        'in_progress',
        'completed',
        'postponed',
        'cancelled',
        'forfeit'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tournaments table
CREATE TABLE IF NOT EXISTS touchbase_tournaments (
    id SERIAL PRIMARY KEY,

    -- Tournament Identity
    season_id INTEGER NOT NULL,
    name VARCHAR(160) NOT NULL,
    description TEXT NULL,

    -- Tournament Configuration
    format touchbase_tournament_format NOT NULL DEFAULT 'round_robin',
    num_groups INTEGER NULL,
    teams_per_group INTEGER NULL,

    -- Dates
    start_date DATE NULL,
    end_date DATE NULL,

    -- Status
    status touchbase_tournament_status DEFAULT 'draft',

    -- Settings
    settings JSONB NULL DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tournament_season
        FOREIGN KEY (season_id) REFERENCES touchbase_seasons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tournaments_season ON touchbase_tournaments(season_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON touchbase_tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_dates ON touchbase_tournaments(start_date, end_date);

COMMENT ON TABLE touchbase_tournaments IS 'Baseball tournaments';
COMMENT ON COLUMN touchbase_tournaments.name IS 'Tournament name (e.g., "U12 Spring Championship")';
COMMENT ON COLUMN touchbase_tournaments.format IS 'Tournament format type';
COMMENT ON COLUMN touchbase_tournaments.num_groups IS 'Number of groups (for groups_knockout format)';
COMMENT ON COLUMN touchbase_tournaments.teams_per_group IS 'Teams per group (for groups_knockout)';
COMMENT ON COLUMN touchbase_tournaments.settings IS 'Additional settings: tie-breakers, scoring rules, etc.';

-- Tournament Teams (which teams participate)
CREATE TABLE IF NOT EXISTS touchbase_tournament_teams (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    group_name VARCHAR(10) NULL,
    seed INTEGER NULL,
    CONSTRAINT uniq_tournament_team UNIQUE (tournament_id, team_id),
    CONSTRAINT fk_tt_tournament
        FOREIGN KEY (tournament_id) REFERENCES touchbase_tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_tt_team
        FOREIGN KEY (team_id) REFERENCES touchbase_teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament ON touchbase_tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_group ON touchbase_tournament_teams(tournament_id, group_name);

COMMENT ON TABLE touchbase_tournament_teams IS 'Teams participating in tournaments';
COMMENT ON COLUMN touchbase_tournament_teams.group_name IS 'Group identifier (A, B, C, etc.) for group stage';
COMMENT ON COLUMN touchbase_tournament_teams.seed IS 'Seeding for knockout tournaments';

-- Matches table (games within tournaments)
CREATE TABLE IF NOT EXISTS touchbase_matches (
    id SERIAL PRIMARY KEY,

    -- Tournament Link
    tournament_id INTEGER NOT NULL,
    round INTEGER NULL,
    match_number INTEGER NULL,

    -- Teams
    team_home INTEGER NOT NULL,
    team_away INTEGER NOT NULL,

    -- Scheduling
    scheduled_at TIMESTAMP NULL,
    venue VARCHAR(160) NULL,

    -- Scores
    score_home INTEGER DEFAULT 0,
    score_away INTEGER DEFAULT 0,
    innings_played INTEGER NULL,

    -- Status
    status touchbase_match_status DEFAULT 'scheduled',
    winner_team_id INTEGER NULL,

    -- Additional Data
    notes TEXT NULL,
    box_score JSONB NULL,

    -- Timestamps
    played_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_tournament
        FOREIGN KEY (tournament_id) REFERENCES touchbase_tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_home_team
        FOREIGN KEY (team_home) REFERENCES touchbase_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_away_team
        FOREIGN KEY (team_away) REFERENCES touchbase_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_winner
        FOREIGN KEY (winner_team_id) REFERENCES touchbase_teams(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON touchbase_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_round ON touchbase_matches(tournament_id, round);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON touchbase_matches(team_home, team_away);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled ON touchbase_matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON touchbase_matches(status);

COMMENT ON TABLE touchbase_matches IS 'Tournament matches and results';
COMMENT ON COLUMN touchbase_matches.round IS 'Round number (1, 2, 3... for knockout)';
COMMENT ON COLUMN touchbase_matches.match_number IS 'Match number within round';
COMMENT ON COLUMN touchbase_matches.scheduled_at IS 'When the match is scheduled';
COMMENT ON COLUMN touchbase_matches.venue IS 'Field/stadium name';
COMMENT ON COLUMN touchbase_matches.innings_played IS 'Number of innings completed';
COMMENT ON COLUMN touchbase_matches.winner_team_id IS 'Winning team ID (NULL if tie or not completed)';
COMMENT ON COLUMN touchbase_matches.box_score IS 'Detailed inning-by-inning scores and statistics';
COMMENT ON COLUMN touchbase_matches.played_at IS 'Actual start time';

-- Standings View (real-time calculation)
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
    SUM(CASE
        WHEN m.team_home = t.id THEN m.score_home
        WHEN m.team_away = t.id THEN m.score_away
        ELSE 0
    END) AS runs_for,

    -- Runs allowed (against)
    SUM(CASE
        WHEN m.team_home = t.id THEN m.score_away
        WHEN m.team_away = t.id THEN m.score_home
        ELSE 0
    END) AS runs_against,

    -- Run differential
    (SUM(CASE
        WHEN m.team_home = t.id THEN m.score_home
        WHEN m.team_away = t.id THEN m.score_away
        ELSE 0
    END) - SUM(CASE
        WHEN m.team_home = t.id THEN m.score_away
        WHEN m.team_away = t.id THEN m.score_home
        ELSE 0
    END)) AS run_differential,

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

-- ============================================================
-- Triggers for updated_at
-- ============================================================

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON touchbase_tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON touchbase_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Sample Tournament Data
-- ============================================================

-- Create a sample tournament for the demo season
INSERT INTO touchbase_tournaments (season_id, name, format, start_date, end_date, status)
SELECT
    id,
    'Spring Championship 2025',
    'round_robin',
    '2025-03-01',
    '2025-05-31',
    'scheduled'
FROM touchbase_seasons
WHERE name = '2025-2026'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add teams to the tournament (assuming teams exist from previous migrations)
INSERT INTO touchbase_tournament_teams (tournament_id, team_id, seed)
SELECT
    (SELECT id FROM touchbase_tournaments WHERE name = 'Spring Championship 2025' LIMIT 1),
    id,
    id  -- Use team ID as seed for now
FROM touchbase_teams
WHERE season_id = (SELECT id FROM touchbase_seasons WHERE name = '2025-2026' LIMIT 1)
LIMIT 6
ON CONFLICT DO NOTHING;

-- ============================================================
-- End of migration
-- ============================================================
