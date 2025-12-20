# 🚀 SPRINT PLAN - TouchBase Development

**Fecha Inicio**: 2025-12-20
**Estado**: ✅ Active

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual
- **Task 19** (Teachers Module): 85% completo
  - ✅ Service layer + API Routes
  - ✅ TeachersList component
  - ⏳ 4 componentes UI pendientes
  
- **Tasks 20-24** (Classes + Attendance): Pendientes

### Objetivo
Completar Teachers Module + Implementar Classes y Attendance Modules en 3 sprints cortos (6-7 días).

---

## 🎯 SPRINT 1: Teachers UI Complete (2 días)

### Sprint 1.1: TeacherForm Component
**Duración**: 3-4 horas | **Día**: 1 Mañana

**Archivos**:
- `web/lib/schemas/teacher.ts` (nuevo)
- `web/components/teachers/TeacherForm.tsx` (nuevo)

**Tareas**:
1. Crear Zod schema para validación
2. Form con 4 secciones (Personal, Professional, Employment, Emergency)
3. API integration + error handling
4. i18n (en/es)

**Checkpoint**:
```bash
git add web/lib/schemas/teacher.ts web/components/teachers/TeacherForm.tsx
git commit -m "feat(teachers): add TeacherForm with Zod validation"
git push origin master
```

---

### Sprint 1.2: TeacherDetail Component
**Duración**: 2-3 horas | **Día**: 1 Tarde

**Archivos**:
- `web/components/teachers/TeacherDetail.tsx` (nuevo)

**Tareas**:
1. Vista completa de profile
2. Acciones RBAC (Edit, Delete)
3. Loading states + i18n

**Checkpoint**:
```bash
git add web/components/teachers/TeacherDetail.tsx
git commit -m "feat(teachers): add TeacherDetail component"
git push origin master
```

---

### Sprint 1.3: TeacherClassesCard Component
**Duración**: 2-3 horas | **Día**: 2 Mañana

**Archivos**:
- `web/components/teachers/TeacherClassesCard.tsx` (nuevo)

**Tareas**:
1. Lista de clases asignadas
2. Add/Remove assignments con modal
3. Role selection (primary/assistant/substitute)
4. API integration + i18n

**Checkpoint**:
```bash
git add web/components/teachers/TeacherClassesCard.tsx
git commit -m "feat(teachers): add TeacherClassesCard for assignments"
git push origin master
```

---

### Sprint 1.4: TeacherAvailabilityCard Component
**Duración**: 3-4 horas | **Día**: 2 Tarde

**Archivos**:
- `web/components/teachers/TeacherAvailabilityCard.tsx` (nuevo)

**Tareas**:
1. Weekly schedule grid (7 días)
2. Add/edit/delete time slots
3. Visual calendar
4. API integration + validations + i18n

**Checkpoint**:
```bash
git add web/components/teachers/TeacherAvailabilityCard.tsx
git commit -m "feat(teachers): add TeacherAvailabilityCard with weekly schedule"
git push origin master
```

---

### Sprint 1.5: Task 19 Completion
**Duración**: 1 hora | **Día**: 2 Final

**Tareas**:
1. Update ACTIVITY_LOG
2. Set Task 19 to 'done'
3. Final verification (TypeScript, ESLint, build)

**Checkpoint**:
```bash
task-master set-status --id=19 --status=done
git add web/ACTIVITY_LOG.md .taskmaster/tasks/tasks.json
git commit -m "docs: Task 19 completed - Teachers Module UI"
git push origin master
```

---

## 🎯 SPRINT 2: Classes Module (2-3 días)

### Sprint 2.1: Classes Database
**Duración**: 2-3 horas | **Task**: 20

**Archivos**:
- `migrations/postgres/007_classes.sql` (nuevo)

**Tareas**:
1. Schema para classes table
2. Enrollment system (teacher_classes, student_classes)
3. Migration + RLS policies

**Checkpoint**:
```bash
git add migrations/postgres/007_classes.sql
git commit -m "feat(classes): add database schema with enrollment"
git push origin master
```

---

### Sprint 2.2: Classes API
**Duración**: 3-4 horas | **Task**: 20

**Archivos**:
- `web/lib/services/classes.ts` (nuevo)
- `web/app/api/classes/**` (nuevos)

**Tareas**:
1. Service layer completo
2. API Routes (GET, POST, PUT, DELETE)
3. RBAC protection + validations

