# TouchBase - Plan de Sprints de Recuperación

**Fecha creación**: 2025-12-20
**Estado proyecto**: 🔴 BLOQUEADO por errores TypeScript
**Objetivo**: Recuperar proyecto, completar Tasks 21-24, commits frecuentes

---

## 🚨 BLOQUEADOR CRÍTICO

**11 errores TypeScript** impidiendo commits y deployment:

1. `teacher/classes/page.tsx` - Property `grade_level` no existe en `Class`
2. `teacher/classes/[id]/page.tsx` - Properties `student`, `enrollment` no existen en `Enrollment`
3. Múltiples function signature mismatches (`getClasses` expects 1-2 args, got 3)
4. `createServerClient` no exportado en `lib/supabase/server`
5. `createTeacherSchema` no existe
6. `scripts/inspect-table-types.ts` - Type error en índice

**Impacto**: No se puede hacer commit de 3 archivos pendientes (diagnostic scripts)

---

## 📋 SPRINT 3.4.1: TypeScript Emergency Fixes

**Prioridad**: 🔴 CRÍTICA
**Duración estimada**: 1-2 horas
**Objetivo**: 0 errores TypeScript, habilitar commits

### Tasks (11 total)

#### 1. Auditar Tipos Existentes
```bash
# Revisar estructura actual
ls -la web/lib/types/
find web/lib/types/ -name "*.ts"
```

#### 2. Crear/Corregir `Class` Interface
**Archivo**: `web/lib/types/class.ts` (crear si no existe)

```typescript
export interface Class {
  id: string;
  name: string;
  code: string | null;
  level: string | null;
  grade_level: string | null;  // ← AGREGAR
  description: string | null;
  max_students: number;
  current_enrollment: number;
  start_date: string | null;
  end_date: string | null;
  schedule_description: string | null;
  status: ClassStatus;
  location: string | null;
  room: string | null;
  created_at: string;
}
```

#### 3. Crear/Corregir `Enrollment` Interface
**Archivo**: `web/lib/types/enrollment.ts` (crear si no existe)

```typescript
export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  // ... otros campos
}

export interface Enrollment {
  id: string;
  class_id: string;
  student_id: string;
  student: Student;  // ← AGREGAR
  enrollment: {      // ← AGREGAR nested object si se usa
    status: string;
    enrolled_date: string;
  };
  status: string;
  enrolled_date: string;
  created_at: string;
}
```

#### 4. Exportar `createServerClient`
**Archivo**: `web/lib/supabase/server.ts`

```typescript
// Verificar que esté exportado:
export { createServerClient } from './server-impl';
// O
export const createServerClient = () => { /* ... */ };
```

#### 5. Crear `createTeacherSchema`
**Archivo**: `web/lib/schemas/teacher.ts` (verificar/crear)

```typescript
import { z } from 'zod';

export const createTeacherSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  // ... otros campos
});
```

#### 6. Corregir Signature de `getClasses()`
**Archivo**: `web/lib/services/classes.ts`

Revisar signature actual y ajustar a:
```typescript
// Opción A: 2 parámetros
export async function getClasses(
  supabase: SupabaseClient,
  filters?: { status?: string; level?: string; search?: string }
): Promise<Class[]>

// Opción B: 3 parámetros explícitos
export async function getClasses(
  supabase: SupabaseClient,
  userId: string,
  orgId: string
): Promise<Class[]>
```

#### 7. Actualizar Llamadas a `getClasses()`
**Archivos a modificar**:
- `app/[locale]/(protected)/teacher/classes/page.tsx:18`
- `app/[locale]/(protected)/teacher/dashboard/page.tsx:33`
- `app/api/classes/list/route.ts:13`
- `app/api/classes/create/route.ts:43`

Ajustar según nueva signature.

#### 8. Fix `inspect-table-types.ts`
**Archivo**: `web/scripts/inspect-table-types.ts:49`

```typescript
// Antes (error):
const value = row[col];

// Después (con type assertion):
const value = row[col as keyof typeof row];
// O
const value = (row as Record<string, unknown>)[col];
```

#### 9. Compilar TypeScript
```bash
cd web
npx tsc --noEmit
```

Verificar: 0 errors

#### 10. Commit TypeScript Fixes
```bash
git add .
git commit -m "fix: resolve 11 TypeScript compilation errors

- Add grade_level to Class interface
- Add student and enrollment to Enrollment interface
- Export createServerClient from lib/supabase/server
- Create createTeacherSchema in lib/schemas/teacher
- Fix getClasses() function signature
- Update all getClasses() call sites
- Fix type error in inspect-table-types.ts

All TypeScript errors resolved, pre-commit hooks passing"
```

