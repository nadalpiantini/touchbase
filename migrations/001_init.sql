-- ============================================================
-- TouchBase Database Schema
-- Baseball Club Management System
-- ============================================================

-- Clubs (organizations that have teams)
CREATE TABLE IF NOT EXISTS touchbase_clubs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(120) NULL,
    country VARCHAR(60) NULL DEFAULT 'Dominican Republic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Baseball clubs/organizations';

-- Seasons (time periods for organizing teams)
CREATE TABLE IF NOT EXISTS touchbase_seasons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    club_id INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL COMMENT 'e.g., "2025-2026", "Spring 2025"',
    start_date DATE NULL,
    end_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_club (club_id),
    INDEX idx_active (is_active),
    CONSTRAINT fk_season_club FOREIGN KEY (club_id)
        REFERENCES touchbase_clubs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Baseball seasons';

-- Teams (groups of players by age category)
CREATE TABLE IF NOT EXISTS touchbase_teams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    club_id INT UNSIGNED NOT NULL,
    season_id INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL COMMENT 'Team name (e.g., "Tigers U12")',
    category VARCHAR(40) NOT NULL COMMENT 'Age category: U8, U10, U12, U14, U16, U18, Senior',
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_club (club_id),
    INDEX idx_season (season_id),
    INDEX idx_category (category),
    CONSTRAINT fk_team_club FOREIGN KEY (club_id)
        REFERENCES touchbase_clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_season FOREIGN KEY (season_id)
        REFERENCES touchbase_seasons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Baseball teams';

-- Roster (players assigned to teams)
CREATE TABLE IF NOT EXISTS touchbase_roster (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL COMMENT 'Reference to Chamilo user table',
    number VARCHAR(8) NULL COMMENT 'Jersey number',
    position VARCHAR(20) NULL COMMENT 'Primary position (P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH)',
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_team_user (team_id, user_id),
    INDEX idx_team (team_id),
    INDEX idx_user (user_id),
    CONSTRAINT fk_roster_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Team rosters';

-- Schedule (practices and games)
CREATE TABLE IF NOT EXISTS touchbase_schedule (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id INT UNSIGNED NOT NULL,
    type ENUM('practice', 'game') NOT NULL,
    opponent VARCHAR(120) NULL COMMENT 'Opponent team name (for games)',
    venue VARCHAR(160) NULL COMMENT 'Location/field name',
    start_at DATETIME NOT NULL,
    end_at DATETIME NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_time (team_id, start_at),
    INDEX idx_type (type),
    CONSTRAINT fk_schedule_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Practice and game schedule';

-- Attendance tracking
CREATE TABLE IF NOT EXISTS touchbase_attendance (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL COMMENT 'Player user ID',
    date DATE NOT NULL,
    status ENUM('present', 'late', 'absent', 'excused') NOT NULL DEFAULT 'present',
    comment VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_team_user_date (team_id, user_id, date),
    INDEX idx_team_date (team_id, date),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    CONSTRAINT fk_attendance_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Player attendance records';

-- Player statistics
CREATE TABLE IF NOT EXISTS touchbase_stats (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL COMMENT 'Player user ID',
    match_id INT UNSIGNED NULL COMMENT 'Optional reference to schedule.id (for game stats)',
    metric VARCHAR(60) NOT NULL COMMENT 'Stat type: AVG, OBP, SLG, HR, RBI, R, H, 2B, 3B, BB, SO, SB, IP, ERA, K, W, L, SV',
    value DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_team_user (team_id, user_id),
    INDEX idx_metric (metric),
    INDEX idx_match (match_id),
    CONSTRAINT fk_stats_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_stats_match FOREIGN KEY (match_id)
        REFERENCES touchbase_schedule(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Player performance statistics';

-- ============================================================
-- Sample Data (for testing)
-- ============================================================

-- Insert a demo club
INSERT INTO touchbase_clubs (name, city, country) VALUES
('Demo Baseball Club', 'Santo Domingo', 'Dominican Republic');

-- Insert a demo season
INSERT INTO touchbase_seasons (club_id, name, start_date, end_date, is_active) VALUES
(1, '2025-2026', '2025-09-01', '2026-06-30', TRUE);

-- ============================================================
-- End of migration
-- ============================================================
