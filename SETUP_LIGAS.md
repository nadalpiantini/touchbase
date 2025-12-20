# 🏆 Setup Completo: Sistema de Ligas y Torneos

**Fecha:** 2025-12-20
**Estado:** ✅ UI Implementada | ⚠️ Requiere Configuración de BD

---

## 📋 Resumen Ejecutivo

Se ha implementado exitosamente la **funcionalidad de Ligas/Torneos** en TouchBase con la siguiente arquitectura:

### ✅ Componentes Implementados

1. **Frontend (UI completa)**
   - Página: `/dashboard/leagues`
   - Componente: `LeagueStandings.tsx` - Tabla de clasificaciones
   - API Endpoint: `/api/leagues/standings` - Lectura de clasificaciones
   - Navegación: Link "Ligas" agregado al menú principal

2. **Traducciones**
   - Español (es.json): Todas las etiquetas de UI
   - Inglés (en.json): Traducciones completas

3. **Scripts y Migraciones**
   - `004a_fix_standings.sql` - Corrección de vista de standings
   - `seed-tournament.ts` - Script para crear datos de prueba
   - `check-tournaments.ts` - Verificación de estado de BD
   - `check-schema.ts` - Inspección de esquema

### ⚠️ Requiere Configuración

Para que el sistema funcione completamente, necesitas:

1. **Aplicar migración de standings** (crítico)
2. **Crear datos de torneo** (equipos, partidos)
3. **Configurar permisos RLS** en Supabase

---

## 🔧 Pasos de Configuración

### Paso 1: Aplicar Migración de Standings ⭐ CRÍTICO

La vista `touchbase_standings` NO existe actualmente. Debes crearla:

**Método 1: Supabase Dashboard (Recomendado)**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Copia y pega el contenido completo de:
   ```
   /migrations/postgres/004a_fix_standings.sql
   ```
4. Click en **Run** (▶️)
5. Verifica que aparece: `Success. No rows returned`

**Método 2: CLI de Supabase**

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O directamente con psql (si tienes acceso directo)
psql "tu_connection_string" < migrations/postgres/004a_fix_standings.sql
```

**Verificación:**
```sql
-- Ejecuta esto en SQL Editor para verificar
SELECT * FROM touchbase_standings LIMIT 1;
-- Debe devolver filas o indicar "0 rows" sin error
```

---

### Paso 2: Crear Equipos

Tienes dos opciones:

#### Opción A: Manualmente vía UI (Más control)

1. Ve a `/dashboard/teams`
2. Crea al menos 4-6 equipos con nombre y categoría
3. Anota los IDs de los equipos creados

#### Opción B: Via API (Requiere autenticación)

```bash
# Necesitas estar logueado y obtener un token de sesión
# Luego puedes crear equipos via:

curl -X POST http://localhost:3000/api/teams/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"name": "Tigres del Norte", "category": "U14"}'
```

#### Opción C: Script de Seed (Avanzado)

El script `seed-tournament.ts` requiere ajustes al esquema real de tu BD.
Actualmente tiene problemas de autenticación y schema.

---

### Paso 3: Asignar Equipos al Torneo

El torneo "Spring Championship 2025" ya existe (ID: 1).

**Via SQL Editor en Supabase:**

```sql
-- Reemplaza TEAM_ID_1, TEAM_ID_2, etc. con los IDs reales de tus equipos
INSERT INTO touchbase_tournament_teams (tournament_id, team_id, seed)
VALUES
  (1, TEAM_ID_1, 1),
  (1, TEAM_ID_2, 2),
  (1, TEAM_ID_3, 3),
  (1, TEAM_ID_4, 4),
  (1, TEAM_ID_5, 5),
  (1, TEAM_ID_6, 6)
ON CONFLICT (tournament_id, team_id) DO NOTHING;
```

**Verificación:**
```sql
SELECT tt.*, t.name as team_name
FROM touchbase_tournament_teams tt
JOIN touchbase_teams t ON t.id = tt.team_id
WHERE tt.tournament_id = 1;
```

---

### Paso 4: Crear Partidos del Torneo

**Opción A: Round-Robin (cada equipo juega con todos)**

```sql
-- Ejemplo: Partido entre equipo 1 vs equipo 2
INSERT INTO touchbase_matches
  (tournament_id, round, match_number, team_home, team_away, scheduled_at, venue, status)
VALUES
  (1, 1, 1, TEAM_ID_1, TEAM_ID_2, '2025-03-01 15:00:00', 'Campo 1', 'scheduled'),
  (1, 1, 2, TEAM_ID_3, TEAM_ID_4, '2025-03-01 17:00:00', 'Campo 2', 'scheduled'),
  (1, 1, 3, TEAM_ID_5, TEAM_ID_6, '2025-03-01 19:00:00', 'Campo 3', 'scheduled');
  -- Añade más partidos según necesites...
```

**Opción B: Usar el seed script (cuando esté corregido)**

Edita `seed-tournament-simple.ts` con los IDs correctos de tus equipos.

---

### Paso 5: Simular Partidos Completados (Opcional)

Para tener datos en la clasificación:

```sql
-- Actualizar un partido como completado con scores
UPDATE touchbase_matches
SET
  status = 'completed',
  score_home = 5,
  score_away = 3,
  winner_team_id = team_home, -- El equipo local ganó
  played_at = scheduled_at,
  completed_at = scheduled_at + INTERVAL '2 hours'
