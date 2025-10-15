# 🎯 TouchBase - Aplicar Migraciones a Supabase

**Instrucciones paso a paso para aplicar las migraciones PostgreSQL correctas**

---

## ⚠️ IMPORTANTE

**Ejecutaste las migraciones incorrectas** (sintaxis MySQL).

Las migraciones **correctas** para PostgreSQL están en:
```
plugin/touchbase_pack/migrations/postgres/
```

**NO uses** las de `migrations/` (esas son para MySQL/MariaDB local).

---

## 🚀 Instrucciones de Ejecución

### Paso 1: Ir a Supabase SQL Editor

Abre esta URL:
```
https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql/new
```

---

### Paso 2: Limpiar Tablas Parciales (si existen)

**Copy-paste esto en SQL Editor y ejecuta:**

```sql
-- Limpiar cualquier tabla parcial o mal creada
DROP TABLE IF EXISTS touchbase_billing_config CASCADE;
DROP TABLE IF EXISTS touchbase_billing_transactions CASCADE;
DROP TABLE IF EXISTS touchbase_email_queue CASCADE;
DROP TABLE IF EXISTS touchbase_tenant_analytics CASCADE;
DROP TABLE IF EXISTS touchbase_tenant_sessions CASCADE;
DROP TABLE IF EXISTS touchbase_stats CASCADE;
DROP TABLE IF EXISTS touchbase_attendance CASCADE;
DROP TABLE IF EXISTS touchbase_schedule CASCADE;
DROP TABLE IF EXISTS touchbase_roster CASCADE;
DROP TABLE IF EXISTS touchbase_matches CASCADE;
DROP TABLE IF EXISTS touchbase_tournament_teams CASCADE;
DROP TABLE IF EXISTS touchbase_tournaments CASCADE;
DROP TABLE IF EXISTS touchbase_teams CASCADE;
DROP TABLE IF EXISTS touchbase_seasons CASCADE;
DROP TABLE IF EXISTS touchbase_clubs CASCADE;
DROP TABLE IF EXISTS touchbase_tenants CASCADE;
DROP TABLE IF EXISTS touchbase_migrations CASCADE;

-- Limpiar tipos ENUM si existen
DROP TYPE IF EXISTS touchbase_event_type CASCADE;
DROP TYPE IF EXISTS touchbase_attendance_status CASCADE;
DROP TYPE IF EXISTS touchbase_theme_mode CASCADE;
DROP TYPE IF EXISTS touchbase_tournament_format CASCADE;
DROP TYPE IF EXISTS touchbase_tournament_status CASCADE;
DROP TYPE IF EXISTS touchbase_match_status CASCADE;
DROP TYPE IF EXISTS touchbase_email_status CASCADE;
DROP TYPE IF EXISTS touchbase_payment_status CASCADE;
```

Click **"RUN"**

Debería mostrar: `DROP TABLE` (varias veces)

---

### Paso 3: Aplicar Migraciones EN ORDEN

**Ejecuta cada archivo EN ORDEN** (una nueva query por cada migración):

---

#### Migración 1: Tracking Table

**Archivo:** `migrations/postgres/000_migrations_table.sql`

**Abre el archivo** en tu editor de código y copy-paste TODO el contenido en SQL Editor, luego **RUN**.

<details>
<summary>Ver contenido completo</summary>

```sql
-- ============================================================
-- TouchBase Migration 000: Migrations Tracking Table
-- Tracks which migrations have been applied
-- Prefix: touchbase_*
-- ============================================================

CREATE TABLE IF NOT EXISTS touchbase_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    batch INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_migrations_name ON touchbase_migrations(migration_name);
CREATE INDEX IF NOT EXISTS idx_migrations_batch ON touchbase_migrations(batch);

COMMENT ON TABLE touchbase_migrations IS 'Track applied database migrations';

-- ============================================================
-- End of migration
-- ============================================================
```
</details>

✅ Debe completar sin errores.

---

#### Migración 2: Core Tables

**Archivo:** `migrations/postgres/001_init.sql`

**Copy-paste TODO el contenido** en SQL Editor, luego **RUN**.

Esta migración crea:
- ✅ `touchbase_clubs`
- ✅ `touchbase_seasons`
- ✅ `touchbase_teams`
- ✅ `touchbase_roster` (con `user_id UUID` para Supabase)
- ✅ `touchbase_schedule`
- ✅ `touchbase_attendance`
- ✅ `touchbase_stats`
- ✅ Triggers para `updated_at`
- ✅ Data de ejemplo

---

#### Migración 3: Tenants & Branding (SUJETO10)

**Archivo:** `migrations/postgres/003_branding.sql`

**Copy-paste TODO el contenido** en SQL Editor, luego **RUN**.

Esta migración crea:
- ✅ `touchbase_tenants` con tenant **SUJETO10** pre-configurado
- ✅ `touchbase_tenant_sessions`
- ✅ `touchbase_tenant_analytics`
- ✅ Datos de SUJETO10:
  - Code: `sujeto10`
  - URL: `https://touchbase.sujeto10.com`
  - Features: tournaments, payments, AI, analytics enabled

