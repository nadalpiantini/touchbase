-- =====================================================
-- Migration 011: Classes Module Database Schema
-- Description: Classes/courses management with enrollment system
-- Author: Claude Code
-- Date: 2025-12-20
-- =====================================================

-- Class status enum
DO $$ BEGIN
    CREATE TYPE touchbase_class_status AS ENUM (
        'active',
        'inactive',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enrollment status enum
DO $$ BEGIN
    CREATE TYPE touchbase_enrollment_status AS ENUM (
        'enrolled',
        'active',
        'completed',
        'dropped',
        'withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- Classes Table
-- =====================================================

CREATE TABLE IF NOT EXISTS touchbase_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,

    -- Class Information
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- Optional course code (e.g., "CS101")
    level VARCHAR(50), -- Beginner, Intermediate, Advanced, etc.
    description TEXT,

    -- Capacity
    max_students INTEGER DEFAULT 0,
    current_enrollment INTEGER DEFAULT 0,

    -- Schedule & Duration
    start_date DATE,
    end_date DATE,
    schedule_description TEXT, -- Free-text schedule (e.g., "Mon/Wed 3-5 PM")

    -- Status
    status touchbase_class_status DEFAULT 'active',

    -- Location (optional)
    location VARCHAR(255),
    room VARCHAR(100),

    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    -- Constraints
    CONSTRAINT fk_org FOREIGN KEY (org_id)
        REFERENCES touchbase_organizations(id) ON DELETE CASCADE,
    CONSTRAINT uniq_class_code_per_org UNIQUE (org_id, code),
    CONSTRAINT chk_max_students CHECK (max_students >= 0),
    CONSTRAINT chk_current_enrollment CHECK (current_enrollment >= 0),
    CONSTRAINT chk_enrollment_capacity CHECK (current_enrollment <= max_students OR max_students = 0),
    CONSTRAINT chk_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- =====================================================
-- Student Enrollments (many-to-many)
-- =====================================================

CREATE TABLE IF NOT EXISTS touchbase_enrollments (
    id SERIAL PRIMARY KEY,
    class_id UUID NOT NULL,
    student_id UUID NOT NULL, -- Reference to auth.users

    -- Enrollment Status
    status touchbase_enrollment_status DEFAULT 'enrolled',
    enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date DATE,

    -- Academic
    grade VARCHAR(10), -- A, B, C, D, F, Pass, Fail, etc.
    final_score DECIMAL(5,2), -- 0.00 to 100.00
    attendance_rate DECIMAL(5,2), -- 0.00 to 100.00

    -- Notes
    notes TEXT,

    -- Metadata
    enrolled_by UUID, -- Teacher/admin who enrolled the student
    withdrawn_date TIMESTAMP,
    withdrawn_reason TEXT,

    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT fk_class FOREIGN KEY (class_id)
        REFERENCES touchbase_classes(id) ON DELETE CASCADE,
    CONSTRAINT uniq_student_class UNIQUE (student_id, class_id),
    CONSTRAINT chk_final_score CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 100)),
    CONSTRAINT chk_attendance_rate CHECK (attendance_rate IS NULL OR (attendance_rate >= 0 AND attendance_rate <= 100))
);

-- =====================================================
-- Update foreign key in teacher_classes to reference classes
-- (The table already exists from migration 010, just adding FK constraint)
-- =====================================================

-- Add foreign key constraint for class_id in touchbase_teacher_classes
-- Note: Using DO block to handle case where constraint might already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_class'
        AND table_name = 'touchbase_teacher_classes'
    ) THEN
        ALTER TABLE touchbase_teacher_classes
        ADD CONSTRAINT fk_class FOREIGN KEY (class_id)
            REFERENCES touchbase_classes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_classes_org
    ON touchbase_classes(org_id);

