-- ═══════════════════════════════════════════════════════════════
-- TouchBase - FINAL IDEMPOTENT Migration Script
-- ═══════════════════════════════════════════════════════════════
--
-- This script can be executed MULTIPLE times safely
-- It will NOT error if objects already exist
--
-- INSTRUCTIONS:
-- 1. Select ALL (Cmd+A)
-- 2. Copy (Cmd+C)
-- 3. Open: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql
-- 4. Paste in SQL Editor
-- 5. Click RUN
-- 6. Ignore warnings about "already exists" - that's normal
--
-- ═══════════════════════════════════════════════════════════════

-- Clean and recreate function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- MIGRATION 000: Tracking Table
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    batch INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_migrations_name ON touchbase_migrations(migration_name);
CREATE INDEX IF NOT EXISTS idx_migrations_batch ON touchbase_migrations(batch);

-- ============================================================
-- MIGRATION 001: Core Tables
-- ============================================================

-- Clubs
CREATE TABLE IF NOT EXISTS touchbase_clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(120) NULL,
    country VARCHAR(60) NULL DEFAULT 'Dominican Republic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clubs_name ON touchbase_clubs(name);

-- Seasons
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

-- Teams
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

-- Event types
DO $$ BEGIN
    CREATE TYPE touchbase_event_type AS ENUM ('practice', 'game');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Roster
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

-- Schedule
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

