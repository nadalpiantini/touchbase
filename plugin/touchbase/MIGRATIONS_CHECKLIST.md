# ✅ Checklist de Migraciones - TouchBase

**Dominio:** touchbase.sujeto10.com
**Prefijo de tablas:** `touchbase_`
**Backend:** Supabase PostgreSQL

---

## 📍 PASO 1: Limpiar Tablas (si ya ejecutaste algo)

**URL:** https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql/new

**Copy-paste y RUN:**

```sql
-- Limpiar tablas anteriores (si las hay)
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

-- Limpiar tipos ENUM
DROP TYPE IF EXISTS touchbase_event_type CASCADE;
DROP TYPE IF EXISTS touchbase_attendance_status CASCADE;
DROP TYPE IF EXISTS touchbase_theme_mode CASCADE;
DROP TYPE IF EXISTS touchbase_tournament_format CASCADE;
DROP TYPE IF EXISTS touchbase_tournament_status CASCADE;
DROP TYPE IF EXISTS touchbase_match_status CASCADE;
DROP TYPE IF EXISTS touchbase_email_status CASCADE;
DROP TYPE IF EXISTS touchbase_payment_status CASCADE;
```

✅ Click **RUN** → Debe completar sin errores (o decir "does not exist" si no existían)

---

## 📍 PASO 2: Migración 1 - Tracking Table

**Archivo a abrir:** `migrations/postgres/000_migrations_table.sql`

1. Abre el archivo en tu editor
2. Copy TODO el contenido
3. Pega en Supabase SQL Editor (nueva query)
4. Click **RUN**

✅ Crea: `touchbase_migrations`

---

## 📍 PASO 3: Migración 2 - Core Tables

**Archivo:** `migrations/postgres/001_init.sql`

1. Abre el archivo
2. Copy TODO el contenido (220 líneas)
3. Pega en SQL Editor (nueva query)
4. Click **RUN**

✅ Crea:
- `touchbase_clubs`
- `touchbase_seasons`
- `touchbase_teams`
- `touchbase_roster`
- `touchbase_schedule`
- `touchbase_attendance`
- `touchbase_stats`
- Triggers para updated_at
- Demo club y season

---

## 📍 PASO 4: Migración 3 - Tenants + SUJETO10

**Archivo:** `migrations/postgres/003_branding.sql`

1. Abre el archivo
2. Copy TODO el contenido (249 líneas)
3. Pega en SQL Editor
4. Click **RUN**

✅ Crea:
- `touchbase_tenants` ← **INCLUYE TENANT SUJETO10**
- `touchbase_tenant_sessions`
- `touchbase_tenant_analytics`

**Verifica inmediatamente:**
```sql
SELECT code, name, website_url FROM touchbase_tenants WHERE code = 'sujeto10';
```

Debe retornar:
```
code: sujeto10
name: SUJETO10
website_url: https://touchbase.sujeto10.com
```

---

## 📍 PASO 5: Migración 4 - Tournaments

**Archivo:** `migrations/postgres/004_tournaments.sql`

1. Abre el archivo
2. Copy TODO
3. Pega en SQL Editor
4. Click **RUN**

✅ Crea:
- `touchbase_tournaments`
- `touchbase_tournament_teams`
- `touchbase_matches`
- VIEW `touchbase_standings`

---

## 📍 PASO 6: Migración 5 - Email Queue

**Archivo:** `migrations/postgres/005_email_queue.sql`

1. Abre el archivo
2. Copy TODO
3. Pega en SQL Editor
4. Click **RUN**

✅ Crea: `touchbase_email_queue`

---

## 📍 PASO 7: Migración 6 - Billing

**Archivo:** `migrations/postgres/006_billing.sql`

1. Abre el archivo
2. Copy TODO
3. Pega en SQL Editor
4. Click **RUN**

✅ Crea:
- `touchbase_billing_transactions`
- `touchbase_billing_config`

---

## 📍 PASO 8: Verificación Final

**Ejecuta en SQL Editor:**

```sql
-- Ver todas las tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'touchbase_%'
ORDER BY table_name;
```

**Debe mostrar al menos 17 tablas:**
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

**Verificar tenant SUJETO10:**

```sql
SELECT
    code,
    name,
    website_url,
    color_primary,
    color_secondary,
    color_accent,
    theme_mode,
    features_enabled,
    timezone,
    locale,
    is_active
FROM touchbase_tenants
WHERE code = 'sujeto10';
```

**Resultado esperado:**
```json
{
  "code": "sujeto10",
  "name": "SUJETO10",
  "website_url": "https://touchbase.sujeto10.com",
  "color_primary": "#0ea5e9",
  "color_secondary": "#22c55e",
  "color_accent": "#f59e0b",
  "theme_mode": "dark",
  "features_enabled": {"tournaments": true, "notifications": true, "payments": true, "ai_assistant": true, "analytics": true},
  "timezone": "America/Santo_Domingo",
  "locale": "es_DO",
  "is_active": true
}
```

---

## 🚀 SIGUIENTE: Deploy a Vercel

Una vez verificado que todo está OK:

```bash
cd /Users/nadalpiantini/Dev/chamilo-lms/chamilo-lms/plugin/touchbase

# Deploy
vercel --prod
```

Luego configurar env vars en Vercel y añadir dominio.

Ver: `DEPLOY.md` para instrucciones completas.

---

## 🆘 Si Hay Errores

### "Syntax error"
- Verifica que estás usando archivos de `migrations/postgres/` (NO `migrations/`)
- Verifica que copiaste TODO el contenido del archivo

### "Relation does not exist"
- Ejecuta las migraciones EN ORDEN (000 → 001 → 003 → 004 → 005 → 006)
- No te saltes ninguna

### "Already exists"
- Normal si re-ejecutas
- Continúa con la siguiente migración

---

**Archivos correctos:** `migrations/postgres/*.sql`
**Prefijo:** `touchbase_`
**Dominio:** touchbase.sujeto10.com
**Tenant:** SUJETO10
