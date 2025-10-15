# Sprint: Edit & Soft-Delete + Vercel Fix

## ✅ Completado (Commit: 6ec3756)

### 📦 Archivos Nuevos

**SQL Migrations:**
- `supabase/migrations/soft_delete_edit.sql` - Soft delete + RLS por roles + restore RPCs
- `supabase/migrations/complete_setup.sql` - Setup completo desde cero (backup)

**API Routes:**
- `/api/teams/update` (PATCH) - Editar nombre de equipo
- `/api/teams/soft-delete` (POST) - Borrado suave
- `/api/teams/restore` (POST) - Restaurar equipo eliminado
- `/api/players/update` (PATCH) - Editar jugador (nombre + team)
- `/api/players/soft-delete` (POST) - Borrado suave
- `/api/players/restore` (POST) - Restaurar jugador eliminado

**UI Actualizada:**
- `components/teams/TeamsTable.tsx` - Edición inline + borrar
- `components/players/PlayersTable.tsx` - Edición inline + borrar + cambiar equipo

**Configuración:**
- `vercel.json` - Actualizado para detectar Next.js correctamente

---

## 🗄️ Base de Datos

### Soft Delete (deleted_at)
```sql
ALTER TABLE touchbase_teams ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE touchbase_players ADD COLUMN deleted_at TIMESTAMPTZ;
```

### Función Helper: touchbase_has_role()
Permite verificar si un usuario tiene uno de los roles especificados en una org:
```sql
touchbase_has_role(org_id, ARRAY['owner','admin','coach'])
```

### Políticas RLS Granulares

**Teams:**
- **Select**: Todos los miembros
- **Insert**: owner/admin/coach
- **Update**: owner/admin/coach
- **Delete**: owner/admin (soft-delete via API)

**Players:**
- **Select**: Todos los miembros
- **Insert**: owner/admin/coach
- **Update**: owner/admin/coach
- **Delete**: owner/admin/coach (soft-delete via API)

### RPCs de Restauración
```sql
touchbase_restore_team(p_team UUID) → BOOLEAN
touchbase_restore_player(p_player UUID) → BOOLEAN
```

Validan permisos y establecen `deleted_at = NULL`.

---

## 🔌 API Endpoints

### Teams

**PATCH /api/teams/update**
```json
Request: { "id": "uuid", "name": "Nuevo nombre" }
Response: { "ok": true, "id": "uuid" }
```

**POST /api/teams/soft-delete**
```json
Request: { "id": "uuid" }
Response: { "ok": true }
```

**POST /api/teams/restore**
```json
Request: { "id": "uuid" }
Response: { "ok": true }
```

### Players

**PATCH /api/players/update**
```json
Request: { "id": "uuid", "full_name": "Nombre", "team_id": "uuid|null" }
Response: { "ok": true, "id": "uuid" }
```

**POST /api/players/soft-delete**
```json
Request: { "id": "uuid" }
Response: { "ok": true }
```

**POST /api/players/restore**
```json
Request: { "id": "uuid" }
Response: { "ok": true }
```

### Listas Actualizadas

**GET /api/teams/list**
- Ahora filtra `deleted_at IS NULL` automáticamente
- Solo muestra equipos activos

**GET /api/players/list?team_id=<uuid>**
- Filtra `deleted_at IS NULL` automáticamente
- Solo muestra jugadores activos
- Filtro opcional por team_id

---

## 🎨 UI Features

### TeamsTable

**Modo Vista:**
- Botones: Editar | Borrar

**Modo Edición:**
- Input inline para nombre
- Botones: Guardar | Cancelar
- Shortcuts: Enter (guardar), Escape (cancelar)

**Funcionalidad:**
- Click "Editar" → modo edición
- Editar nombre inline
- "Guardar" → PATCH /api/teams/update → reload
- "Borrar" → confirmación → POST /api/teams/soft-delete → reload

### PlayersTable

**Modo Vista:**
- Botones: Editar | Borrar