-- Attendance status
DO $$ BEGIN
    CREATE TYPE touchbase_attendance_status AS ENUM ('present', 'late', 'absent', 'excused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Attendance
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

-- Stats
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

-- ============================================================
-- MIGRATION 003: Tenants & Branding
-- ============================================================

-- Theme mode
DO $$ BEGIN
    CREATE TYPE touchbase_theme_mode AS ENUM ('dark', 'light', 'auto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tenants
CREATE TABLE IF NOT EXISTS touchbase_tenants (
    id SERIAL PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(100) UNIQUE NULL,
    logo_url VARCHAR(255) NULL,
    logo_dark_url VARCHAR(255) NULL,
    favicon_url VARCHAR(255) NULL,
    color_primary VARCHAR(7) DEFAULT '#0ea5e9',
    color_secondary VARCHAR(7) DEFAULT '#22c55e',
    color_accent VARCHAR(7) DEFAULT '#f59e0b',
    color_danger VARCHAR(7) DEFAULT '#ef4444',
    theme_mode touchbase_theme_mode DEFAULT 'dark',
    font_family VARCHAR(255) NULL,
    website_url VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    timezone VARCHAR(64) DEFAULT 'America/Santo_Domingo',
    locale VARCHAR(10) DEFAULT 'en_US',
    features_enabled JSONB NULL DEFAULT '{}',
    settings JSONB NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenants_active ON touchbase_tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_code ON touchbase_tenants(code);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON touchbase_tenants(slug);

-- Add tenant_id to clubs if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'touchbase_clubs' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE touchbase_clubs ADD COLUMN tenant_id INTEGER NULL;
    END IF;
END $$;

ALTER TABLE touchbase_clubs DROP CONSTRAINT IF EXISTS fk_club_tenant;
ALTER TABLE touchbase_clubs
ADD CONSTRAINT fk_club_tenant
    FOREIGN KEY (tenant_id) REFERENCES touchbase_tenants(id) ON DELETE SET NULL;

-- SUJETO10 Tenant
INSERT INTO touchbase_tenants (
    code, name, slug, color_primary, color_secondary, color_accent, color_danger,
    theme_mode, website_url, email, timezone, locale, features_enabled, is_active
) VALUES (
    'sujeto10', 'SUJETO10', 'sujeto10',
    '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444',
    'dark', 'https://touchbase.sujeto10.com', 'info@sujeto10.com',
    'America/Santo_Domingo', 'es_DO',
    '{"tournaments": true, "notifications": true, "payments": true, "ai_assistant": true, "analytics": true}'::jsonb,
    TRUE
) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    features_enabled = EXCLUDED.features_enabled,
    updated_at = CURRENT_TIMESTAMP;

-- Tenant sessions
CREATE TABLE IF NOT EXISTS touchbase_tenant_sessions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    user_id UUID NULL,
    session_key VARCHAR(64) NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    CONSTRAINT uniq_session UNIQUE (session_key),
    CONSTRAINT fk_session_tenant FOREIGN KEY (tenant_id)
        REFERENCES touchbase_tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tenant_sessions_tenant_user ON touchbase_tenant_sessions(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_sessions_last_accessed ON touchbase_tenant_sessions(last_accessed);

-- Tenant analytics
CREATE TABLE IF NOT EXISTS touchbase_tenant_analytics (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    metric_date DATE NOT NULL,
    metadata JSONB NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_tenant_metric_date UNIQUE (tenant_id, metric_name, metric_date),
    CONSTRAINT fk_analytics_tenant FOREIGN KEY (tenant_id)
        REFERENCES touchbase_tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tenant_analytics_metric_date ON touchbase_tenant_analytics(metric_name, metric_date);

-- ============================================================
-- MIGRATION 004: Tournaments
-- ============================================================

-- Tournament enums
DO $$ BEGIN CREATE TYPE touchbase_tournament_format AS ENUM ('round_robin', 'knockout', 'groups_knockout', 'double_elimination');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE touchbase_tournament_status AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE touchbase_match_status AS ENUM ('scheduled', 'in_progress', 'completed', 'postponed', 'cancelled', 'forfeit');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tournaments
CREATE TABLE IF NOT EXISTS touchbase_tournaments (
    id SERIAL PRIMARY KEY,
    season_id INTEGER NOT NULL,
    name VARCHAR(160) NOT NULL,
    description TEXT NULL,
    format touchbase_tournament_format NOT NULL DEFAULT 'round_robin',
    num_groups INTEGER NULL,
    teams_per_group INTEGER NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    status touchbase_tournament_status DEFAULT 'draft',
    settings JSONB NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tournament_season FOREIGN KEY (season_id)
        REFERENCES touchbase_seasons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tournaments_season ON touchbase_tournaments(season_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON touchbase_tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_dates ON touchbase_tournaments(start_date, end_date);

-- Tournament teams
CREATE TABLE IF NOT EXISTS touchbase_tournament_teams (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    group_name VARCHAR(10) NULL,
    seed INTEGER NULL,
    CONSTRAINT uniq_tournament_team UNIQUE (tournament_id, team_id),
    CONSTRAINT fk_tt_tournament FOREIGN KEY (tournament_id)
        REFERENCES touchbase_tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_tt_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament ON touchbase_tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_group ON touchbase_tournament_teams(tournament_id, group_name);

-- Matches
CREATE TABLE IF NOT EXISTS touchbase_matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    round INTEGER NULL,
    match_number INTEGER NULL,
    team_home INTEGER NOT NULL,
    team_away INTEGER NOT NULL,
    scheduled_at TIMESTAMP NULL,
    venue VARCHAR(160) NULL,
    score_home INTEGER DEFAULT 0,
    score_away INTEGER DEFAULT 0,
    innings_played INTEGER NULL,
    status touchbase_match_status DEFAULT 'scheduled',
    winner_team_id INTEGER NULL,
    notes TEXT NULL,
    box_score JSONB NULL,
    played_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_tournament FOREIGN KEY (tournament_id)
        REFERENCES touchbase_tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_home_team FOREIGN KEY (team_home)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_away_team FOREIGN KEY (team_away)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_winner FOREIGN KEY (winner_team_id)
        REFERENCES touchbase_teams(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON touchbase_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_round ON touchbase_matches(tournament_id, round);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON touchbase_matches(team_home, team_away);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled ON touchbase_matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON touchbase_matches(status);

-- Standings view
CREATE OR REPLACE VIEW touchbase_standings AS
SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.season_id,
    tour.id AS tournament_id,
    tour.name AS tournament_name,
    COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) AS games_played,
    COUNT(DISTINCT CASE WHEN m.status = 'completed' AND m.winner_team_id = t.id THEN m.id END) AS wins,
    COUNT(DISTINCT CASE WHEN m.status = 'completed' AND m.winner_team_id IS NOT NULL AND m.winner_team_id != t.id THEN m.id END) AS losses,
    COUNT(DISTINCT CASE WHEN m.status = 'completed' AND m.winner_team_id IS NULL AND m.score_home = m.score_away THEN m.id END) AS ties,
    SUM(CASE WHEN m.team_home = t.id THEN m.score_home WHEN m.team_away = t.id THEN m.score_away ELSE 0 END) AS runs_for,
    SUM(CASE WHEN m.team_home = t.id THEN m.score_away WHEN m.team_away = t.id THEN m.score_home ELSE 0 END) AS runs_against,
    CASE
        WHEN COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) > 0
        THEN ROUND(COUNT(DISTINCT CASE WHEN m.status = 'completed' AND m.winner_team_id = t.id THEN m.id END)::NUMERIC * 100.0 /
             COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END), 1)
        ELSE 0.0
    END AS win_percentage
FROM touchbase_teams t
LEFT JOIN touchbase_tournament_teams tt ON tt.team_id = t.id
LEFT JOIN touchbase_tournaments tour ON tour.id = tt.tournament_id
LEFT JOIN touchbase_matches m ON m.tournament_id = tour.id AND (m.team_home = t.id OR m.team_away = t.id)
GROUP BY t.id, t.name, t.season_id, tour.id, tour.name;

-- ============================================================
-- MIGRATION 005: Email Queue
-- ============================================================

DO $$ BEGIN CREATE TYPE touchbase_email_status AS ENUM ('queued', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

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

-- ============================================================
-- MIGRATION 006: Billing
-- ============================================================

DO $$ BEGIN CREATE TYPE touchbase_payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

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

CREATE TABLE IF NOT EXISTS touchbase_billing_config (
    id SERIAL PRIMARY KEY,
    team_id INTEGER UNIQUE NOT NULL,
    fee_per_player INTEGER DEFAULT 0,
    fee_per_season INTEGER DEFAULT 0,
    stripe_account_id VARCHAR(255) NULL,
    payment_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_config_team FOREIGN KEY (team_id)
        REFERENCES touchbase_teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_billing_config_team ON touchbase_billing_config(team_id);

-- ============================================================
-- ALL TRIGGERS (Idempotent - drops first)
-- ============================================================

-- Core tables triggers
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_clubs_updated_at ON touchbase_clubs';
    EXECUTE 'CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON touchbase_clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_seasons_updated_at ON touchbase_seasons';
    EXECUTE 'CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON touchbase_seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_teams_updated_at ON touchbase_teams';
    EXECUTE 'CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON touchbase_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_roster_updated_at ON touchbase_roster';
    EXECUTE 'CREATE TRIGGER update_roster_updated_at BEFORE UPDATE ON touchbase_roster FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_schedule_updated_at ON touchbase_schedule';
    EXECUTE 'CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON touchbase_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_attendance_updated_at ON touchbase_attendance';
    EXECUTE 'CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON touchbase_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Tenant tables triggers
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_tenants_updated_at ON touchbase_tenants';
    EXECUTE 'CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON touchbase_tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Tournament tables triggers
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_tournaments_updated_at ON touchbase_tournaments';
    EXECUTE 'CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON touchbase_tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_matches_updated_at ON touchbase_matches';
    EXECUTE 'CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON touchbase_matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Email queue trigger
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_email_queue_updated_at ON touchbase_email_queue';
    EXECUTE 'CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON touchbase_email_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Billing triggers
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_billing_transactions_updated_at ON touchbase_billing_transactions';
    EXECUTE 'CREATE TRIGGER update_billing_transactions_updated_at BEFORE UPDATE ON touchbase_billing_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS update_billing_config_updated_at ON touchbase_billing_config';
    EXECUTE 'CREATE TRIGGER update_billing_config_updated_at BEFORE UPDATE ON touchbase_billing_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- Sample Data
-- ============================================================

INSERT INTO touchbase_clubs (name, city, country) VALUES
('Demo Baseball Club', 'Santo Domingo', 'Dominican Republic')
ON CONFLICT DO NOTHING;

INSERT INTO touchbase_seasons (club_id, name, start_date, end_date, is_active)
SELECT id, '2025-2026', '2025-09-01', '2026-06-30', TRUE
FROM touchbase_clubs WHERE name = 'Demo Baseball Club'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Migration Complete
-- ═══════════════════════════════════════════════════════════════
--
-- Verify with:
--   SELECT code, name FROM touchbase_tenants WHERE code = 'sujeto10';
--
-- Should return:
--   code: sujeto10
--   name: SUJETO10
--
-- ═══════════════════════════════════════════════════════════════
