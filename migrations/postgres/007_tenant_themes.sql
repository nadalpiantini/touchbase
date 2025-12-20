-- ============================================================
-- TouchBase Tenant Themes Schema
-- Whitelabel Branding System
-- Migration: 007
-- ============================================================

-- Tenant Themes Table
-- Stores custom branding per organization for whitelabel system
CREATE TABLE IF NOT EXISTS touchbase_tenant_themes (
    id SERIAL PRIMARY KEY,
    org_id UUID NOT NULL,

    -- Color Palette (hex format)
    primary_color VARCHAR(7) NOT NULL DEFAULT '#B21E2A',
    secondary_color VARCHAR(7) NOT NULL DEFAULT '#14213D',
    accent_color VARCHAR(7) NOT NULL DEFAULT '#C82E3C',

    -- Typography
    font_family VARCHAR(100) NOT NULL DEFAULT 'Oswald',

    -- Branding Assets
    logo_url TEXT NULL,
    favicon_url TEXT NULL,

    -- Custom Domain
    custom_domain VARCHAR(255) NULL,

    -- Dark Mode Support
    dark_mode_enabled BOOLEAN DEFAULT FALSE,
    dark_primary_color VARCHAR(7) NULL,
    dark_secondary_color VARCHAR(7) NULL,
    dark_accent_color VARCHAR(7) NULL,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_by UUID NULL,

    -- Constraints
    CONSTRAINT uniq_org_theme UNIQUE (org_id),
    CONSTRAINT chk_primary_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_secondary_color CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_accent_color CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_dark_primary_color CHECK (dark_primary_color IS NULL OR dark_primary_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_dark_secondary_color CHECK (dark_secondary_color IS NULL OR dark_secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_dark_accent_color CHECK (dark_accent_color IS NULL OR dark_accent_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_themes_org ON touchbase_tenant_themes(org_id);
CREATE INDEX IF NOT EXISTS idx_tenant_themes_custom_domain ON touchbase_tenant_themes(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenant_themes_updated ON touchbase_tenant_themes(updated_at DESC);

-- Comments
COMMENT ON TABLE touchbase_tenant_themes IS 'Tenant-specific branding themes for whitelabel system';
COMMENT ON COLUMN touchbase_tenant_themes.org_id IS 'Organization ID (FK to organizations table)';
COMMENT ON COLUMN touchbase_tenant_themes.primary_color IS 'Primary brand color in hex format (#RRGGBB)';
COMMENT ON COLUMN touchbase_tenant_themes.secondary_color IS 'Secondary brand color in hex format (#RRGGBB)';
COMMENT ON COLUMN touchbase_tenant_themes.accent_color IS 'Accent color for highlights in hex format (#RRGGBB)';
COMMENT ON COLUMN touchbase_tenant_themes.font_family IS 'Brand font family name (e.g., "Roboto", "Arial")';
COMMENT ON COLUMN touchbase_tenant_themes.logo_url IS 'URL or path to organization logo';
COMMENT ON COLUMN touchbase_tenant_themes.favicon_url IS 'URL or path to custom favicon';
COMMENT ON COLUMN touchbase_tenant_themes.custom_domain IS 'Custom domain for tenant (e.g., "academy.myorg.com")';
COMMENT ON COLUMN touchbase_tenant_themes.dark_mode_enabled IS 'Whether dark mode theme is enabled';

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS
ALTER TABLE touchbase_tenant_themes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view themes for their organization
CREATE POLICY tenant_themes_select_policy
    ON touchbase_tenant_themes
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Only org owners and admins can create themes
CREATE POLICY tenant_themes_insert_policy
    ON touchbase_tenant_themes
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Only org owners and admins can update themes
CREATE POLICY tenant_themes_update_policy
    ON touchbase_tenant_themes
    FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Only org owners can delete themes
CREATE POLICY tenant_themes_delete_policy
    ON touchbase_tenant_themes
    FOR DELETE
    USING (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- ============================================================
-- Updated At Trigger
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tenant_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on UPDATE
CREATE TRIGGER trigger_tenant_themes_updated_at
    BEFORE UPDATE ON touchbase_tenant_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_themes_updated_at();

-- ============================================================
-- Sample Data (Optional - for development/testing)
-- ============================================================

-- Insert default theme for demo organization (if exists)
-- Uncomment for development seeding
/*
INSERT INTO touchbase_tenant_themes (
    org_id,
    primary_color,
    secondary_color,
    accent_color,
    font_family,
    logo_url
)
VALUES (
    'demo-org-uuid-here'::uuid,
    '#B21E2A',  -- TouchBase Red
    '#14213D',  -- TouchBase Navy
    '#C82E3C',  -- TouchBase Stitch
    'Oswald',
    '/touchbase-logo.png'
)
ON CONFLICT (org_id) DO NOTHING;
*/