#### 11. Push to GitHub
```bash
git push origin master
```

### Checkpoint

✅ TypeScript: 0 errors
✅ ESLint: Passing
✅ Pre-commit hooks: All green
✅ Commit pushed to GitHub
✅ ACTIVITY_LOG.md updated

**Tiempo esperado**: 1-2 horas

---

## 📋 SPRINT 3.4.2: Complete Classes UI Integration

**Prioridad**: 🟡 ALTA
**Duración estimada**: 2-3 horas
**Objetivo**: Task 21 done (Classes Module UI Components)

### Context

**Componentes existentes**:
- ✅ ClassesList.tsx (completo, usa Table component)
- ✅ ClassForm.tsx (completo, usa Card, Input, Select)
- ✅ ClassDetail.tsx (tiene TODO línea 102: integrar ClassForm)

### Tasks

#### 1. Resolver TODO en ClassDetail
**Archivo**: `web/components/classes/ClassDetail.tsx:102`

```tsx
// Cambiar de:
{/* TODO: Integrate ClassForm component when available */}

// A:
{isEditing && (
  <ClassForm
    classItem={classData}
    mode="edit"
    onSuccess={handleUpdateSuccess}
    onCancel={() => setIsEditing(false)}
  />
)}
```

#### 2. Crear EnrollmentManager Component
**Archivo nuevo**: `web/components/classes/EnrollmentManager.tsx`

Features:
- List enrolled students
- Add student to class
- Remove student from class
- Bulk enrollment actions

#### 3. Crear ClassStudentsCard Component
**Archivo nuevo**: `web/components/classes/ClassStudentsCard.tsx`

Displays:
- Current enrollment count vs max
- List of enrolled students
- Enrollment status badges
- Actions (view student, unenroll)

#### 4. Testing Manual
- Create new class
- Edit existing class
- Delete class
- View class details
- Filter classes by status/level
- Search classes

#### 5. E2E Tests
**Archivo nuevo**: `web/tests/e2e/classes.spec.ts`

```typescript
test('should create a new class', async ({ page }) => {
  // Test class creation flow
});

test('should edit class details', async ({ page }) => {
  // Test class editing
});

test('should delete a class', async ({ page }) => {
  // Test deletion with confirmation
});
```

#### 6. Update Task 21 Status
```bash
npx task-master-ai set-status --id=21 --status=done
```

#### 7. Commit & Push
```bash
git add .
git commit -m "feat(classes): complete UI integration

- Integrate ClassForm in ClassDetail component
- Create EnrollmentManager for student management
- Create ClassStudentsCard for enrollment display
- Add E2E tests for classes CRUD
- Resolve TODO in ClassDetail.tsx:102

Task 21 (SPRINT 3.4) completed"

git push origin master
```

#### 8. Update ACTIVITY_LOG
Add section for Sprint 3.4.2 completion.

### Checkpoint

✅ ClassForm integrated in ClassDetail
✅ Enrollment components created
✅ E2E tests passing
✅ Task 21 status: done
✅ Commit pushed
✅ ACTIVITY_LOG updated

**Tiempo esperado**: 2-3 horas

---

## 📋 SPRINT 3.5: Teachers UI Components

**Prioridad**: 🟡 ALTA
**Duración estimada**: 3-4 horas
**Objetivo**: Task 19 done (Teachers Module CRUD Implementation)

### Context

**Estado actual** (from memory task_19_teachers_api_progress_2024_12_20):
- ✅ API completada (100%): teachers.ts service, 4 API routes
- ⏳ UI pendiente (30%): 5 componentes faltantes

**Componentes a crear**:
1. TeachersList Component
2. TeacherDetail Component
3. TeacherForm Component
4. TeacherClassesCard Component
5. TeacherAvailabilityCard Component

### Tasks

#### 1. Crear Directory Structure
```bash
mkdir -p web/components/teachers
touch web/components/teachers/TeachersList.tsx
touch web/components/teachers/TeacherDetail.tsx
touch web/components/teachers/TeacherForm.tsx
touch web/components/teachers/TeacherClassesCard.tsx
touch web/components/teachers/TeacherAvailabilityCard.tsx
touch web/components/teachers/index.ts
```

