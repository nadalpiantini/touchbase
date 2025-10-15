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
