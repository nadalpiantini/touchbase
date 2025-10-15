-- ============================================================
-- TouchBase Migration 000: Migrations Tracking Table
-- Tracks which migrations have been applied
-- Prefix: touchbase_*
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    batch INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_migrations_name ON touchbase_migrations(migration_name);
CREATE INDEX IF NOT EXISTS idx_migrations_batch ON touchbase_migrations(batch);

COMMENT ON TABLE touchbase_migrations IS 'Track applied database migrations';

-- ============================================================
-- End of migration
-- ============================================================
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
-- ============================================================
-- TouchBase Migration 003: Tenant Branding System (PostgreSQL)
-- Enables per-league/club customization with 2-4 colors + logo
-- Prefix: touchbase_*
-- ============================================================

-- Theme mode enum
DO $$ BEGIN
    CREATE TYPE touchbase_theme_mode AS ENUM ('dark', 'light', 'auto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tenants table (leagues, clubs, or organizations)
CREATE TABLE IF NOT EXISTS touchbase_tenants (
    id SERIAL PRIMARY KEY,

    -- Identification
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(100) UNIQUE NULL,

    -- Branding Assets
    logo_url VARCHAR(255) NULL,
    logo_dark_url VARCHAR(255) NULL,
    favicon_url VARCHAR(255) NULL,

    -- Color Palette (2-4 customizable colors)
    color_primary VARCHAR(7) DEFAULT '#0ea5e9',
    color_secondary VARCHAR(7) DEFAULT '#22c55e',
    color_accent VARCHAR(7) DEFAULT '#f59e0b',
    color_danger VARCHAR(7) DEFAULT '#ef4444',

    -- Theme Configuration
    theme_mode touchbase_theme_mode DEFAULT 'dark',
    font_family VARCHAR(255) NULL,

    -- Contact & Metadata
    website_url VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    timezone VARCHAR(64) DEFAULT 'America/Santo_Domingo',
    locale VARCHAR(10) DEFAULT 'en_US',

    -- Feature Flags
    features_enabled JSONB NULL DEFAULT '{}',
    settings JSONB NULL DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenants_active ON touchbase_tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_code ON touchbase_tenants(code);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON touchbase_tenants(slug);

COMMENT ON TABLE touchbase_tenants IS 'Tenant branding and configuration';
COMMENT ON COLUMN touchbase_tenants.code IS 'Unique tenant identifier (e.g., "rddominicana", "nyc-youth")';
COMMENT ON COLUMN touchbase_tenants.name IS 'Display name (e.g., "República Dominicana Baseball Federation")';
COMMENT ON COLUMN touchbase_tenants.slug IS 'URL-friendly version of name';
COMMENT ON COLUMN touchbase_tenants.color_primary IS 'Primary brand color (hex)';
COMMENT ON COLUMN touchbase_tenants.color_secondary IS 'Secondary brand color (hex)';
COMMENT ON COLUMN touchbase_tenants.color_accent IS 'Accent/highlight color (hex)';
COMMENT ON COLUMN touchbase_tenants.color_danger IS 'Error/danger color (hex)';
COMMENT ON COLUMN touchbase_tenants.theme_mode IS 'Default theme preference';
COMMENT ON COLUMN touchbase_tenants.font_family IS 'Optional custom font (Google Fonts name or CSS stack)';
COMMENT ON COLUMN touchbase_tenants.features_enabled IS 'JSON object of enabled features {"tournaments": true, "payments": false}';
COMMENT ON COLUMN touchbase_tenants.settings IS 'Tenant-specific settings and overrides';

-- ============================================================
-- Migrate existing clubs to tenants
-- ============================================================

INSERT INTO touchbase_tenants (code, name, color_primary, color_secondary, is_active)
SELECT
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, ' ', '-', 'g'), '[^a-z0-9-]', '', 'g')),
    name,
    '#0ea5e9',
    '#22c55e',
    TRUE
FROM touchbase_clubs
WHERE NOT EXISTS (
    SELECT 1 FROM touchbase_tenants
    WHERE touchbase_tenants.code = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(touchbase_clubs.name, ' ', '-', 'g'), '[^a-z0-9-]', '', 'g'))
);

-- ============================================================
-- Add tenant_id to clubs (link clubs to tenants)
-- ============================================================

ALTER TABLE touchbase_clubs
ADD COLUMN IF NOT EXISTS tenant_id INTEGER NULL;

ALTER TABLE touchbase_clubs
DROP CONSTRAINT IF EXISTS fk_club_tenant;

