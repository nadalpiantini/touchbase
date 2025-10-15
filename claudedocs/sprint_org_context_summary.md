# Sprint: Org Context & Switching + Teams & Players CRUD

## ✅ Completado

### 🗄️ Base de Datos

**Archivo SQL**: `supabase/migrations/sprint_org_context.sql`

1. **Schema corregido de players**
   - ❌ Eliminado: `profile_id` (FK a profiles)
   - ✅ Añadido: `full_name TEXT NOT NULL` (directo)
   - ✅ FK corregida: `team_id UUID → touchbase_teams(id)`
   - ✅ Constraint unique: `(org_id, name)` en teams

2. **RPCs de Organizaciones**
   - `touchbase_current_org()` → Devuelve org_id, org_name, role del usuario
   - `touchbase_switch_org(p_target_org UUID)` → Cambia default_org_id
   - `touchbase_list_orgs()` → Lista todas las orgs del usuario con rol

3. **RPCs de Teams & Players**
   - `touchbase_list_teams_current_org()` → Lista equipos de la org actual
   - `touchbase_list_players_current_org(p_team_id UUID)` → Lista jugadores (filtro opcional por team)

4. **Políticas RLS reforzadas**
   - `touchbase_teams_rw_members`: solo miembros pueden ver/modificar equipos de su org
   - `touchbase_players_rw_members`: solo miembros pueden ver/modificar jugadores de su org

---

### 🔌 API Routes

**Organizaciones** (`/api/orgs/`)
- `GET /api/orgs/current` → Org actual del usuario
- `GET /api/orgs/list` → Todas las orgs donde es miembro
- `POST /api/orgs/switch` → Cambiar org activa (body: `{org_id}`)

**Equipos** (`/api/teams/`)
- `GET /api/teams/list` → Equipos de la org actual
- `POST /api/teams/create` → Crear equipo (body: `{name}`)

**Jugadores** (`/api/players/`)
- `GET /api/players/list?team_id=<uuid>` → Jugadores (filtro opcional)
- `POST /api/players/create` → Crear jugador (body: `{full_name, team_id?}`)

---

### 🎨 Componentes UI

**Organizaciones**
- `components/org/OrgDropdown.tsx`
  - Selector de org en tiempo real
  - Muestra org actual + rol
  - Cambia org y recarga página

**Equipos**
- `components/teams/NewTeamForm.tsx` → Formulario de creación
- `components/teams/TeamsTable.tsx` → Tabla con lista de equipos

**Jugadores**
- `components/players/NewPlayerForm.tsx` → Formulario con dropdown de equipos
- `components/players/PlayersTable.tsx` → Tabla con filtro por equipo

---

### 📄 Páginas

1. **Dashboard Teams** → `/dashboard/teams`
   - Formulario + Tabla de equipos
   - Path: `web/app/(protected)/dashboard/teams/page.tsx`

2. **Dashboard Players** → `/dashboard/players`
   - Formulario + Tabla de jugadores con filtro
   - Path: `web/app/(protected)/dashboard/players/page.tsx`

3. **Protected Layout** actualizado
   - Navegación: Dashboard | Equipos | Jugadores
   - OrgDropdown en header
   - Path: `web/app/(protected)/layout.tsx`

---

## 🚀 Próximos Pasos

### 1. Ejecutar SQL en Supabase
```bash
# Copiar contenido de:
supabase/migrations/sprint_org_context.sql

# Pegarlo en Supabase SQL Editor y ejecutar
```

### 2. Verificar ENV Variables
```bash
cd web
vercel env pull .env.local  # Si usas Vercel
# O asegurar que tienes:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Probar Localmente
```bash
cd web
npm run dev
```

**Flujo de prueba**:
1. Login con usuario existente
2. Ir a `/dashboard/teams` → Crear equipo → Verificar aparece en tabla
3. Ir a `/dashboard/players` → Crear jugador con/sin equipo → Verificar tabla
4. Probar filtro por equipo en jugadores
5. Si tienes acceso a múltiples orgs: probar OrgDropdown switch

### 4. Deploy
```bash
git push origin master  # Ya hiciste commit
# Vercel auto-deploya si está conectado
# O manualmente: vercel --prod
```

### 5. Validar Multi-Tenancy (Crítico)
- Crear segunda org manualmente en Supabase
- Agregar membership de tu usuario a esa org
- Probar switch de org → verificar que:
  - Equipos/jugadores cambian según org activa
  - No puedes ver datos de otras orgs
  - RLS funciona correctamente

---

## 📋 Checklist de Validación

- [ ] SQL ejecutado en Supabase sin errores
- [ ] ENV variables configuradas
- [ ] `npm run dev` funciona sin errores TypeScript
- [ ] Crear equipo → aparece en tabla
- [ ] Crear jugador → aparece en tabla
- [ ] Filtro de jugadores por equipo funciona
- [ ] OrgDropdown muestra org actual
- [ ] (Si multi-org) Switch cambia contexto correctamente
- [ ] RLS: usuario de otra org NO ve tus datos
- [ ] Deploy a Vercel exitoso
- [ ] Producción: todas las funcionalidades funcionan

---

## 🔧 Troubleshooting

**Error: "No default org"**
- El usuario no tiene `default_org_id` en su profile
- Solución: Ejecutar `/api/onboarding` primero o setear manualmente en Supabase

**Error FK en players.team_id**
- La migration ya corrige esto (UUID consistency)
- Si persiste: verificar que ejecutaste `sprint_org_context.sql`

**No aparecen equipos/jugadores**
- Verificar que `touchbase_current_org()` devuelve datos
- Verificar que el usuario tiene membership en la org
- Revisar políticas RLS en Supabase

**OrgDropdown vacío**
- Usuario no tiene memberships en ninguna org
- Ejecutar onboarding o crear membership manualmente

---

## 📊 Estadísticas del Sprint

- **Archivos creados**: 24
- **Líneas añadidas**: ~1,391
- **RPCs nuevas**: 5
- **API endpoints**: 7
- **Componentes UI**: 6
- **Páginas**: 2
- **Tiempo estimado**: ~2-3 horas de implementación

---

## 🎯 Próximo Sprint Sugerido

**Sprint: Edit & Delete con Soft-Delete**
- Editar equipos/jugadores
- Eliminar con status (soft-delete)
- Historial de cambios
- Bulk operations

¿Quieres que arranque con ese sprint o prefieres otra funcionalidad?
