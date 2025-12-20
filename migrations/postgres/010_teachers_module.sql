-- =====================================================
-- Migration 010: Teachers Module Database Schema
-- Description: Teachers/staff management system with certifications and specializations
-- Author: Claude Code
-- Date: 2024-12-20
-- =====================================================

-- Teacher status enum
DO $$ BEGIN
    CREATE TYPE touchbase_teacher_status AS ENUM (
        'active',
        'inactive',
        'on_leave',
        'terminated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Teachers/Staff table
CREATE TABLE IF NOT EXISTS touchbase_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_photo_url TEXT,
    
    -- Professional Information
    certifications TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    bio TEXT,
    department VARCHAR(100),
    position VARCHAR(100),
    
    -- Employment Details
    hire_date DATE,
    status touchbase_teacher_status DEFAULT 'active',
    employment_type VARCHAR(50), -- full-time, part-time, contractor
    
    -- Contact & Emergency
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Constraints
    CONSTRAINT fk_org FOREIGN KEY (org_id) 
        REFERENCES touchbase_organizations(id) ON DELETE CASCADE,
    CONSTRAINT uniq_teacher_email_per_org UNIQUE (org_id, email),
    CONSTRAINT chk_years_experience CHECK (years_experience >= 0),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- =====================================================
-- Teacher Classes Assignment (many-to-many)
-- =====================================================

CREATE TABLE IF NOT EXISTS touchbase_teacher_classes (
    id SERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL,
    class_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'primary', -- primary, assistant, substitute
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    
    CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) 
        REFERENCES touchbase_teachers(id) ON DELETE CASCADE,
    CONSTRAINT uniq_teacher_class UNIQUE (teacher_id, class_id)
);

-- =====================================================
-- Teacher Availability/Schedule
-- =====================================================

CREATE TABLE IF NOT EXISTS touchbase_teacher_availability (
    id SERIAL PRIMARY KEY,
    teacher_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) 
        REFERENCES touchbase_teachers(id) ON DELETE CASCADE,
    CONSTRAINT chk_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT chk_time_range CHECK (end_time > start_time)
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_teachers_org 
    ON touchbase_teachers(org_id);

CREATE INDEX IF NOT EXISTS idx_teachers_status 
    ON touchbase_teachers(org_id, status) 
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_teachers_email 
    ON touchbase_teachers(org_id, email);

CREATE INDEX IF NOT EXISTS idx_teachers_department 
    ON touchbase_teachers(org_id, department) 
    WHERE department IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_teachers_name 
    ON touchbase_teachers(org_id, last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher 
    ON touchbase_teacher_classes(teacher_id);

CREATE INDEX IF NOT EXISTS idx_teacher_classes_class 
    ON touchbase_teacher_classes(class_id);

CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacher 
    ON touchbase_teacher_availability(teacher_id);

CREATE INDEX IF NOT EXISTS idx_teacher_availability_day 
    ON touchbase_teacher_availability(teacher_id, day_of_week);

-- =====================================================
-- Row Level Security Policies
-- =====================================================

ALTER TABLE touchbase_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_teacher_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Users can view teachers in their organization
CREATE POLICY teachers_select_own_org 
    ON touchbase_teachers 
    FOR SELECT 
    TO authenticated 
    USING (
        org_id IN (
            SELECT org_id 
            FROM touchbase_user_organizations 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy 2: Only coaches+ can insert teachers
CREATE POLICY teachers_insert_coach_plus 
    ON touchbase_teachers 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        org_id IN (
            SELECT org_id 
            FROM touchbase_user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'coach')
        )
    );

-- RLS Policy 3: Only coaches+ can update teachers
CREATE POLICY teachers_update_coach_plus 
    ON touchbase_teachers 
    FOR UPDATE 
    TO authenticated 
    USING (
        org_id IN (
            SELECT org_id 
            FROM touchbase_user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'coach')
        )
    );

