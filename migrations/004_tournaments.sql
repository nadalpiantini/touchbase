-- ============================================================
-- PelotaPack Migration 004: Tournaments & Standings
-- Enables tournament management with automatic bracket generation
-- ============================================================

-- Tournaments table
CREATE TABLE IF NOT EXISTS touchbase_tournaments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Tournament Identity
    season_id INT UNSIGNED NOT NULL,
    name VARCHAR(160) NOT NULL COMMENT 'Tournament name (e.g., "U12 Spring Championship")',
    description TEXT NULL,
    
    -- Tournament Configuration
    format ENUM('round_robin', 'knockout', 'groups_knockout', 'double_elimination') NOT NULL DEFAULT 'round_robin'
        COMMENT 'Tournament format type',
    num_groups INT UNSIGNED NULL COMMENT 'Number of groups (for groups_knockout format)',
    teams_per_group INT UNSIGNED NULL COMMENT 'Teams per group (for groups_knockout)',
    
    -- Dates
    start_date DATE NULL,
    end_date DATE NULL,
    
    -- Status
    status ENUM('draft', 'scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    
    -- Settings
    settings JSON NULL COMMENT 'Additional settings: tie-breakers, scoring rules, etc.',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_season (season_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    
    CONSTRAINT fk_tournament_season 
        FOREIGN KEY (season_id) REFERENCES touchbase_seasons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Baseball tournaments';

-- Tournament Teams (which teams participate)
CREATE TABLE IF NOT EXISTS touchbase_tournament_teams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT UNSIGNED NOT NULL,
    team_id INT UNSIGNED NOT NULL,
    group_name VARCHAR(10) NULL COMMENT 'Group identifier (A, B, C, etc.) for group stage',
    seed INT UNSIGNED NULL COMMENT 'Seeding for knockout tournaments',
    
    UNIQUE KEY uniq_tournament_team (tournament_id, team_id),
    INDEX idx_tournament (tournament_id),
    INDEX idx_group (tournament_id, group_name),
    
    CONSTRAINT fk_tt_tournament 
        FOREIGN KEY (tournament_id) REFERENCES touchbase_tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_tt_team 
        FOREIGN KEY (team_id) REFERENCES touchbase_teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Teams participating in tournaments';

-- Matches table (games within tournaments)
CREATE TABLE IF NOT EXISTS touchbase_matches (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Tournament Link
    tournament_id INT UNSIGNED NOT NULL,
    round INT UNSIGNED NULL COMMENT 'Round number (1, 2, 3... for knockout)',
    match_number INT UNSIGNED NULL COMMENT 'Match number within round',
    
    -- Teams
    team_home INT UNSIGNED NOT NULL,
    team_away INT UNSIGNED NOT NULL,
    
    -- Scheduling
    scheduled_at DATETIME NULL COMMENT 'When the match is scheduled',
    venue VARCHAR(160) NULL COMMENT 'Field/stadium name',
    
    -- Scores
    score_home INT UNSIGNED DEFAULT 0,
    score_away INT UNSIGNED DEFAULT 0,
    innings_played INT UNSIGNED NULL COMMENT 'Number of innings completed',
    
    -- Status
    status ENUM('scheduled', 'in_progress', 'completed', 'postponed', 'cancelled', 'forfeit') DEFAULT 'scheduled',
    winner_team_id INT UNSIGNED NULL COMMENT 'Winning team ID (NULL if tie or not completed)',
    
    -- Additional Data
    notes TEXT NULL,
    box_score JSON NULL COMMENT 'Detailed inning-by-inning scores and statistics',
    
    -- Timestamps
    played_at DATETIME NULL COMMENT 'Actual start time',
    completed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tournament (tournament_id),
    INDEX idx_round (tournament_id, round),
    INDEX idx_teams (team_home, team_away),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_status (status),
    
    -- Foreign Keys
    CONSTRAINT fk_match_tournament 
        FOREIGN KEY (tournament_id) REFERENCES touchbase_tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_home_team 
        FOREIGN KEY (team_home) REFERENCES touchbase_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_away_team 
        FOREIGN KEY (team_away) REFERENCES touchbase_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_winner 
        FOREIGN KEY (winner_team_id) REFERENCES touchbase_teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tournament matches and results';

-- Standings View (materialized or computed)
-- This is a VIEW for real-time standings calculation
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
            COUNT(DISTINCT CASE WHEN m.status = 'completed' AND m.winner_team_id = t.id THEN m.id END) * 100.0 / 
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
LIMIT 1;

-- Add teams to the tournament (assuming teams exist from previous migrations)
INSERT INTO touchbase_tournament_teams (tournament_id, team_id, seed)
SELECT 
    (SELECT id FROM touchbase_tournaments WHERE name = 'Spring Championship 2025' LIMIT 1),
    id,
    id  -- Use team ID as seed for now
FROM touchbase_teams
WHERE season_id = (SELECT id FROM touchbase_seasons WHERE name = '2025-2026' LIMIT 1)
LIMIT 6;

-- ============================================================
-- End of migration
-- ============================================================