ALTER TABLE touchbase_clubs
ADD CONSTRAINT fk_club_tenant
    FOREIGN KEY (tenant_id) REFERENCES touchbase_tenants(id) ON DELETE SET NULL;

-- Link existing clubs to their corresponding tenants
UPDATE touchbase_clubs c
SET tenant_id = t.id
FROM touchbase_tenants t
WHERE t.code = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(c.name, ' ', '-', 'g'), '[^a-z0-9-]', '', 'g'));

-- ============================================================
-- Sample tenants
-- ============================================================

-- SUJETO10 Tenant (Primary tenant for deployment)
INSERT INTO touchbase_tenants (
    code,
    name,
    slug,
    logo_url,
    color_primary,
    color_secondary,
    color_accent,
    color_danger,
    theme_mode,
    website_url,
    email,
    timezone,
    locale,
    features_enabled,
    is_active
) VALUES (
    'sujeto10',
    'SUJETO10',
    'sujeto10',
    NULL,
    '#0ea5e9', -- Sky blue
    '#22c55e', -- Field green
    '#f59e0b', -- Amber accent
    '#ef4444', -- Red danger
    'dark',
    'https://touchbase.sujeto10.com',
    'info@sujeto10.com',
    'America/Santo_Domingo',
    'es_DO',
    '{"tournaments": true, "notifications": true, "payments": true, "ai_assistant": true, "analytics": true}'::jsonb,
    TRUE
) ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    features_enabled = EXCLUDED.features_enabled,
    updated_at = CURRENT_TIMESTAMP;

