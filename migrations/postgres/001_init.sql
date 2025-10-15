-- ============================================================
-- TouchBase Database Schema (PostgreSQL + Supabase)
-- Baseball Club Management System
-- Prefix: touchbase_* (per project rules)
-- ============================================================

-- Clubs (organizations that have teams)
CREATE TABLE IF NOT EXISTS touchbase_clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(120) NULL,
    country VARCHAR(60) NULL DEFAULT 'Dominican Republic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clubs_name ON touchbase_clubs(name);

COMMENT ON TABLE touchbase_clubs IS 'Baseball clubs/organizations';

-- Seasons (time periods for organizing teams)
CREATE TABLE IF NOT EXISTS touchbase_seasons (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL,
    name VARCHAR(120) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_season_club FOREIGN KEY (club_id)
        REFERENCES touchbase_clubs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seasons_club ON touchbase_seasons(club_id);
CREATE INDEX IF NOT EXISTS idx_seasons_active ON touchbase_seasons(is_active);

COMMENT ON TABLE touchbase_seasons IS 'Baseball seasons';
COMMENT ON COLUMN touchbase_seasons.name IS 'e.g., "2025-2026", "Spring 2025"';

-- Teams (groups of players by age category)
CREATE TABLE IF NOT EXISTS touchbase_teams (
    id SERIAL PRIMARY KEY,
    club_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(40) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_team_club FOREIGN KEY (club_id)
        REFERENCES touchbase_clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_season FOREIGN KEY (season_id)
        REFERENCES touchbase_seasons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_teams_club ON touchbase_teams(club_id);
CREATE INDEX IF NOT EXISTS idx_teams_season ON touchbase_teams(season_id);
CREATE INDEX IF NOT EXISTS idx_teams_category ON touchbase_teams(category);

COMMENT ON TABLE touchbase_teams IS 'Baseball teams';
COMMENT ON COLUMN touchbase_teams.name IS 'Team name (e.g., "Tigers U12")';
COMMENT ON COLUMN touchbase_teams.category IS 'Age category: U8, U10, U12, U14, U16, U18, Senior';

-- Roster (players assigned to teams)
CREATE TABLE IF NOT EXISTS touchbase_roster (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    number VARCHAR(8) NULL,
    position VARCHAR(20) NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_team_user UNIQUE (team_id, user_id),
    CONSTRAINT fk_roster_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_roster_team ON touchbase_roster(team_id);
CREATE INDEX IF NOT EXISTS idx_roster_user ON touchbase_roster(user_id);

COMMENT ON TABLE touchbase_roster IS 'Team rosters';
COMMENT ON COLUMN touchbase_roster.user_id IS 'Reference to Supabase auth.users';
COMMENT ON COLUMN touchbase_roster.number IS 'Jersey number';
COMMENT ON COLUMN touchbase_roster.position IS 'Primary position (P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH)';

-- Event types enum
DO $$ BEGIN
    CREATE TYPE touchbase_event_type AS ENUM ('practice', 'game');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Schedule (practices and games)
CREATE TABLE IF NOT EXISTS touchbase_schedule (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    type touchbase_event_type NOT NULL,
    opponent VARCHAR(120) NULL,
    venue VARCHAR(160) NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_schedule_team_time ON touchbase_schedule(team_id, start_at);
CREATE INDEX IF NOT EXISTS idx_schedule_type ON touchbase_schedule(type);

COMMENT ON TABLE touchbase_schedule IS 'Practice and game schedule';
COMMENT ON COLUMN touchbase_schedule.opponent IS 'Opponent team name (for games)';
COMMENT ON COLUMN touchbase_schedule.venue IS 'Location/field name';

-- Attendance status enum
DO $$ BEGIN
    CREATE TYPE touchbase_attendance_status AS ENUM ('present', 'late', 'absent', 'excused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Attendance tracking
CREATE TABLE IF NOT EXISTS touchbase_attendance (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    status touchbase_attendance_status NOT NULL DEFAULT 'present',
    comment VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_team_user_date UNIQUE (team_id, user_id, date),
    CONSTRAINT fk_attendance_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attendance_team_date ON touchbase_attendance(team_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON touchbase_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON touchbase_attendance(status);

COMMENT ON TABLE touchbase_attendance IS 'Player attendance records';
COMMENT ON COLUMN touchbase_attendance.user_id IS 'Player user ID';

-- Player statistics
CREATE TABLE IF NOT EXISTS touchbase_stats (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    match_id INTEGER NULL,
    metric VARCHAR(60) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stats_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_stats_match FOREIGN KEY (match_id)
        REFERENCES touchbase_schedule(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stats_team_user ON touchbase_stats(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_stats_metric ON touchbase_stats(metric);
CREATE INDEX IF NOT EXISTS idx_stats_match ON touchbase_stats(match_id);

COMMENT ON TABLE touchbase_stats IS 'Player performance statistics';
COMMENT ON COLUMN touchbase_stats.user_id IS 'Player user ID';
COMMENT ON COLUMN touchbase_stats.match_id IS 'Optional reference to schedule.id (for game stats)';
COMMENT ON COLUMN touchbase_stats.metric IS 'Stat type: AVG, OBP, SLG, HR, RBI, R, H, 2B, 3B, BB, SO, SB, IP, ERA, K, W, L, SV';

-- ============================================================
-- Triggers for updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON touchbase_clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON touchbase_seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON touchbase_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roster_updated_at BEFORE UPDATE ON touchbase_roster
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON touchbase_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON touchbase_attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Sample Data (for testing)
-- ============================================================

-- Insert a demo club
INSERT INTO touchbase_clubs (name, city, country) VALUES
('Demo Baseball Club', 'Santo Domingo', 'Dominican Republic')
ON CONFLICT DO NOTHING;

-- Insert a demo season
INSERT INTO touchbase_seasons (club_id, name, start_date, end_date, is_active)
SELECT id, '2025-2026', '2025-09-01', '2026-06-30', TRUE
FROM touchbase_clubs
WHERE name = 'Demo Baseball Club'
ON CONFLICT DO NOTHING;

-- ============================================================
-- End of migration
-- ============================================================