**Checkpoint**:
```bash
git add web/lib/services/classes.ts web/app/api/classes/
git commit -m "feat(classes): add API routes with RBAC"
git push origin master
task-master set-status --id=20 --status=done
```

---

### Sprint 2.3: ClassesList Component
**Duración**: 2-3 horas | **Task**: 21

**Archivos**:
- `web/components/classes/ClassesList.tsx` (nuevo)

**Tareas**:
1. Lista con filtros
2. Table integration + Search
3. RBAC actions + i18n

**Checkpoint**:
```bash
git add web/components/classes/ClassesList.tsx
git commit -m "feat(classes): add ClassesList component"
git push origin master
```

---

### Sprint 2.4: ClassForm & ClassDetail
**Duración**: 3-4 horas | **Task**: 21

**Archivos**:
- `web/components/classes/ClassForm.tsx` (nuevo)
- `web/components/classes/ClassDetail.tsx` (nuevo)

**Tareas**:
1. ClassForm (create/edit)
2. ClassDetail (full view)
3. Enrollment management UI

**Checkpoint**:
```bash
git add web/components/classes/ClassForm.tsx web/components/classes/ClassDetail.tsx
git commit -m "feat(classes): add ClassForm and ClassDetail components"
git push origin master
task-master set-status --id=21 --status=done
```

---

## 🎯 SPRINT 3: Attendance System (2-3 días)

### Sprint 3.1: Attendance Database & API
**Duración**: 4-5 horas | **Task**: 22

**Archivos**:
- `migrations/postgres/008_attendance.sql` (nuevo)
- `web/lib/services/attendance.ts` (nuevo)
- `web/app/api/attendance/**` (nuevos)

**Tareas**:
1. Schema + API Routes
2. Service layer + RBAC

**Checkpoint**:
```bash
git add migrations/postgres/008_attendance.sql web/lib/services/attendance.ts web/app/api/attendance/
git commit -m "feat(attendance): add database schema and API routes"
git push origin master
task-master set-status --id=22 --status=done
```

---

### Sprint 3.2: Take Attendance UI
**Duración**: 3-4 horas | **Task**: 23

**Archivos**:
- `web/components/attendance/TakeAttendance.tsx` (nuevo)

**Tareas**:
1. Quick entry interface
2. Bulk actions + Date picker
3. i18n completo

**Checkpoint**:
```bash
git add web/components/attendance/TakeAttendance.tsx
git commit -m "feat(attendance): add TakeAttendance UI"
git push origin master
task-master set-status --id=23 --status=done
```

---

### Sprint 3.3: Attendance Reports
**Duración**: 3-4 horas | **Task**: 24

**Archivos**:
- `web/components/attendance/AttendanceReports.tsx` (nuevo)

**Tareas**:
1. Charts + visualizations
2. Export functionality
3. Filters + i18n

**Checkpoint**:
```bash
git add web/components/attendance/AttendanceReports.tsx
git commit -m "feat(attendance): add AttendanceReports dashboard"
git push origin master
task-master set-status --id=24 --status=done
```

---

## 📝 COMMIT STRATEGY

### Frecuencia
- **Cada 2-3 horas**: Checkpoint commit
- **Cada día**: Push al final
- **Cada sprint**: Update ACTIVITY_LOG

### Formato
```
tipo(scope): descripción corta

- Cambios principales
- Referencias a Task Master

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Tipos**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
**Scopes**: `teachers`, `classes`, `attendance`, `ui`, `api`, `db`

---

## 🔄 WORKFLOW DIARIO

### Inicio
```bash
git status
git pull origin master
task-master next
```

### Durante Desarrollo
```bash
# Cada 2-3 horas
git add <files>
git commit -m "..."
git push origin master
```

### Final
```bash
# Update ACTIVITY_LOG
git add web/ACTIVITY_LOG.md
git commit -m "docs: update ACTIVITY_LOG"
git push origin master
```

---

## ✅ PRÓXIMO PASO

**START HERE**: Sprint 1.1 - TeacherForm Component

```bash
mkdir -p web/lib/schemas
touch web/lib/schemas/teacher.ts
# Implementar Zod schema y TeacherForm
```

---

**Métricas de Éxito**:
- ✅ TypeScript sin errores
- ✅ ESLint passing
- ✅ Pre-commit hooks passing
- ✅ ACTIVITY_LOG actualizado
- ✅ Task Master status actualizado
