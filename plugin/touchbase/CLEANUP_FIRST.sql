-- ═══════════════════════════════════════════════════════════════
-- TouchBase - Complete Cleanup Script
-- ═══════════════════════════════════════════════════════════════
--
-- EXECUTE THIS FIRST to clean all existing TouchBase objects
--
-- INSTRUCTIONS:
-- 1. Copy ALL this file (Cmd+A, Cmd+C)
-- 2. Open: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql
-- 3. Click "New query"
-- 4. Paste (Cmd+V)
-- 5. Click "RUN"
-- 6. Wait for completion
--
-- ═══════════════════════════════════════════════════════════════

-- Drop all triggers first
DROP TRIGGER IF EXISTS update_billing_config_updated_at ON touchbase_billing_config CASCADE;
DROP TRIGGER IF EXISTS update_billing_transactions_updated_at ON touchbase_billing_transactions CASCADE;
DROP TRIGGER IF EXISTS update_email_queue_updated_at ON touchbase_email_queue CASCADE;
DROP TRIGGER IF EXISTS update_matches_updated_at ON touchbase_matches CASCADE;
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON touchbase_tournaments CASCADE;
DROP TRIGGER IF EXISTS update_tenants_updated_at ON touchbase_tenants CASCADE;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON touchbase_attendance CASCADE;
DROP TRIGGER IF EXISTS update_schedule_updated_at ON touchbase_schedule CASCADE;
DROP TRIGGER IF EXISTS update_roster_updated_at ON touchbase_roster CASCADE;
DROP TRIGGER IF EXISTS update_teams_updated_at ON touchbase_teams CASCADE;
DROP TRIGGER IF EXISTS update_seasons_updated_at ON touchbase_seasons CASCADE;
DROP TRIGGER IF EXISTS update_clubs_updated_at ON touchbase_clubs CASCADE;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS touchbase_billing_config CASCADE;
DROP TABLE IF EXISTS touchbase_billing_transactions CASCADE;
DROP TABLE IF EXISTS touchbase_email_queue CASCADE;
DROP TABLE IF EXISTS touchbase_tenant_analytics CASCADE;
DROP TABLE IF EXISTS touchbase_tenant_sessions CASCADE;
DROP TABLE IF EXISTS touchbase_stats CASCADE;
DROP TABLE IF EXISTS touchbase_attendance CASCADE;
DROP TABLE IF EXISTS touchbase_schedule CASCADE;
DROP TABLE IF EXISTS touchbase_roster CASCADE;
DROP TABLE IF EXISTS touchbase_matches CASCADE;
DROP TABLE IF EXISTS touchbase_tournament_teams CASCADE;
DROP TABLE IF EXISTS touchbase_tournaments CASCADE;
DROP TABLE IF EXISTS touchbase_teams CASCADE;
DROP TABLE IF EXISTS touchbase_seasons CASCADE;
DROP TABLE IF EXISTS touchbase_clubs CASCADE;
DROP TABLE IF EXISTS touchbase_tenants CASCADE;
DROP TABLE IF EXISTS touchbase_migrations CASCADE;

-- Drop all views
DROP VIEW IF EXISTS touchbase_standings CASCADE;

-- Drop all custom types (ENUMs)
DROP TYPE IF EXISTS touchbase_payment_status CASCADE;
DROP TYPE IF EXISTS touchbase_email_status CASCADE;
DROP TYPE IF EXISTS touchbase_match_status CASCADE;
DROP TYPE IF EXISTS touchbase_tournament_status CASCADE;
DROP TYPE IF EXISTS touchbase_tournament_format CASCADE;
DROP TYPE IF EXISTS touchbase_theme_mode CASCADE;
DROP TYPE IF EXISTS touchbase_attendance_status CASCADE;
DROP TYPE IF EXISTS touchbase_event_type CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- Cleanup Complete
-- ═══════════════════════════════════════════════════════════════
--
-- Now execute: COPY_PASTE_THIS.sql
--
-- ═══════════════════════════════════════════════════════════════
