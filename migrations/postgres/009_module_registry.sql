-- =====================================================
-- Migration 009: Module Registry System
-- Description: Feature gating system with module enable/disable per tenant
-- Author: Claude Code
-- Date: 2024-12-20
-- =====================================================

-- Module type enum
DO $$ BEGIN
    CREATE TYPE touchbase_module_type AS ENUM (
        'teachers',
        'classes',
        'attendance',
        'schedules',
        'analytics',
        'gamification',
        'ai_coaching',
        'reports',
        'notifications',
        'integrations'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Modules catalog table (master list of all available modules)
CREATE TABLE IF NOT EXISTS touchbase_modules (
    id SERIAL PRIMARY KEY,
    module_key touchbase_module_type NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    is_core BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    requires_modules touchbase_module_type[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant-specific module enablement (junction table)
CREATE TABLE IF NOT EXISTS touchbase_tenant_modules (
    id SERIAL PRIMARY KEY,
    org_id UUID NOT NULL,
    module_key touchbase_module_type NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    enabled_by UUID,
    enabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disabled_at TIMESTAMP NULL,
    settings JSONB DEFAULT '{}',
    CONSTRAINT uniq_org_module UNIQUE (org_id, module_key),
    CONSTRAINT fk_org FOREIGN KEY (org_id) 
        REFERENCES touchbase_organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_module FOREIGN KEY (module_key) 
        REFERENCES touchbase_modules(module_key) ON DELETE CASCADE
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tenant_modules_org 
    ON touchbase_tenant_modules(org_id);

CREATE INDEX IF NOT EXISTS idx_tenant_modules_enabled 
    ON touchbase_tenant_modules(org_id, is_enabled) 
    WHERE is_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_modules_available 
    ON touchbase_modules(is_available) 
    WHERE is_available = TRUE;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

ALTER TABLE touchbase_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_tenant_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: All authenticated users can view available modules
CREATE POLICY modules_select_all 
    ON touchbase_modules 
    FOR SELECT 
    TO authenticated 
    USING (is_available = TRUE);

-- RLS Policy 2: Users can view modules for their organization
CREATE POLICY tenant_modules_select_own_org 
    ON touchbase_tenant_modules 
    FOR SELECT 
    TO authenticated 
    USING (
        org_id IN (
            SELECT org_id 
            FROM touchbase_user_organizations 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy 3: Only owners/admins can enable/disable modules
CREATE POLICY tenant_modules_insert_owner_admin 
    ON touchbase_tenant_modules 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        org_id IN (
            SELECT org_id 
            FROM touchbase_user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- RLS Policy 4: Only owners/admins can update module settings
CREATE POLICY tenant_modules_update_owner_admin 
    ON touchbase_tenant_modules 
    FOR UPDATE 
    TO authenticated 
    USING (
        org_id IN (
            SELECT org_id 
            FROM touchbase_user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- RLS Policy 5: Only owners can delete module associations
CREATE POLICY tenant_modules_delete_owner 
    ON touchbase_tenant_modules 
    FOR DELETE 
    TO authenticated 
    USING (
        org_id IN (
            SELECT org_id 
            FROM touchbase_user_organizations 
            WHERE user_id = auth.uid() 
            AND role = 'owner'
        )
    );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function: Check if module is enabled for current user's org
CREATE OR REPLACE FUNCTION touchbase_is_module_enabled(
    p_module_key touchbase_module_type
)
RETURNS BOOLEAN AS $$
DECLARE
    v_org_id UUID;
    v_is_enabled BOOLEAN;
BEGIN
    -- Get current user's active org
    SELECT org_id INTO v_org_id
    FROM touchbase_user_organizations
    WHERE user_id = auth.uid()
    ORDER BY 
        CASE role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'coach' THEN 3
            WHEN 'viewer' THEN 4
        END
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if module is enabled for this org
    SELECT is_enabled INTO v_is_enabled
    FROM touchbase_tenant_modules
    WHERE org_id = v_org_id 
    AND module_key = p_module_key;

    -- If no record exists, return FALSE (module not enabled by default)
    RETURN COALESCE(v_is_enabled, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get all enabled modules for current user's org
CREATE OR REPLACE FUNCTION touchbase_get_enabled_modules()
RETURNS TABLE (
    module_key touchbase_module_type,
    name VARCHAR,
    description TEXT,
    icon VARCHAR,
    category VARCHAR,
    settings JSONB
) AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Get current user's active org
    SELECT org_id INTO v_org_id
    FROM touchbase_user_organizations
    WHERE user_id = auth.uid()
    ORDER BY 
        CASE role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'coach' THEN 3
            WHEN 'viewer' THEN 4
        END
    LIMIT 1;

    IF v_org_id IS NULL THEN
        RETURN;
    END IF;

    -- Return enabled modules with their details
    RETURN QUERY
    SELECT 
        m.module_key,
        m.name,
        m.description,
        m.icon,
        m.category,
        tm.settings
    FROM touchbase_modules m
    JOIN touchbase_tenant_modules tm ON tm.module_key = m.module_key
    WHERE tm.org_id = v_org_id
    AND tm.is_enabled = TRUE
    AND m.is_available = TRUE
    ORDER BY m.category, m.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Enable module for organization
CREATE OR REPLACE FUNCTION touchbase_enable_module(
    p_org_id UUID,
    p_module_key touchbase_module_type,
    p_settings JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_role touchbase_role;
BEGIN
    -- Check user has permission (owner or admin)
    SELECT role INTO v_user_role
    FROM touchbase_user_organizations
    WHERE user_id = auth.uid()
    AND org_id = p_org_id;

    IF v_user_role IS NULL OR v_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to enable modules';
    END IF;

    -- Insert or update module enablement
    INSERT INTO touchbase_tenant_modules (
        org_id,
        module_key,
        is_enabled,
        enabled_by,
        enabled_at,
        settings
    ) VALUES (
        p_org_id,
        p_module_key,
        TRUE,
        auth.uid(),
        CURRENT_TIMESTAMP,
        p_settings
    )
    ON CONFLICT (org_id, module_key)
    DO UPDATE SET
        is_enabled = TRUE,
        enabled_by = auth.uid(),
        enabled_at = CURRENT_TIMESTAMP,
        disabled_at = NULL,
        settings = p_settings;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Disable module for organization
CREATE OR REPLACE FUNCTION touchbase_disable_module(
    p_org_id UUID,
    p_module_key touchbase_module_type
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_role touchbase_role;
    v_is_core BOOLEAN;
BEGIN
    -- Check user has permission (owner or admin)
    SELECT role INTO v_user_role
    FROM touchbase_user_organizations
    WHERE user_id = auth.uid()
    AND org_id = p_org_id;

    IF v_user_role IS NULL OR v_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to disable modules';
    END IF;

    -- Check if module is core (cannot be disabled)
    SELECT is_core INTO v_is_core
    FROM touchbase_modules
    WHERE module_key = p_module_key;

    IF v_is_core = TRUE THEN
        RAISE EXCEPTION 'Cannot disable core module: %', p_module_key;
    END IF;

    -- Update module to disabled
    UPDATE touchbase_tenant_modules
    SET 
        is_enabled = FALSE,
        disabled_at = CURRENT_TIMESTAMP
    WHERE org_id = p_org_id
    AND module_key = p_module_key;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Seed Data: Initial modules catalog
-- =====================================================

INSERT INTO touchbase_modules (module_key, name, description, icon, category, is_core, is_available) VALUES
('teachers', 'Teachers Module', 'Teacher profiles, credentials, and assignment management', '👨‍🏫', 'core', TRUE, TRUE),
('classes', 'Classes Module', 'Class creation, scheduling, and enrollment management', '🏫', 'core', TRUE, TRUE),
('attendance', 'Attendance System', 'Take attendance, track participation, and generate reports', '✅', 'core', TRUE, TRUE),
('schedules', 'Schedules Module', 'Class schedules, calendar views, and time management', '📅', 'core', TRUE, TRUE),
('analytics', 'Analytics Dashboard', 'Student performance analytics and insights', '📊', 'premium', FALSE, TRUE),
('gamification', 'Gamification', 'Badges, points, leaderboards, and rewards system', '🏆', 'premium', FALSE, TRUE),
('ai_coaching', 'AI Coaching', 'AI-powered coaching recommendations and feedback', '🤖', 'premium', FALSE, TRUE),
('reports', 'Advanced Reports', 'Comprehensive reporting and data exports', '📈', 'premium', FALSE, TRUE),
('notifications', 'Notifications', 'Email, SMS, and push notification system', '🔔', 'addon', FALSE, TRUE),
('integrations', 'Integrations', 'Third-party integrations (Google Classroom, etc)', '🔗', 'addon', FALSE, TRUE)
ON CONFLICT (module_key) DO NOTHING;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_module_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER modules_updated_at
    BEFORE UPDATE ON touchbase_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_module_timestamp();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE touchbase_modules IS 'Master catalog of all available modules in the system';
COMMENT ON TABLE touchbase_tenant_modules IS 'Per-tenant module enablement and configuration';
COMMENT ON FUNCTION touchbase_is_module_enabled IS 'Check if a specific module is enabled for current users organization';
COMMENT ON FUNCTION touchbase_get_enabled_modules IS 'Get list of all enabled modules for current users organization';
COMMENT ON FUNCTION touchbase_enable_module IS 'Enable a module for an organization (requires owner/admin role)';
COMMENT ON FUNCTION touchbase_disable_module IS 'Disable a module for an organization (requires owner/admin role)';