CREATE INDEX IF NOT EXISTS idx_classes_status
    ON touchbase_classes(org_id, status)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_classes_code
    ON touchbase_classes(org_id, code)
    WHERE code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_classes_level
    ON touchbase_classes(org_id, level)
    WHERE level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_classes_dates
    ON touchbase_classes(start_date, end_date)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_enrollments_class
    ON touchbase_enrollments(class_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_student
    ON touchbase_enrollments(student_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_status
    ON touchbase_enrollments(class_id, status);

CREATE INDEX IF NOT EXISTS idx_enrollments_student_status
    ON touchbase_enrollments(student_id, status);

-- =====================================================
-- Row Level Security Policies
-- =====================================================

ALTER TABLE touchbase_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchbase_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Users can view classes in their organization
CREATE POLICY classes_select_own_org
    ON touchbase_classes
    FOR SELECT
    TO authenticated
    USING (
        org_id IN (
            SELECT org_id
            FROM touchbase_user_organizations
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy 2: Only coaches+ can create classes
CREATE POLICY classes_insert_coach_plus
    ON touchbase_classes
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

-- RLS Policy 3: Only coaches+ can update classes
CREATE POLICY classes_update_coach_plus
    ON touchbase_classes
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

-- RLS Policy 4: Only admins+ can delete classes
CREATE POLICY classes_delete_admin_plus
    ON touchbase_classes
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

-- RLS Policy 5: Users can view enrollments in their org
-- (Students can see their own enrollments, teachers/coaches can see all in their org)
CREATE POLICY enrollments_select_policy
    ON touchbase_enrollments
    FOR SELECT
    TO authenticated
    USING (
        -- Student viewing their own enrollments
        student_id = auth.uid()
        OR
        -- Staff viewing enrollments in their org
        class_id IN (
            SELECT id
            FROM touchbase_classes
            WHERE org_id IN (
                SELECT org_id
                FROM touchbase_user_organizations
                WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policy 6: Only coaches+ can create enrollments
CREATE POLICY enrollments_insert_coach_plus
    ON touchbase_enrollments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        class_id IN (
            SELECT id
            FROM touchbase_classes
            WHERE org_id IN (
                SELECT org_id
                FROM touchbase_user_organizations
                WHERE user_id = auth.uid()
                AND role IN ('owner', 'admin', 'coach')
            )
        )
    );

-- RLS Policy 7: Only coaches+ can update enrollments
CREATE POLICY enrollments_update_coach_plus
    ON touchbase_enrollments
    FOR UPDATE
    TO authenticated
    USING (
        class_id IN (
            SELECT id
            FROM touchbase_classes
            WHERE org_id IN (
                SELECT org_id
                FROM touchbase_user_organizations
                WHERE user_id = auth.uid()
                AND role IN ('owner', 'admin', 'coach')
            )
        )
    );

-- RLS Policy 8: Only coaches+ can delete enrollments
CREATE POLICY enrollments_delete_coach_plus
    ON touchbase_enrollments
    FOR DELETE
    TO authenticated
    USING (
        class_id IN (
            SELECT id
            FROM touchbase_classes
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

-- Function: Get active classes for organization
CREATE OR REPLACE FUNCTION touchbase_get_active_classes(
    p_org_id UUID
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    code VARCHAR,
    level VARCHAR,
    max_students INTEGER,
    current_enrollment INTEGER,
    start_date DATE,
    end_date DATE,
    location VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.code,
        c.level,
        c.max_students,
        c.current_enrollment,
        c.start_date,
        c.end_date,
        c.location
    FROM touchbase_classes c
    WHERE c.org_id = p_org_id
    AND c.status = 'active'
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get class enrollments with student info
CREATE OR REPLACE FUNCTION touchbase_get_class_enrollments(
    p_class_id UUID
)
RETURNS TABLE (
    enrollment_id INTEGER,
    student_id UUID,
    status touchbase_enrollment_status,
    enrolled_date TIMESTAMP,
    grade VARCHAR,
    final_score DECIMAL,
    attendance_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.student_id,
        e.status,
        e.enrolled_date,
        e.grade,
        e.final_score,
        e.attendance_rate
    FROM touchbase_enrollments e
    WHERE e.class_id = p_class_id
    ORDER BY e.enrolled_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get student's enrolled classes
CREATE OR REPLACE FUNCTION touchbase_get_student_classes(
    p_student_id UUID
)
RETURNS TABLE (
    class_id UUID,
    class_name VARCHAR,
    class_code VARCHAR,
    enrollment_status touchbase_enrollment_status,
    enrolled_date TIMESTAMP,
    grade VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.code,
        e.status,
        e.enrolled_date,
        e.grade
    FROM touchbase_enrollments e
    JOIN touchbase_classes c ON c.id = e.class_id
    WHERE e.student_id = p_student_id
    ORDER BY e.enrolled_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger: Update updated_at timestamp for classes
CREATE OR REPLACE FUNCTION update_class_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER classes_updated_at
    BEFORE UPDATE ON touchbase_classes
    FOR EACH ROW
    EXECUTE FUNCTION update_class_timestamp();

-- Trigger: Update updated_at timestamp for enrollments
CREATE OR REPLACE FUNCTION update_enrollment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollments_updated_at
    BEFORE UPDATE ON touchbase_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollment_timestamp();

-- Trigger: Update current_enrollment count when enrollment changes
CREATE OR REPLACE FUNCTION update_class_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment enrollment count for active enrollments
        IF NEW.status IN ('enrolled', 'active') THEN
            UPDATE touchbase_classes
            SET current_enrollment = current_enrollment + 1
            WHERE id = NEW.class_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status IN ('enrolled', 'active') AND NEW.status NOT IN ('enrolled', 'active') THEN
            -- Student dropped/withdrew - decrement
            UPDATE touchbase_classes
            SET current_enrollment = current_enrollment - 1
            WHERE id = NEW.class_id;
        ELSIF OLD.status NOT IN ('enrolled', 'active') AND NEW.status IN ('enrolled', 'active') THEN
            -- Student re-enrolled - increment
            UPDATE touchbase_classes
            SET current_enrollment = current_enrollment + 1
            WHERE id = NEW.class_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement if was an active enrollment
        IF OLD.status IN ('enrolled', 'active') THEN
            UPDATE touchbase_classes
            SET current_enrollment = current_enrollment - 1
            WHERE id = OLD.class_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollments_update_count
    AFTER INSERT OR UPDATE OR DELETE ON touchbase_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_class_enrollment_count();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE touchbase_classes IS 'Classes/courses with enrollment capacity and scheduling';
COMMENT ON TABLE touchbase_enrollments IS 'Student enrollments in classes with grades and attendance';

COMMENT ON COLUMN touchbase_classes.code IS 'Optional course code (e.g., "CS101", "MATH-201")';
COMMENT ON COLUMN touchbase_classes.level IS 'Difficulty level: Beginner, Intermediate, Advanced, etc.';
COMMENT ON COLUMN touchbase_classes.max_students IS 'Maximum enrollment capacity (0 = unlimited)';
COMMENT ON COLUMN touchbase_classes.current_enrollment IS 'Current number of enrolled students (auto-updated)';
COMMENT ON COLUMN touchbase_classes.schedule_description IS 'Free-text schedule (e.g., "Mon/Wed 3-5 PM")';

COMMENT ON COLUMN touchbase_enrollments.student_id IS 'Reference to Supabase auth.users';
COMMENT ON COLUMN touchbase_enrollments.final_score IS 'Final score (0.00 to 100.00)';
COMMENT ON COLUMN touchbase_enrollments.attendance_rate IS 'Attendance percentage (0.00 to 100.00)';

COMMENT ON FUNCTION touchbase_get_active_classes IS 'Get all active classes for an organization';
COMMENT ON FUNCTION touchbase_get_class_enrollments IS 'Get all enrollments for a specific class';
COMMENT ON FUNCTION touchbase_get_student_classes IS 'Get all classes a student is enrolled in';