**Modo Edición:**
- Input inline para nombre
- Select para cambiar equipo
- Botones: Guardar | Cancelar
- Shortcuts: Enter (guardar), Escape (cancelar)

**Funcionalidad:**
- Click "Editar" → modo edición
- Editar nombre + team inline
- "Guardar" → PATCH /api/players/update → reload con filtro actual
- "Borrar" → confirmación → POST /api/players/soft-delete → reload

---

## 🛠️ Vercel Fix

### Problema
Vercel no detectaba el proyecto como Next.js (mostraba "Framework Preset: Other").

### Solución
Actualizado `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

Ahora Vercel debe detectar automáticamente Next.js y usar los comandos correctos.

---

## 🚀 Deployment Steps

### 1. Ejecutar SQL en Supabase
```bash
# Copiar contenido de:
supabase/migrations/soft_delete_edit.sql

# Pegar en Supabase SQL Editor → Run
```

### 2. Verificar Vercel
- El push ya está hecho
- Vercel debería auto-deployar
- Check: https://vercel.com/tu-proyecto/deployments
- Verificar que detecta "Framework: Next.js"

### 3. Probar Funcionalidades

**Local:**
```bash
npm run dev
# → /dashboard/teams → crear/editar/borrar equipo
# → /dashboard/players → crear/editar/borrar jugador
```

**Producción (después de Vercel deploy):**
- Login
- Ir a /dashboard/teams
  - Crear equipo → verificar aparece
  - Click "Editar" → cambiar nombre → "Guardar"
  - Verificar actualización
  - Click "Borrar" → confirmar → verificar desaparece
- Ir a /dashboard/players
  - Crear jugador con equipo
  - Click "Editar" → cambiar nombre y equipo → "Guardar"
  - Verificar actualización
  - Probar filtro por equipo
  - Click "Borrar" → confirmar → verificar desaparece

### 4. Validar RLS por Roles

**Test con diferentes roles:**
1. Usuario como **owner**: puede todo
2. Usuario como **admin**: puede todo
3. Usuario como **coach**: puede insert/update players, NO delete teams
4. Usuario como **viewer**: solo lectura (RLS bloquea writes)

**Test multi-tenant:**
1. Usuario con acceso a 2+ orgs
2. Cambiar org con OrgDropdown
3. Verificar que equipos/jugadores cambian según org activa
4. Usuario de org A NO ve datos de org B

---

## 📋 Checklist de Validación

- [ ] SQL ejecutado en Supabase sin errores
- [ ] Vercel detecta "Framework: Next.js"
- [ ] Deploy exitoso en Vercel
- [ ] Editar equipo funciona (inline + save)
- [ ] Borrar equipo funciona (soft-delete + confirmación)
- [ ] Editar jugador funciona (nombre + team)
- [ ] Borrar jugador funciona (soft-delete + confirmación)
- [ ] Filtro de jugadores por equipo funciona
- [ ] Keyboard shortcuts (Enter/Escape) funcionan
- [ ] RLS: owner/admin pueden todo
- [ ] RLS: coach NO puede delete teams
- [ ] RLS: viewer solo lectura
- [ ] Multi-tenant: switch de org funciona
- [ ] Borrados NO aparecen en listas

---

## 🔄 Próximo Sprint Sugerido

### Opción A: Papelera + Restore UI
- Vista `/dashboard/trash` con equipos/jugadores borrados
- Botones "Restaurar" y "Borrar definitivamente"
- Filtros por tipo (teams/players) y fecha

### Opción B: Audit Log
- Tabla `touchbase_audit_log`
- Triggers en insert/update/delete
- Vista de historial por equipo/jugador
- "Quién cambió qué y cuándo"

### Opción C: Bulk Operations
- Selección múltiple (checkboxes)
- Borrar varios a la vez
- Mover jugadores entre equipos (bulk)
- Exportar a CSV

### Opción D: Juegos/Partidos
- Tabla `touchbase_games`
- CRUD de partidos (team vs team)
- Score tracking
- Calendario de juegos

¿Cuál preferís? 🚀