WHERE id = 1; -- Reemplaza con el ID del partido

-- Repite para varios partidos con diferentes scores
```

---

## 🧪 Verificación y Pruebas

### Test Manual

1. **Inicia el servidor:**
   ```bash
   cd web
   npm run dev
   ```

2. **Navega a:**
   ```
   http://localhost:3000/es/login
   ```

3. **Login:**
   - Email: `nadalpiantini@gmail.com`
   - Password: `Teclados#13`

4. **Click en "Ligas"** en el menú de navegación

5. **Deberías ver:**
   - ✅ **Si standings funciona:** Tabla de clasificación con equipos
   - ⚠️ **Si standings no existe:** Mensaje "Vista de clasificaciones no disponible"
   - ℹ️ **Si no hay datos:** "No hay datos de clasificación disponibles"

### Test Automático con Playwright

```bash
cd web
npx playwright test tests/explore-leagues.spec.ts --headed
```

---

## 📊 Estructura de Datos

### Diagrama de Relaciones

```
touchbase_tournaments
    ↓ (1:N)
touchbase_tournament_teams → touchbase_teams
    ↓ (N:N via tournament_id)
touchbase_matches
    ↓ (agrupados en)
touchbase_standings (VIEW) ← Esta es la que necesitas crear
```

### Modelo de Vista `touchbase_standings`

La vista calcula automáticamente:
- Partidos jugados (PJ)
- Victorias (G)
- Derrotas (P)
- Empates (E)
- Carreras a favor (RF)
- Carreras en contra (RC)
- Diferencial de carreras (Dif)
- Porcentaje de victorias (%)

**Importante:** La vista se actualiza automáticamente cada vez que:
- Se completa un partido
- Se actualiza un score
- Se cambia el ganador

---

## 🚨 Problemas Comunes

### Error: "Vista de clasificaciones no disponible"

**Causa:** La vista `touchbase_standings` no existe
**Solución:** Aplica `004a_fix_standings.sql` (Paso 1)

### Error: "No hay datos de clasificación"

**Causa:** No hay equipos o partidos en el torneo
**Solución:** Completa Pasos 2-4

### Error: "relation does not exist"

**Causa:** Tablas de torneos no creadas
**Solución:** Aplica migración `004_tournaments.sql` primero

### Página en blanco / Error 500

**Causa:** Problemas de permisos RLS
**Solución:** Verifica políticas RLS en Supabase para:
- `touchbase_tournaments`
- `touchbase_tournament_teams`
- `touchbase_matches`
- `touchbase_standings`

---

## 🎯 Checklist de Activación

- [ ] Migración `004a_fix_standings.sql` aplicada
- [ ] Vista `touchbase_standings` existe (verificado en SQL Editor)
- [ ] Al menos 4 equipos creados
- [ ] Equipos asignados al torneo (touchbase_tournament_teams)
- [ ] Al menos 3 partidos creados
- [ ] Al menos 1 partido marcado como completado con scores
- [ ] Permisos RLS configurados correctamente
- [ ] Test manual exitoso (ver clasificación en UI)
- [ ] Navegación "Ligas" visible en menú

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

```
web/
├── components/
│   └── leagues/
│       └── LeagueStandings.tsx          # Componente de clasificación
├── app/
│   ├── [locale]/(protected)/dashboard/
│   │   └── leagues/
│   │       └── page.tsx                 # Página de ligas
│   └── api/
│       └── leagues/
│           └── standings/
│               └── route.ts             # API endpoint
└── scripts/
    ├── seed-tournament.ts               # Script de seed (WIP)
    ├── seed-tournament-simple.ts        # Script simplificado
    ├── check-tournaments.ts             # Verificación de BD
    └── check-schema.ts                  # Inspección de schema

migrations/postgres/
└── 004a_fix_standings.sql               # Migración de standings

INFORME_LIGAS.md                         # Informe de investigación
SETUP_LIGAS.md                           # Este documento
```

### Archivos Modificados

```
web/
├── app/[locale]/(protected)/layout.tsx  # Navegación actualizada
├── messages/
│   ├── es.json                          # Traducciones ES
│   └── en.json                          # Traducciones EN
└── tests/
    ├── explore-leagues.spec.ts          # Test de UI
    └── explore-partidos.spec.ts         # Test de partidos
```

---

## 🎓 Próximos Pasos Sugeridos

1. **Mejorar UI:**
   - Agregar selector de torneos (si tienes múltiples)
   - Gráficos de estadísticas
   - Detalles de partidos por equipo

2. **Funcionalidad Adicional:**
   - CRUD de torneos desde UI
   - Generador automático de calendario round-robin
   - Brackets de eliminación directa
   - Exportar clasificación a PDF/CSV

3. **Integración:**
   - Conectar con sistema de Games existente
   - Unificar `touchbase_games` y `touchbase_matches`
   - Sincronización de scores en tiempo real

4. **Optimización:**
   - Cache de standings
   - Paginación para muchos equipos
   - Filtros por temporada/categoría

---

## 🤝 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor: `npm run dev`
2. Verifica la consola del navegador (F12 → Console)
3. Verifica logs de Supabase (Dashboard → Logs)
4. Ejecuta `npx tsx scripts/check-tournaments.ts` para diagnóstico

---

**¡Sistema de Ligas Listo para Usar!** 🎉

Una vez completados los pasos de configuración, tendrás un sistema completo de gestión de ligas y torneos con clasificaciones en tiempo real.