#### 2. Implementar TeachersList Component
**Archivo**: `web/components/teachers/TeachersList.tsx`

Features:
- Integration with Table component
- Columns: name, email, department, status, years_experience
- Filters: status dropdown, department dropdown, search input
- Actions: view, edit, delete (role-based with usePermissions)
- Pagination (if needed)

Pattern: Similar to ClassesList.tsx

#### 3. Implementar TeacherForm Component
**Archivo**: `web/components/teachers/TeacherForm.tsx`

Features:
- Personal info fields (name, email, phone, DOB, photo)
- Professional info (certifications array, specializations array, years, bio)
- Employment (department, position, hire_date, status, type)
- Emergency contact fields
- Zod schema validation
- Create/Edit modes

Pattern: Similar to ClassForm.tsx

#### 4. Implementar TeacherDetail Component
**Archivo**: `web/components/teachers/TeacherDetail.tsx`

Features:
- Display full teacher profile
- Tabs: Profile, Classes, Availability
- Edit mode integration (TeacherForm)
- Delete action (admin+ only)

#### 5. Implementar TeacherClassesCard Component
**Archivo**: `web/components/teachers/TeacherClassesCard.tsx`

Features:
- List of assigned classes with roles (primary/assistant/substitute)
- Add/remove class assignments
- Role selection dropdown

API Integration:
- GET /api/teachers/:id/classes
- POST /api/teachers/:id/classes
- DELETE /api/teachers/:id/classes

#### 6. Implementar TeacherAvailabilityCard Component
**Archivo**: `web/components/teachers/TeacherAvailabilityCard.tsx`

Features:
- Weekly schedule grid (Sunday-Saturday)
- Add/edit time slots per day
- Visual availability calendar
- Save availability (bulk update)

API Integration:
- GET /api/teachers/:id/availability
- POST /api/teachers/:id/availability

#### 7. Create Teacher Pages
**Archivos**:
- `app/[locale]/(protected)/teacher/teachers/page.tsx` (list view)
- `app/[locale]/(protected)/teacher/teachers/[id]/page.tsx` (detail view)
- `app/[locale]/(protected)/teacher/teachers/create/page.tsx` (create form)

#### 8. E2E Tests
**Archivo nuevo**: `web/tests/e2e/teachers.spec.ts`

```typescript
test('should create a new teacher', async ({ page }) => {
  // Test teacher creation
});

test('should assign teacher to class', async ({ page }) => {
  // Test class assignment
});

test('should set teacher availability', async ({ page }) => {
  // Test availability schedule
});
```

#### 9. Update Task 19 Status
```bash
npx task-master-ai set-status --id=19 --status=done
```

#### 10. Commit & Push
```bash
git add .
git commit -m "feat(teachers): complete UI components

- Create TeachersList with Table integration
- Create TeacherForm with Zod validation
- Create TeacherDetail with tabs (Profile, Classes, Availability)
- Create TeacherClassesCard for class assignments
- Create TeacherAvailabilityCard for weekly schedule
- Add teacher pages (list, detail, create)
- Add E2E tests for teachers CRUD

Task 19 (SPRINT 3.5) completed - Teachers module 100% done"

git push origin master
```

#### 11. Update ACTIVITY_LOG
Add section for Sprint 3.5 completion.

### Checkpoint

✅ 5 Teacher components created
✅ Teacher pages implemented
✅ E2E tests passing
✅ Task 19 status: done
✅ Commit pushed
✅ ACTIVITY_LOG updated

**Tiempo esperado**: 3-4 horas

---

## 📋 SPRINT 4: Attendance System

**Prioridad**: 🟢 MEDIA
**Duración estimada**: 4-5 horas
**Objetivo**: Tasks 22-24 done (Attendance System completo)

### SPRINT 4.1: Attendance Database & API (Task 22)

**Duración**: 1.5-2 horas

#### 1. Create Migration
**Archivo nuevo**: `migrations/postgres/011_attendance_system.sql`

