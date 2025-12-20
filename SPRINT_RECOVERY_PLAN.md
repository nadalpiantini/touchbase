# 🚀 Sprint Recovery Plan - TouchBase

**Fecha**: 2025-12-20
**Estado**: Post-Interrupción - Recuperación y Continuación

---

## 📊 Estado Actual del Proyecto

### ✅ Completado (100%)
- **Sprint 1**: Teachers Module CRUD (Tasks 18-19)
  - Database schema ✅
  - Service layer (13 functions) ✅
  - API Routes (6 endpoints) ✅
  - UI Components (7 components) ✅
  - i18n completo EN/ES ✅

- **Sprint 2**: BMAD EPIC-01 Foundation (Tasks 13-17)
  - Theme Provider ✅
  - Tenant Themes DB Schema ✅
  - RBAC Middleware ✅
  - Module Registry ✅
  - Permission Guards ✅

- **Sprint 3**: Classes Module - Backend (Task 20)
  - Database migration `011_classes_module.sql` ✅
  - Service layer `lib/services/classes.ts` ✅
  - API Routes `/api/classes/*` ✅

### 🔄 En Progreso
- **Task 21**: Classes Module - UI Components (PRIORITY #1)
  - ❌ ClassesList component
  - ❌ ClassDetail component
  - ❌ EnrollmentManager component
  - ❌ Class creation wizard

### ⏳ Pendiente
- **Sprint 4**: Attendance System (Tasks 22-24)
- **Cleanup**: ESLint warnings, TypeScript errors, TODOs

---

## 🎯 Plan de Sprints Cortos

### SPRINT 3.4.1: ClassesList Component (2-3 horas)
**Objetivo**: Lista completa de clases con filtros y acciones

**Tareas**:
1. Crear `components/classes/ClassesList.tsx`
2. Integration con Table component del design system
3. Filtros: status, level, search
4. Acciones RBAC: View, Edit, Delete, Enroll
5. i18n completo (EN/ES)
6. API integration con `getClasses()` service

**Entregables**:
- ClassesList.tsx (~350 líneas)
- i18n translations (messages/en.json, messages/es.json)
- Commit: `feat(classes): implement ClassesList component`

**Checkpoint**: Commit + push después de testing

---

### SPRINT 3.4.2: ClassDetail Component (2-3 horas)
**Objetivo**: Vista detallada de clase con edición inline

**Tareas**:
1. Crear `components/classes/ClassDetail.tsx`
2. 4 Cards: Class Info, Schedule, Capacity, Enrollment
3. Edit mode toggle con ClassForm integration
4. Delete functionality con confirmation
5. RBAC-aware actions
6. i18n completo (EN/ES)

**Entregables**:
- ClassDetail.tsx (~400 líneas)
- i18n translations
- Commit: `feat(classes): implement ClassDetail component`

**Checkpoint**: Commit + push después de testing

---

### SPRINT 3.4.3: ClassForm Component (3-4 horas)
**Objetivo**: Formulario de creación/edición de clases con validación Zod

**Tareas**:
1. Crear Zod schema `lib/schemas/class.ts`
2. Crear `components/classes/ClassForm.tsx`
3. 3 secciones: Basic Info, Schedule, Capacity & Location
4. API integration (POST create, PUT update)
5. Per-field error handling
6. i18n completo (EN/ES)

**Entregables**:
- class.ts schema (~150 líneas)
- ClassForm.tsx (~450 líneas)
- i18n translations
- Commit: `feat(classes): implement ClassForm with Zod validation`

**Checkpoint**: Commit + push después de testing

---

### SPRINT 3.4.4: EnrollmentManager Component (3-4 horas)
**Objetivo**: Gestión de inscripciones de estudiantes a clases

**Tareas**:
1. Crear `components/classes/EnrollmentManager.tsx`
2. Lista de estudiantes inscritos (Table component)
3. Modal para agregar estudiante (búsqueda + selección)
4. Estado de inscripción (enrolled, active, completed, dropped, withdrawn)
5. Acciones: Enroll, Withdraw, Update Status
6. RBAC-aware (UPDATE_CONTENT permission)
7. i18n completo (EN/ES)

**Entregables**:
- EnrollmentManager.tsx (~400 líneas)
- i18n translations
- Commit: `feat(classes): implement EnrollmentManager component`

**Checkpoint**: Commit + push después de testing

---

### SPRINT 3.4.5: Task 21 Verification & Closure (1-2 horas)
**Objetivo**: Verificar completitud y marcar Task 21 como done

**Tareas**:
1. Verificar 4 componentes implementados
2. ESLint check (0 errors)
3. TypeScript check (0 errors)
4. i18n completitud (EN/ES)
5. Actualizar ACTIVITY_LOG.md
6. Marcar Task 21 como "done" en TaskMaster
7. Final commit + push

**Entregables**:
- ACTIVITY_LOG.md actualizado
- Task 21 → status: "done"
- Commit: `docs: complete Sprint 3.4 - Classes UI Module`

**Checkpoint**: Push final de Sprint 3.4

---

## 🔥 SPRINT 4: Attendance System (5-6 días)

### SPRINT 4.1: Attendance Database & API (2-3 horas)
**Objetivo**: Sistema de asistencia con tracking por clase y estudiante

**Tareas**:
1. Crear migration `012_attendance_system.sql`
2. Crear service layer `lib/services/attendance.ts`
3. Crear API routes `/api/attendance/*`
4. RLS policies para tenant isolation
5. RPC functions para reportes

**Entregables**:
- 012_attendance_system.sql
- attendance.ts service
- API routes (3 endpoints)
- Commit: `feat(attendance): implement attendance tracking system`

---

### SPRINT 4.2: Take Attendance UI (3-4 horas)
**Objetivo**: UI para profesores tomar asistencia rápidamente

**Tareas**:
1. Crear `components/attendance/AttendanceSheet.tsx`
2. Quick toggle (Present/Absent/Excused/Late)
3. Date picker + class selector
4. Bulk actions
5. Mobile-optimized
6. i18n completo (EN/ES)

**Entregables**:
- AttendanceSheet.tsx (~350 líneas)
- i18n translations
- Commit: `feat(attendance): implement take attendance UI`

---

### SPRINT 4.3: Attendance Reports (3-4 horas)
**Objetivo**: Dashboard de reportes con visualizaciones

**Tareas**:
1. Crear `components/attendance/AttendanceReports.tsx`
2. Filtros (date range, class, student)
3. Charts (attendance trends)
4. CSV export functionality
5. i18n completo (EN/ES)

**Entregables**:
- AttendanceReports.tsx (~400 líneas)
- i18n translations
- Commit: `feat(attendance): implement attendance reports dashboard`

---

## 🧹 SPRINT 5: Technical Cleanup (2-3 días)

### CLEANUP 5.1: ESLint Warnings (2-3 horas)
**Objetivo**: Fix 14 warnings no críticos

**Tareas**:
1. Fix React Hook useEffect exhaustive-deps (9 files)
2. Replace `<img>` with `<Image />` from next/image (5 files)
3. Fix @typescript-eslint/no-explicit-any (2 instances)
4. Fix @typescript-eslint/no-unused-vars (1 instance)
5. Run `npm run lint` → 0 warnings

**Checkpoint**: Commit `fix(lint): resolve all ESLint warnings`

---

### CLEANUP 5.2: TODO Resolution (2-3 horas)
**Objetivo**: Resolver TODOs pendientes en código

**Files to fix**:
1. `web/components/players/PlayerRegistrationWizard.tsx` - Load teams functionality
2. `web/tests/unit/components/providers/ThemeProvider.test.tsx` - Setup Vitest
3. `web/public/test-data/GENERATION_REPORT.md` - Archive o delete
4. `web/public/test-data/MODULES_CLASSES_SUMMARY.md` - Archive o delete
5. `web/scripts/vercel-deploy.sh` - Review TODOs

**Checkpoint**: Commit `chore: resolve pending TODOs in codebase`

---

### CLEANUP 5.3: TypeScript Technical Debt (3-4 horas)
**Objetivo**: Fix 17 TypeScript errors en archivos pre-existentes

**Approach**:
1. Identificar los 17 archivos con errores
2. Actualizar schemas obsoletos
3. Fix type mismatches
4. Run `npx tsc --noEmit` → 0 errors
5. Update tsconfig if needed

**Checkpoint**: Commit `fix(types): resolve TypeScript technical debt`

---

## 📋 Estrategia de Commits y Documentación

### Frecuencia de Commits
- **Cada sub-sprint completado**: ~2-4 horas de trabajo
- **Después de cada componente**: Si es grande (>300 líneas)
- **Antes de tareas riesgosas**: Siempre crear checkpoint

### Formato de Commits
```
<type>(<scope>): <description>

[optional body]

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Types**: feat, fix, refactor, docs, test, chore

### Push Strategy
- **Después de cada commit exitoso**: Push inmediato a origin/master
- **Pre-commit hooks**: Siempre activos (ESLint, TypeScript)
- **Verification**: `git log` después de cada push

### Activity Log Updates
**Frecuencia**: Después de cada commit exitoso

**Ubicación**: `/web/ACTIVITY_LOG.md`

**Formato**:
```markdown
## 📅 Sesión: YYYY-MM-DD (Sprint X.Y - Task ZZ)

### 🎯 Objetivo
[Descripción del sprint]

### ✅ Completado (Sprint X.Y)
- [x] Feature 1
- [x] Feature 2

### 📋 Detalles Técnicos
- Files created: X
- Lines of code: ~Y
- Commit: hash

### 📊 Estado Task Master
- Task ZZ: status

**Tiempo invertido**: ~X horas
```

---

## 🎯 Progreso Tracking

### TaskMaster Integration
```bash
# Marcar Task 20 como done
task-master set-status --id=20 --status=done

# Verificar Task 21
task-master show 21

# Marcar subtareas como completadas
# (Usar TodoWrite para tracking interno)
```

### TodoWrite Usage
- Mantener lista actualizada con sub-sprints
- Marcar "in_progress" al empezar
- Marcar "completed" al terminar cada sub-sprint
- Agregar nuevas tareas según sea necesario

---

## 📊 Métricas de Éxito

### Sprint 3.4 (Classes UI)
- ✅ 4 componentes implementados
- ✅ ~1600 líneas de código
- ✅ i18n completo (EN/ES)
- ✅ ESLint passing
- ✅ TypeScript passing
- ✅ 4-5 commits
- ⏱️ Duración estimada: 10-13 horas (2-3 días)

### Sprint 4 (Attendance)
- ✅ Database + Service + API
- ✅ 3 componentes UI
- ✅ ~1200 líneas de código
- ✅ i18n completo (EN/ES)
- ⏱️ Duración estimada: 8-11 horas (2-3 días)

### Sprint 5 (Cleanup)
- ✅ 0 ESLint warnings
- ✅ 0 TypeScript errors
- ✅ 0 TODOs críticos
- ⏱️ Duración estimada: 7-10 horas (2-3 días)

---

## 🚦 Next Actions

### Immediate (Now)
1. ✅ Commit estado actual (tasks.json + signout.ts)
2. ✅ Actualizar Task 20 → "done"
3. ✅ Actualizar ACTIVITY_LOG.md
4. 🔄 Empezar SPRINT 3.4.1 (ClassesList)

### Short-term (Hoy)
1. Completar ClassesList component
2. Commit + push
3. Empezar ClassDetail component

### Medium-term (Esta semana)
1. Completar Sprint 3.4 (Classes UI)
2. Iniciar Sprint 4.1 (Attendance DB/API)
3. Mantener commits frecuentes

### Long-term (Próxima semana)
1. Completar Sprint 4 (Attendance System)
2. Iniciar Sprint 5 (Cleanup)
3. E2E testing si hay tiempo

---

**Última actualización**: 2025-12-20
**Estado**: ✅ Plan aprobado, listo para ejecución
