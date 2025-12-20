-- ============================================================
-- TouchBase RBAC System (Role-Based Access Control)
-- Migration: 008
-- ============================================================

-- ============================================================
-- Organizations Table
-- Core table for multi-tenant organization management
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,

    -- Branding (references tenant_themes)
    theme_id INTEGER NULL,

    -- Metadata
    description TEXT NULL,
    website_url VARCHAR(255) NULL,
    contact_email VARCHAR(255) NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,

    -- Constraints
    CONSTRAINT fk_org_theme FOREIGN KEY (theme_id)
        REFERENCES touchbase_tenant_themes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON touchbase_organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON touchbase_organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_theme ON touchbase_organizations(theme_id);

COMMENT ON TABLE touchbase_organizations IS 'Organizations/academies for multi-tenant platform';
COMMENT ON COLUMN touchbase_organizations.slug IS 'URL-friendly identifier (e.g., "my-academy")';
COMMENT ON COLUMN touchbase_organizations.theme_id IS 'Optional link to custom tenant theme';

-- ============================================================
-- User Roles Enum
-- Hierarchical permission levels
-- ============================================================

DO $$ BEGIN
    CREATE TYPE touchbase_role AS ENUM ('owner', 'admin', 'coach', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE touchbase_role IS 'User role hierarchy: owner > admin > coach > viewer';

-- ============================================================
-- User Organizations Junction Table
-- Maps users to organizations with roles
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_user_organizations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    org_id UUID NOT NULL,
    role touchbase_role NOT NULL DEFAULT 'viewer',

    -- Metadata
    invited_by UUID NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uniq_user_org UNIQUE (user_id, org_id),
    CONSTRAINT fk_user_org_organization FOREIGN KEY (org_id)
        REFERENCES touchbase_organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_org_invited_by FOREIGN KEY (invited_by)
        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_orgs_user ON touchbase_user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org ON touchbase_user_organizations(org_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_role ON touchbase_user_organizations(role);

COMMENT ON TABLE touchbase_user_organizations IS 'User membership in organizations with roles';
COMMENT ON COLUMN touchbase_user_organizations.user_id IS 'Supabase auth user UUID';
COMMENT ON COLUMN touchbase_user_organizations.role IS 'Permission level within organization';
COMMENT ON COLUMN touchbase_user_organizations.invited_by IS 'User who invited this member';

-- ============================================================
-- RLS Policies for Organizations
-- ============================================================

ALTER TABLE touchbase_organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view organizations they belong to
CREATE POLICY organizations_select_policy
    ON touchbase_organizations
    FOR SELECT
    USING (
        id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Only owners can create organizations
CREATE POLICY organizations_insert_policy
    ON touchbase_organizations
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
    );

-- Policy: Only owners and admins can update organizations
CREATE POLICY organizations_update_policy
    ON touchbase_organizations
    FOR UPDATE
    USING (
        id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Only owners can delete organizations
CREATE POLICY organizations_delete_policy
    ON touchbase_organizations
    FOR DELETE
    USING (
        id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- ============================================================
-- RLS Policies for User Organizations
-- ============================================================

ALTER TABLE touchbase_user_organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own memberships
CREATE POLICY user_orgs_select_own_policy
    ON touchbase_user_organizations
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Admins and owners can view all memberships in their org
CREATE POLICY user_orgs_select_admin_policy
    ON touchbase_user_organizations
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Owners and admins can invite users
CREATE POLICY user_orgs_insert_policy
    ON touchbase_user_organizations
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
        AND invited_by = auth.uid()
    );

-- Policy: Owners and admins can update roles (but not their own)
CREATE POLICY user_orgs_update_policy
    ON touchbase_user_organizations
    FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
        AND user_id != auth.uid()
    )
    WITH CHECK (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Owners and admins can remove members (except themselves)
CREATE POLICY user_orgs_delete_policy
    ON touchbase_user_organizations
    FOR DELETE
    USING (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
        AND user_id != auth.uid()
    );

-- ============================================================
-- RPC Functions
-- ============================================================

-- Function: Get current user's organization and role
CREATE OR REPLACE FUNCTION touchbase_current_org()
RETURNS TABLE (
    org_id UUID,
    org_name VARCHAR,
    role touchbase_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id as org_id,
        o.name as org_name,
        uo.role as role
    FROM touchbase_user_organizations uo
    JOIN touchbase_organizations o ON o.id = uo.org_id
    WHERE uo.user_id = auth.uid()
    AND o.is_active = TRUE
    ORDER BY
        CASE uo.role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'coach' THEN 3
            WHEN 'viewer' THEN 4
        END
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION touchbase_current_org() IS 'Get user''s primary organization (highest role)';

-- Function: Check if user has permission in org
CREATE OR REPLACE FUNCTION touchbase_has_permission(
    p_org_id UUID,
    p_required_role touchbase_role
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_role touchbase_role;
    v_role_hierarchy INT;
    v_required_hierarchy INT;
BEGIN
    -- Get user's role in the organization
    SELECT role INTO v_user_role
    FROM touchbase_user_organizations
    WHERE user_id = auth.uid()
    AND org_id = p_org_id;

    -- If user is not a member, deny access
    IF v_user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Map roles to hierarchy levels (lower number = higher privilege)
    v_role_hierarchy := CASE v_user_role
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'coach' THEN 3
        WHEN 'viewer' THEN 4
    END;

    v_required_hierarchy := CASE p_required_role
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'coach' THEN 3
        WHEN 'viewer' THEN 4
    END;

    -- User has permission if their role hierarchy is <= required
    RETURN v_role_hierarchy <= v_required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION touchbase_has_permission(UUID, touchbase_role) IS 'Check if user has required permission level in organization';

-- Function: Get user's role in organization
CREATE OR REPLACE FUNCTION touchbase_get_user_role(p_org_id UUID)
RETURNS touchbase_role AS $$
DECLARE
    v_role touchbase_role;
BEGIN
    SELECT role INTO v_role
    FROM touchbase_user_organizations
    WHERE user_id = auth.uid()
    AND org_id = p_org_id;

    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION touchbase_get_user_role(UUID) IS 'Get user''s role in specific organization';

-- ============================================================
-- Updated At Triggers
-- ============================================================

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON touchbase_organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_organizations_updated_at
    BEFORE UPDATE ON touchbase_user_organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Sample Data (Development Only)
-- ============================================================

-- Create default organization for development
-- Uncomment for development seeding
/*
INSERT INTO touchbase_organizations (
    id,
    name,
    slug,
    description,
    is_active,
    created_by
)
VALUES (
    'demo-org-uuid-here'::uuid,
    'Demo Academy',
    'demo-academy',
    'Default organization for development',
    TRUE,
    auth.uid()
)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================
-- End of Migration
-- ============================================================