---

#### Migración 4: Tournaments

**Archivo:** `migrations/postgres/004_tournaments.sql`

**Copy-paste TODO el contenido** en SQL Editor, luego **RUN**.

Esta migración crea:
- ✅ `touchbase_tournaments`
- ✅ `touchbase_tournament_teams`
- ✅ `touchbase_matches`
- ✅ VIEW `touchbase_standings` (cálculo automático)

---

#### Migración 5: Email Queue

**Archivo:** `migrations/postgres/005_email_queue.sql`

**Copy-paste TODO el contenido** en SQL Editor, luego **RUN**.

Crea: `touchbase_email_queue`

---

#### Migración 6: Billing

**Archivo:** `migrations/postgres/006_billing.sql`

**Copy-paste TODO el contenido** en SQL Editor, luego **RUN**.

Crea:
- ✅ `touchbase_billing_transactions`
- ✅ `touchbase_billing_config`

---

### Paso 4: Verificar Tablas Creadas

**Ejecuta en SQL Editor:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'touchbase_%'
ORDER BY table_name;
```

**Debes ver al menos estas 12 tablas:**
```
touchbase_attendance
touchbase_billing_config
touchbase_billing_transactions
touchbase_clubs
touchbase_email_queue
touchbase_matches
touchbase_migrations
touchbase_roster
touchbase_schedule
touchbase_seasons
touchbase_stats
touchbase_teams
touchbase_tenant_analytics
touchbase_tenant_sessions
touchbase_tenants
touchbase_tournament_teams
touchbase_tournaments
```

---

### Paso 5: Verificar Tenant SUJETO10

**Ejecuta:**

```sql
SELECT
    code,
    name,
    website_url,
    color_primary,
    color_secondary,
    features_enabled,
    is_active
FROM touchbase_tenants
WHERE code = 'sujeto10';
```

**Debe retornar:**
```
code: sujeto10
name: SUJETO10
website_url: https://touchbase.sujeto10.com
color_primary: #0ea5e9
color_secondary: #22c55e
features_enabled: {"tournaments": true, "payments": true, ...}
is_active: true
```

---

### Paso 6: Verificar VIEW de Standings

```sql
SELECT * FROM touchbase_standings LIMIT 1;
```

Debe ejecutarse sin errores (puede retornar vacío si no hay datos).

---

## ✅ Checklist de Verificación

Después de ejecutar las 6 migraciones:

- [ ] Sin errores de sintaxis
- [ ] 12+ tablas con prefijo `touchbase_`
- [ ] Tenant SUJETO10 existe en `touchbase_tenants`
- [ ] VIEW `touchbase_standings` funciona
- [ ] Función `update_updated_at_column()` existe
- [ ] 8+ triggers creados

---

## 🎯 Próximos Pasos (Después de Migraciones)

Una vez que las migraciones estén aplicadas:

### 1. Deploy a Vercel

```bash
cd /Users/nadalpiantini/Dev/chamilo-lms/chamilo-lms/plugin/touchbase_pack
vercel --prod
```

### 2. Configurar Environment Variables en Vercel

Ve a: Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

**Añade estas (Production):**

```
SUPABASE_URL=https://nqzhxukuvmdlpewqytpv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTk0MDksImV4cCI6MjA2MjIzNTQwOX0.9raKtf_MAUoZ7lUOek4lazhWTfmxPvufW1-al82UHmk
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY1OTQwOSwiZXhwIjoyMDYyMjM1NDA5fQ.KUbJb8fCHADnITIhr-x8R49_BsmicsYAzW9qG2YlTFA
SUPABASE_PROJECT_ID=nqzhxukuvmdlpewqytpv

DB_DRIVER=pgsql
DB_HOST=db.nqzhxukuvmdlpewqytpv.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.nqzhxukuvmdlpewqytpv
DB_PASS=[OBTENER_DE_SUPABASE_DASHBOARD]

APP_ENV=production
APP_URL=https://touchbase.sujeto10.com
BASE_PATH=/
DEFAULT_TENANT=sujeto10
DEFAULT_LANG=es
```

**Redeploy:**
```bash
vercel --prod
```

### 3. Añadir Dominio

Vercel → Settings → Domains → `touchbase.sujeto10.com`

### 4. Test

```bash
curl https://touchbase.sujeto10.com/api/health
```

---

## 📝 Resumen

- ✅ Migraciones PostgreSQL YA creadas en `migrations/postgres/`
- ✅ Todas con prefijo `touchbase_`
- ✅ Sintaxis PostgreSQL correcta (SERIAL, no UNSIGNED)
- ✅ Tenant SUJETO10 pre-configurado
- ⏳ Solo falta: Ejecutarlas en Supabase SQL Editor

**Siguiente:** Ejecuta las 6 migraciones del directorio `postgres/` en SQL Editor