```sql
-- Attendance status enum
CREATE TYPE touchbase_attendance_status AS ENUM (
  'present',
  'absent',
  'late',
  'excused'
);

-- Main attendance table
CREATE TABLE touchbase_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES touchbase_organizations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL,
  student_id UUID NOT NULL,
  date DATE NOT NULL,
  status touchbase_attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(class_id, student_id, date)
);

-- Indexes
CREATE INDEX idx_attendance_org ON touchbase_attendance(org_id);
CREATE INDEX idx_attendance_class ON touchbase_attendance(class_id);
CREATE INDEX idx_attendance_student ON touchbase_attendance(student_id);
CREATE INDEX idx_attendance_date ON touchbase_attendance(date);
CREATE INDEX idx_attendance_status ON touchbase_attendance(status);

-- RLS policies
ALTER TABLE touchbase_attendance ENABLE ROW LEVEL SECURITY;

-- Viewers+ can view
CREATE POLICY attendance_select_own_org ON touchbase_attendance
  FOR SELECT
  USING (org_id = (SELECT touchbase_current_org()));

-- Coaches+ can insert/update
CREATE POLICY attendance_insert_coach_plus ON touchbase_attendance
  FOR INSERT
  WITH CHECK (
    org_id = (SELECT touchbase_current_org()) AND
    touchbase_has_permission('CREATE_CONTENT')
  );

CREATE POLICY attendance_update_coach_plus ON touchbase_attendance
  FOR UPDATE
  USING (
    org_id = (SELECT touchbase_current_org()) AND
    touchbase_has_permission('UPDATE_CONTENT')
  );

-- Admins+ can delete
CREATE POLICY attendance_delete_admin_plus ON touchbase_attendance
  FOR DELETE
  USING (
    org_id = (SELECT touchbase_current_org()) AND
    touchbase_has_permission('DELETE_CONTENT')
  );

-- Updated_at trigger
CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON touchbase_attendance
  FOR EACH ROW
  EXECUTE FUNCTION touchbase_update_timestamp();

-- RPC functions
CREATE OR REPLACE FUNCTION touchbase_get_class_attendance(
  p_class_id UUID,
  p_date DATE
)
RETURNS TABLE (
  student_id UUID,
  status touchbase_attendance_status,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.student_id,
    a.status,
    a.notes
  FROM touchbase_attendance a
  WHERE a.class_id = p_class_id
    AND a.date = p_date
    AND a.org_id = (SELECT touchbase_current_org());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE touchbase_attendance IS 'Attendance tracking for classes';
```

#### 2. Create Service Layer
**Archivo nuevo**: `web/lib/services/attendance.ts`

Functions:
- `getClassAttendance(classId, date)`
- `recordAttendance(classId, studentId, date, status, notes?)`
- `bulkRecordAttendance(records[])`
- `updateAttendance(attendanceId, status, notes?)`
- `getStudentAttendance(studentId, startDate, endDate)`
- `getAttendanceStats(classId, startDate, endDate)`

#### 3. Create API Routes
**Archivos nuevos**:
- `app/api/attendance/route.ts` (GET list, POST create)
- `app/api/attendance/[id]/route.ts` (GET single, PUT update, DELETE)
- `app/api/attendance/class/[classId]/route.ts` (GET class attendance by date)
- `app/api/attendance/student/[studentId]/route.ts` (GET student history)
- `app/api/attendance/stats/route.ts` (GET attendance statistics)

#### 4. Commit & Push
```bash
git add .
git commit -m "feat(attendance): implement database schema and API

- Create attendance table with RLS policies
- Add attendance status enum (present/absent/late/excused)
- Implement attendance service layer
- Create 5 API routes for attendance management
- Add RPC function for class attendance queries

Task 22 completed"

git push origin master
```

### SPRINT 4.2: Take Attendance UI (Task 23)

**Duración**: 1.5-2 horas

#### 1. Create AttendanceTaker Component
**Archivo nuevo**: `web/components/attendance/AttendanceTaker.tsx`

Features:
- Class selector
- Date picker
- Student list with quick status toggle
- Bulk actions (Mark all present/absent)
- Notes field per student
- Save button

#### 2. Create AttendanceList Component
**Archivo nuevo**: `web/components/attendance/AttendanceList.tsx`

Features:
- Display attendance records
- Filter by date range, class, status
- Edit attendance record
- Delete attendance record

#### 3. Create Attendance Pages
**Archivos nuevos**:
- `app/[locale]/(protected)/teacher/attendance/page.tsx` (main view)
- `app/[locale]/(protected)/teacher/attendance/take/page.tsx` (take attendance)
- `app/[locale]/(protected)/teacher/attendance/history/page.tsx` (view history)

#### 4. Integration with Classes
Update `app/[locale]/(protected)/teacher/classes/[id]/page.tsx`:
- Add "Take Attendance" button
- Link to attendance taker with pre-selected class

#### 5. E2E Tests
**Archivo nuevo**: `web/tests/e2e/attendance.spec.ts`

