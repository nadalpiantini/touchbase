-- ============================================================
-- TouchBase Academy - Class Modules Junction Table
-- ============================================================

-- Create junction table for class-module assignments
CREATE TABLE IF NOT EXISTS touchbase_class_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES touchbase_classes(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES touchbase_modules(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(class_id, module_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_class_modules_class_id ON touchbase_class_modules(class_id);
CREATE INDEX IF NOT EXISTS idx_class_modules_module_id ON touchbase_class_modules(module_id);

-- Enable RLS
ALTER TABLE touchbase_class_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Teachers can view modules for their classes
CREATE POLICY "Teachers can view class modules"
  ON touchbase_class_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM touchbase_classes
      WHERE touchbase_classes.id = touchbase_class_modules.class_id
      AND touchbase_classes.teacher_id = auth.uid()
    )
  );

-- Teachers can assign modules to their classes
CREATE POLICY "Teachers can assign modules to their classes"
  ON touchbase_class_modules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM touchbase_classes
      WHERE touchbase_classes.id = touchbase_class_modules.class_id
      AND touchbase_classes.teacher_id = auth.uid()
    )
  );

-- Teachers can unassign modules from their classes
CREATE POLICY "Teachers can unassign modules from their classes"
  ON touchbase_class_modules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM touchbase_classes
      WHERE touchbase_classes.id = touchbase_class_modules.class_id
      AND touchbase_classes.teacher_id = auth.uid()
    )
  );

-- Students can view modules assigned to their classes
CREATE POLICY "Students can view modules for their classes"
  ON touchbase_class_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM touchbase_class_enrollments
      WHERE touchbase_class_enrollments.class_id = touchbase_class_modules.class_id
      AND touchbase_class_enrollments.student_id = auth.uid()
    )
  );

