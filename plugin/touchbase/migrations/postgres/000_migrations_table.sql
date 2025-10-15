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
