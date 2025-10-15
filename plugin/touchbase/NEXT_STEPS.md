# 🚀 TouchBase - NEXT STEPS (Ejecuta Esto Ahora)

Todo el código está listo. Solo necesitas ejecutar estos comandos.

---

## ⚡ Opción RÁPIDA (SQL Editor de Supabase) - 10 minutos

### 1. Ve a Supabase SQL Editor

https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql

### 2. Ejecuta estas migraciones EN ORDEN (copy-paste cada una):

**Migración 1: Tracking Table**
```bash
# Abre en tu editor de código:
plugin/touchbase/migrations/postgres/000_migrations_table.sql

# Copy todo el contenido
# Pega en Supabase SQL Editor
# Click "RUN"
```

**Migración 2: Core Tables**
```bash
# Abre: plugin/touchbase/migrations/postgres/001_init.sql
# Copy todo, pega en SQL Editor, RUN
```

**Migración 3: Tenants & Branding**
```bash
# Abre: plugin/touchbase/migrations/postgres/003_branding.sql
# Copy todo, pega en SQL Editor, RUN
# ✅ Esto crea el tenant SUJETO10 automáticamente
```

**Migración 4: Tournaments**
```bash
# Abre: plugin/touchbase/migrations/postgres/004_tournaments.sql
# Copy todo, pega en SQL Editor, RUN
```

**Migración 5: Email Queue**
```bash
# Abre: plugin/touchbase/migrations/postgres/005_email_queue.sql
# Copy todo, pega en SQL Editor, RUN
```

**Migración 6: Billing**
```bash
# Abre: plugin/touchbase/migrations/postgres/006_billing.sql
# Copy todo, pega en SQL Editor, RUN
```

### 3. Verificar Tablas Creadas

En Supabase → Table Editor, deberías ver:

✅ `touchbase_clubs`
✅ `touchbase_seasons`
✅ `touchbase_teams`
✅ `touchbase_roster`
✅ `touchbase_schedule`
✅ `touchbase_attendance`
✅ `touchbase_stats`
✅ `touchbase_tenants` ← **Contiene SUJETO10**
✅ `touchbase_tournaments`
✅ `touchbase_matches`

### 4. Verificar Tenant SUJETO10

En SQL Editor, ejecuta:
```sql
SELECT code, name, color_primary, features_enabled
FROM touchbase_tenants
WHERE code = 'sujeto10';
```

Debe retornar:
```
code: sujeto10
name: SUJETO10
color_primary: #0ea5e9
features_enabled: {"tournaments": true, "payments": true, ...}
```

---

## 🚀 Deploy a Vercel

### 1. Obtener Database Password de Supabase

1. Ve a: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/settings/database
2. Busca "Database password" o "Connection pooling"
3. Copia el password (NO es el project ID)
4. Guárdalo para el siguiente paso

### 2. Deploy

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Navegar al plugin
cd /Users/nadalpiantini/Dev/chamilo-lms/chamilo-lms/plugin/touchbase

# Deploy
vercel --prod
```

### 3. Configurar Environment Variables en Vercel

Después del deploy, ve a: Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

**Añade estas variables (Production):**

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
DB_PASS=[PASTE_THE_PASSWORD_FROM_STEP_1_HERE]

APP_ENV=production
APP_URL=https://touchbase.sujeto10.com
BASE_PATH=/
DEBUG=false

DEFAULT_TENANT=sujeto10
DEFAULT_LANG=es
TIMEZONE=America/Santo_Domingo
```

**IMPORTANTE:** Usa el password que obtuviste en el paso 1, NO el project ID.

### 4. Redeploy (para que tome las nuevas env vars)

```bash
vercel --prod
```

### 5. Añadir Dominio

Vercel Dashboard → Settings → Domains → Add Domain:
```
touchbase.sujeto10.com
```

Configura el DNS CNAME como te indique Vercel.

---

## ✅ Verificar que Funciona

Una vez deployado:

```bash
# Health check
curl https://touchbase.sujeto10.com/api/health

# Debe retornar:
{
  "status": "ok",
  "service": "TouchBase API",
  "database": "pgsql",
  "supabase": "enabled"
}
```

---

## 📋 Checklist Final

- [ ] Obtener database password de Supabase Dashboard
- [ ] Aplicar 6 migraciones vía SQL Editor (copy-paste)
- [ ] Verificar tenant SUJETO10 existe
- [ ] Deploy a Vercel: `vercel --prod`
- [ ] Configurar env vars en Vercel
- [ ] Redeploy: `vercel --prod`
- [ ] Añadir dominio touchbase.sujeto10.com
- [ ] Test health: `curl https://touchbase.sujeto10.com/api/health`

---

## 🆘 Si Tienes Problemas

1. **"Database password incorrect"**
   - Resetear password en Supabase → Settings → Database
   - Actualizar DB_PASS en Vercel env vars
   - Redeploy

2. **"Table already exists"**
   - Normal, significa que la migración ya se aplicó
   - Continúa con la siguiente

3. **"404 Not Found"**
   - Verificar que vercel.json está en el deploy
   - Verificar rutas en Vercel logs

---

**Archivos listos:**
- ✅ 6 migraciones PostgreSQL con prefijo `touchbase_`
- ✅ Database layer con soporte PostgreSQL
- ✅ Auth con Supabase
- ✅ Scripts de deploy
- ✅ Configuración Vercel
- ✅ Documentación completa

**Lo que TÚ debes hacer:**
1. Ejecutar migraciones en Supabase SQL Editor
2. Deploy a Vercel
3. Configurar env vars
4. Listo! 🎉