-- Demo Tenant
INSERT INTO touchbase_tenants (
    code,
    name,
    logo_url,
    color_primary,
    color_secondary,
    color_accent,
    color_danger,
    theme_mode,
    website_url,
    email,
    timezone,
    locale,
    features_enabled,
    is_active
) VALUES (
    'touchbase-demo',
    'TouchBase Demo League',
    '/assets/img/logo-demo.svg',
    '#0ea5e9',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    'dark',
    'https://touchbase-demo.example.com',
    'admin@touchbase-demo.example.com',
    'America/Santo_Domingo',
    'en_US',
    '{"tournaments": true, "notifications": true, "payments": false, "ai_assistant": false}'::jsonb,
    TRUE
) ON CONFLICT (code) DO UPDATE
SET updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- Tenant Session Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_tenant_sessions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    user_id UUID NULL,
    session_key VARCHAR(64) NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    CONSTRAINT uniq_session UNIQUE (session_key),
    CONSTRAINT fk_session_tenant
        FOREIGN KEY (tenant_id) REFERENCES touchbase_tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tenant_sessions_tenant_user ON touchbase_tenant_sessions(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_sessions_last_accessed ON touchbase_tenant_sessions(last_accessed);

COMMENT ON TABLE touchbase_tenant_sessions IS 'Track active tenant context per session';
COMMENT ON COLUMN touchbase_tenant_sessions.user_id IS 'Supabase user UUID (NULL for anonymous)';

-- ============================================================
-- Tenant Usage Analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_tenant_analytics (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,

    -- Metrics
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    metric_date DATE NOT NULL,

    -- Metadata
    metadata JSONB NULL,

    -- Timestamps
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_tenant_metric_date UNIQUE (tenant_id, metric_name, metric_date),
    CONSTRAINT fk_analytics_tenant
        FOREIGN KEY (tenant_id) REFERENCES touchbase_tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tenant_analytics_metric_date ON touchbase_tenant_analytics(metric_name, metric_date);

COMMENT ON TABLE touchbase_tenant_analytics IS 'Tenant usage metrics and analytics';
COMMENT ON COLUMN touchbase_tenant_analytics.metric_name IS 'e.g., "page_views", "api_calls", "storage_mb"';

-- ============================================================
-- Triggers for updated_at
-- ============================================================

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON touchbase_tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- End of migration
-- ============================================================
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
-- ============================================================
-- TouchBase Migration 005: Email Queue System (PostgreSQL)
-- Email queue system for async notifications
-- Prefix: touchbase_*
-- ============================================================

-- Email status enum
DO $$ BEGIN
    CREATE TYPE touchbase_email_status AS ENUM ('queued', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS touchbase_email_queue (
    id SERIAL PRIMARY KEY,
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(160) NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status touchbase_email_status DEFAULT 'queued',
    attempts INTEGER DEFAULT 0,
    last_error TEXT NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON touchbase_email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON touchbase_email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email ON touchbase_email_queue(to_email);

COMMENT ON TABLE touchbase_email_queue IS 'Email queue for async notification delivery';
COMMENT ON COLUMN touchbase_email_queue.to_email IS 'Recipient email address';
COMMENT ON COLUMN touchbase_email_queue.to_name IS 'Recipient name';
COMMENT ON COLUMN touchbase_email_queue.subject IS 'Email subject';
COMMENT ON COLUMN touchbase_email_queue.body IS 'Email body (plain text or HTML)';
COMMENT ON COLUMN touchbase_email_queue.status IS 'Delivery status';
COMMENT ON COLUMN touchbase_email_queue.attempts IS 'Number of send attempts';
COMMENT ON COLUMN touchbase_email_queue.last_error IS 'Last error message if failed';
COMMENT ON COLUMN touchbase_email_queue.sent_at IS 'When successfully sent';

-- Trigger for updated_at
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON touchbase_email_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- End of migration
-- ============================================================
-- ============================================================
-- TouchBase Migration 006: Billing & Payment Tracking (PostgreSQL)
-- Billing and payment tracking (Stripe integration)
-- Prefix: touchbase_*
-- ============================================================

-- Payment status enum
DO $$ BEGIN
    CREATE TYPE touchbase_payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS touchbase_billing_transactions (
    id SERIAL PRIMARY KEY,
    checkout_id VARCHAR(255) UNIQUE NOT NULL,
    team_id INTEGER NULL,
    user_id UUID NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description VARCHAR(255) NOT NULL,
    status touchbase_payment_status DEFAULT 'pending',
    payment_method VARCHAR(50) NULL,
    metadata JSONB NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_checkout ON touchbase_billing_transactions(checkout_id);
CREATE INDEX IF NOT EXISTS idx_billing_team ON touchbase_billing_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_billing_user ON touchbase_billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON touchbase_billing_transactions(status);
CREATE INDEX IF NOT EXISTS idx_billing_created ON touchbase_billing_transactions(created_at);

COMMENT ON TABLE touchbase_billing_transactions IS 'Payment transaction log for billing and reconciliation';
COMMENT ON COLUMN touchbase_billing_transactions.checkout_id IS 'Stripe checkout session ID';
COMMENT ON COLUMN touchbase_billing_transactions.team_id IS 'Associated team (if applicable)';
COMMENT ON COLUMN touchbase_billing_transactions.user_id IS 'Associated user (payer) - Supabase UUID';
COMMENT ON COLUMN touchbase_billing_transactions.amount IS 'Amount in cents (USD)';
COMMENT ON COLUMN touchbase_billing_transactions.currency IS 'Currency code';
COMMENT ON COLUMN touchbase_billing_transactions.description IS 'Payment description';
COMMENT ON COLUMN touchbase_billing_transactions.status IS 'Payment status';
COMMENT ON COLUMN touchbase_billing_transactions.payment_method IS 'Payment method (card, bank, etc)';
COMMENT ON COLUMN touchbase_billing_transactions.metadata IS 'Additional metadata';
COMMENT ON COLUMN touchbase_billing_transactions.completed_at IS 'When payment completed';

-- Add billing preferences per team (future: per-player fees)
CREATE TABLE IF NOT EXISTS touchbase_billing_config (
    id SERIAL PRIMARY KEY,
    team_id INTEGER UNIQUE NOT NULL,
    fee_per_player INTEGER DEFAULT 0,
    fee_per_season INTEGER DEFAULT 0,
    stripe_account_id VARCHAR(255) NULL,
    payment_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_config_team
        FOREIGN KEY (team_id) REFERENCES touchbase_teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_billing_config_team ON touchbase_billing_config(team_id);

COMMENT ON TABLE touchbase_billing_config IS 'Billing configuration per team';
COMMENT ON COLUMN touchbase_billing_config.team_id IS 'Team ID';
COMMENT ON COLUMN touchbase_billing_config.fee_per_player IS 'Registration fee in cents';
COMMENT ON COLUMN touchbase_billing_config.fee_per_season IS 'Season fee in cents';
COMMENT ON COLUMN touchbase_billing_config.stripe_account_id IS 'Connected Stripe account (future)';
COMMENT ON COLUMN touchbase_billing_config.payment_enabled IS 'Enable payment collection';

-- Triggers for updated_at
CREATE TRIGGER update_billing_transactions_updated_at BEFORE UPDATE ON touchbase_billing_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_config_updated_at BEFORE UPDATE ON touchbase_billing_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- End of migration
-- ============================================================