```typescript
test('should take attendance for a class', async ({ page }) => {
  // Test taking attendance
});

test('should edit attendance record', async ({ page }) => {
  // Test editing
});
```

#### 6. Commit & Push
```bash
git add .
git commit -m "feat(attendance): implement take attendance UI

- Create AttendanceTaker component with quick entry
- Create AttendanceList for viewing records
- Add attendance pages (main, take, history)
- Integrate with Classes module
- Add E2E tests for attendance

Task 23 completed"

git push origin master
```

### SPRINT 4.3: Attendance Reports (Task 24)

**Duración**: 1-1.5 horas

#### 1. Create AttendanceReports Component
**Archivo nuevo**: `web/components/attendance/AttendanceReports.tsx`

Features:
- Date range selector
- Class/student filters
- Attendance rate visualization (charts)
- Trend analysis
- Export to CSV/PDF

#### 2. Create AttendanceChart Component
**Archivo nuevo**: `web/components/attendance/AttendanceChart.tsx`

Uses Chart.js or Recharts:
- Attendance rate over time (line chart)
- Status distribution (pie chart)
- Class comparison (bar chart)

#### 3. Create Reports Page
**Archivo nuevo**: `app/[locale]/(protected)/teacher/attendance/reports/page.tsx`

Displays:
- Overall attendance statistics
- Charts and visualizations
- Top/bottom performers
- Export options

#### 4. Export Functionality
**Archivo nuevo**: `web/lib/utils/export-attendance.ts`

Functions:
- `exportAttendanceToCSV(data, filename)`
- `exportAttendanceToPDF(data, filename)`

#### 5. Testing
- Generate reports for different date ranges
- Test export to CSV
- Test charts rendering

#### 6. Update Task 24 Status
```bash
npx task-master-ai set-status --id=24 --status=done
```

#### 7. Final Commit & Push
```bash
git add .
git commit -m "feat(attendance): implement reports dashboard

- Create AttendanceReports component with visualizations
- Add attendance charts (rate, status, trends)
- Implement CSV/PDF export functionality
- Add reports page with filters and analytics

Task 24 completed - SPRINT 4 completed - Attendance System 100% done"

git push origin master
```

#### 8. Update ACTIVITY_LOG
Add Sprint 4 completion section.

### Checkpoint

✅ Task 22 done (DB + API)
✅ Task 23 done (Take Attendance UI)
✅ Task 24 done (Reports)
✅ 3 commits pushed
✅ ACTIVITY_LOG updated
✅ Attendance System 100% complete

**Tiempo total Sprint 4**: 4-5 horas

---

## 📊 Resumen General

### Total de Sprints: 4

| Sprint | Duración | Tasks | Commits | Estado |
|--------|----------|-------|---------|--------|
| 3.4.1 (TypeScript Fixes) | 1-2h | 11 | 1 | ⏳ Pending |
| 3.4.2 (Classes UI) | 2-3h | 8 | 1 | ⏳ Pending |
| 3.5 (Teachers UI) | 3-4h | 11 | 1 | ⏳ Pending |
| 4 (Attendance) | 4-5h | 3 tasks | 3 | ⏳ Pending |

**Total estimado**: 10-14 horas de trabajo
**Total commits**: 6+ commits
**Total pushes**: 6+ pushes

### Task Master Progress

| Task ID | Título | Estado Actual | Estado Final |
|---------|--------|---------------|--------------|
| 21 | Classes UI Components | in-progress | done |
| 22 | Attendance DB & API | pending | done |
| 23 | Take Attendance UI | pending | done |
| 24 | Attendance Reports | pending | done |

### Strategy

**Commits Frecuentes**: ✅ Cada feature/fix completo
**Push Inmediato**: ✅ Después de cada commit
**ACTIVITY_LOG Updates**: ✅ Después de cada push
**Task Master Sync**: ✅ Después de completar cada task
**Pre-commit Hooks**: ✅ Siempre activos

### Herramientas

- ✅ Serena MCP (memories + project activation)
- ✅ Task Master (task tracking + status updates)
- ✅ TodoWrite (progress tracking)
- ⏳ Context7 (cuando se necesite docs)
- ⏳ BMAD (para planning complejo)
- ⏳ Superpowers Skills (según necesidad)

---

**Estado**: 🟢 Plan completo y listo para ejecución
**Próximo paso**: Ejecutar Sprint 3.4.1 (TypeScript Fixes)
**Comando**: Continuar con fix de tipos
