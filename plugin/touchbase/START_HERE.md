# 🚀 TouchBase - EMPIEZA AQUÍ

**Deploy a: touchbase.sujeto10.com**

---

## ⚡ MÉTODO RÁPIDO (5 minutos)

### Paso 1: Abrir Supabase SQL Editor

Click aquí: **https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql/new**

### Paso 2: Copy-Paste el Archivo Consolidado

1. Abre en tu editor: `deploy/migrations_consolidated.sql`
2. **Copy TODO** el contenido (899 líneas)
3. **Paste** en Supabase SQL Editor
4. Click **"RUN"** (botón verde)
5. Espera ~30 segundos

✅ Esto aplica las 6 migraciones de una vez.

### Paso 3: Verificar

**En el mismo SQL Editor, ejecuta:**

```sql
-- Ver tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'touchbase_%'
ORDER BY table_name;
```

**Debes ver 12+ tablas:**
- touchbase_attendance
- touchbase_billing_config
- touchbase_billing_transactions
- touchbase_clubs
- touchbase_email_queue
- touchbase_matches
- touchbase_migrations
- touchbase_roster
- touchbase_schedule
- touchbase_seasons
- touchbase_stats
- touchbase_teams
- touchbase_tenant_analytics
- touchbase_tenant_sessions
- touchbase_tenants
- touchbase_tournament_teams
- touchbase_tournaments

**Verificar tenant SUJETO10:**

```sql
SELECT code, name, website_url, color_primary, features_enabled
FROM touchbase_tenants
WHERE code = 'sujeto10';
```

**Debe retornar:**
```
code: sujeto10
name: SUJETO10
website_url: https://touchbase.sujeto10.com
color_primary: #0ea5e9
features_enabled: {"tournaments": true, "payments": true, "ai_assistant": true, "analytics": true}
```

---

## 🚀 Deploy a Vercel

### Paso 1: Get Database Password

1. Ve a: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/settings/database
2. En "Database Settings" busca **"Database password"**
3. Si no lo ves, click **"Reset database password"**
4. **Copia el password** (NO es el project ID)

### Paso 2: Deploy

```bash
cd /Users/nadalpiantini/Dev/chamilo-lms/chamilo-lms/plugin/touchbase

# Deploy a Vercel
vercel --prod
```

### Paso 3: Configurar Environment Variables en Vercel

Ve a: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

**Añade estas (scope: Production):**

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
DB_PASS=[PASTE_PASSWORD_FROM_STEP_1]

APP_ENV=production
APP_URL=https://touchbase.sujeto10.com
BASE_PATH=/
DEBUG=false

DEFAULT_TENANT=sujeto10
DEFAULT_LANG=es
TIMEZONE=America/Santo_Domingo
```

**Importante:** Reemplaza `[PASTE_PASSWORD_FROM_STEP_1]` con el password real.

### Paso 4: Redeploy

```bash
vercel --prod
```

### Paso 5: Añadir Dominio

**Vercel Dashboard → Settings → Domains → Add Domain:**
```
touchbase.sujeto10.com
```

Configura el DNS CNAME como te indique Vercel.

### Paso 6: Test

```bash
curl https://touchbase.sujeto10.com/api/health
```

**Debe retornar:**
```json
{
  "status": "ok",
  "service": "TouchBase API",
  "version": "1.0.0",
  "environment": "production",
  "database": "pgsql",
  "supabase": "enabled"
}
```

---

## ✅ Checklist Final

- [ ] Ejecutar migrations_consolidated.sql en Supabase
- [ ] Ver 17+ tablas con prefijo touchbase_
- [ ] Verificar tenant SUJETO10 existe
- [ ] Obtener database password de Supabase
- [ ] Deploy a Vercel: `vercel --prod`
- [ ] Configurar env vars en Vercel
- [ ] Redeploy: `vercel --prod`
- [ ] Añadir dominio touchbase.sujeto10.com
- [ ] Test health check

---

## 📁 Archivos Clave

| Archivo | Para Qué |
|---------|----------|
| **deploy/migrations_consolidated.sql** | ÚSALO - Todas las migraciones en 1 archivo |
| **START_HERE.md** | Este archivo |
| **APPLY_MIGRATIONS.md** | Instrucciones detalladas |
| **.env.production** | Config de producción |
| **vercel.json** | Config de Vercel |

---

## 🎯 Resumen

**Estado actual:**
- ✅ Código 100% listo (namespace TouchBase, prefijos touchbase_)
- ✅ 6 migraciones PostgreSQL listas
- ✅ Archivo consolidado creado (899 líneas)
- ✅ SUJETO10 tenant pre-configurado en migración 003
- ⏳ Pendiente: Ejecutar SQL en Supabase

**Siguiente:** Abre `deploy/migrations_consolidated.sql` y ejecútalo en Supabase SQL Editor.

**Tiempo total:** ~5 minutos