-- RLS Policy 4: Only admins+ can delete teachers
CREATE POLICY teachers_delete_admin_plus 
    ON touchbase_teachers 
    FOR DELETE 
    TO authenticated 
    USING (
        org_id IN (
            SELECT org_id 
            FROM touchbase_user_organizations 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- RLS Policy 5: Users can view teacher-class assignments in their org
CREATE POLICY teacher_classes_select_own_org 
    ON touchbase_teacher_classes 
    FOR SELECT 
    TO authenticated 
    USING (
        teacher_id IN (
            SELECT id 
            FROM touchbase_teachers 
            WHERE org_id IN (
                SELECT org_id 
                FROM touchbase_user_organizations 
                WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policy 6: Only coaches+ can manage teacher-class assignments
CREATE POLICY teacher_classes_insert_coach_plus 
    ON touchbase_teacher_classes 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        teacher_id IN (
            SELECT id 
            FROM touchbase_teachers 
            WHERE org_id IN (
                SELECT org_id 
                FROM touchbase_user_organizations 
                WHERE user_id = auth.uid() 
                AND role IN ('owner', 'admin', 'coach')
            )
        )
    );

CREATE POLICY teacher_classes_update_coach_plus 
    ON touchbase_teacher_classes 
    FOR UPDATE 
    TO authenticated 
    USING (
        teacher_id IN (
            SELECT id 
            FROM touchbase_teachers 
            WHERE org_id IN (
                SELECT org_id 
                FROM touchbase_user_organizations 
                WHERE user_id = auth.uid() 
                AND role IN ('owner', 'admin', 'coach')
            )
        )
    );

CREATE POLICY teacher_classes_delete_coach_plus 
    ON touchbase_teacher_classes 
    FOR DELETE 
    TO authenticated 
    USING (
        teacher_id IN (
            SELECT id 
            FROM touchbase_teachers 
            WHERE org_id IN (
                SELECT org_id 
                FROM touchbase_user_organizations 
                WHERE user_id = auth.uid() 
                AND role IN ('owner', 'admin', 'coach')
            )
        )
    );

-- RLS Policy 7: Users can view teacher availability in their org
CREATE POLICY teacher_availability_select_own_org 
    ON touchbase_teacher_availability 
    FOR SELECT 
    TO authenticated 
    USING (
        teacher_id IN (
            SELECT id 
            FROM touchbase_teachers 
            WHERE org_id IN (
                SELECT org_id 
                FROM touchbase_user_organizations 
                WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policy 8: Only coaches+ can manage teacher availability
CREATE POLICY teacher_availability_insert_coach_plus 
    ON touchbase_teacher_availability 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        teacher_id IN (
            SELECT id 
            FROM touchbase_teachers 
            WHERE org_id IN (
                SELECT org_id 
                FROM touchbase_user_organizations 
                WHERE user_id = auth.uid() 
                AND role IN ('owner', 'admin', 'coach')
            )
        )
    );

CREATE POLICY teacher_availability_update_coach_plus 
    ON touchbase_teacher_availability 
    FOR UPDATE 
    TO authenticated 
    USING (
        teacher_id IN (
            SELECT id 
            FROM touchbase_teachers 
            WHERE org_id IN (
                SELECT org_id 
                FROM touchbase_user_organizations 
                WHERE user_id = auth.uid() 
                AND role IN ('owner', 'admin', 'coach')
            )
        )
    );

CREATE POLICY teacher_availability_delete_coach_plus 
    ON touchbase_teacher_availability 
    FOR DELETE 
    TO authenticated 
    USING (
        teacher_id IN (
            SELECT id 
            FROM touchbase_teachers 
            WHERE org_id IN (
                SELECT org_id 
                FROM touchbase_user_organizations 
                WHERE user_id = auth.uid() 
                AND role IN ('owner', 'admin', 'coach')
            )
        )
    );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function: Get active teachers for organization
CREATE OR REPLACE FUNCTION touchbase_get_active_teachers(
    p_org_id UUID
)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    department VARCHAR,
    position VARCHAR,
    certifications TEXT[],
    specializations TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.first_name,
        t.last_name,
        t.email,
        t.department,
        t.position,
        t.certifications,
        t.specializations
    FROM touchbase_teachers t
    WHERE t.org_id = p_org_id
    AND t.status = 'active'
    ORDER BY t.last_name, t.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get teacher's classes
CREATE OR REPLACE FUNCTION touchbase_get_teacher_classes(
    p_teacher_id UUID
)
RETURNS TABLE (
    class_id UUID,
    role VARCHAR,
    assigned_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.class_id,
        tc.role,
        tc.assigned_at
    FROM touchbase_teacher_classes tc
    WHERE tc.teacher_id = p_teacher_id
    ORDER BY tc.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get teacher availability
CREATE OR REPLACE FUNCTION touchbase_get_teacher_availability(
    p_teacher_id UUID
)
RETURNS TABLE (
    day_of_week INTEGER,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ta.day_of_week,
        ta.start_time,
        ta.end_time,
        ta.is_available
    FROM touchbase_teacher_availability ta
    WHERE ta.teacher_id = p_teacher_id
    ORDER BY ta.day_of_week, ta.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_teacher_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teachers_updated_at
    BEFORE UPDATE ON touchbase_teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_teacher_timestamp();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE touchbase_teachers IS 'Teachers and staff members with certifications and specializations';
COMMENT ON TABLE touchbase_teacher_classes IS 'Teacher-to-class assignments with roles';
COMMENT ON TABLE touchbase_teacher_availability IS 'Teacher weekly availability schedule';

COMMENT ON COLUMN touchbase_teachers.certifications IS 'Array of professional certifications';
COMMENT ON COLUMN touchbase_teachers.specializations IS 'Array of teaching specializations or subjects';
COMMENT ON COLUMN touchbase_teachers.years_experience IS 'Years of teaching/professional experience';
COMMENT ON COLUMN touchbase_teachers.employment_type IS 'Employment status: full-time, part-time, contractor';

COMMENT ON FUNCTION touchbase_get_active_teachers IS 'Get all active teachers for an organization';
COMMENT ON FUNCTION touchbase_get_teacher_classes IS 'Get all classes assigned to a teacher';
COMMENT ON FUNCTION touchbase_get_teacher_availability IS 'Get weekly availability schedule for a teacher';
