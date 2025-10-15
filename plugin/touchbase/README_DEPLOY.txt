╔═══════════════════════════════════════════════════════════════╗
║                    TOUCHBASE - DEPLOY AHORA                   ║
╚═══════════════════════════════════════════════════════════════╝

TODO LISTO ✓ Solo necesitas ejecutar estas instrucciones:

═══════════════════════════════════════════════════════════════

PASO 1️⃣  APLICAR MIGRACIONES (2 minutos)

1. Abre este archivo en tu editor:
   👉 COPY_PASTE_THIS.sql

2. Selecciona TODO (Cmd+A)

3. Copia TODO (Cmd+C)

4. Abre Supabase SQL Editor:
   👉 https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql

5. Click "New query"

6. Pega TODO el SQL (Cmd+V)

7. Click botón verde "RUN"

8. Espera ~30 segundos

9. Debes ver "Success. No rows returned"

═══════════════════════════════════════════════════════════════

PASO 2️⃣  VERIFICAR (30 segundos)

En el mismo SQL Editor, ejecuta:

SELECT code, name, website_url FROM touchbase_tenants WHERE code = 'sujeto10';

Debe retornar:
code      | name     | website_url
sujeto10  | SUJETO10 | https://touchbase.sujeto10.com

═══════════════════════════════════════════════════════════════

PASO 3️⃣  DEPLOY A VERCEL (1 minuto)

cd /Users/nadalpiantini/Dev/chamilo-lms/chamilo-lms/plugin/touchbase
vercel --prod

═══════════════════════════════════════════════════════════════

PASO 4️⃣  CONFIGURAR ENV VARS EN VERCEL (2 minutos)

Ve a: Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

Añade estas (scope: Production):

SUPABASE_URL=https://nqzhxukuvmdlpewqytpv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTk0MDksImV4cCI6MjA2MjIzNTQwOX0.9raKtf_MAUoZ7lUOek4lazhWTfmxPvufW1-al82UHmk
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY1OTQwOSwiZXhwIjoyMDYyMjM1NDA5fQ.KUbJb8fCHADnITIhr-x8R49_BsmicsYAzW9qG2YlTFA
DB_DRIVER=pgsql
DB_HOST=db.nqzhxukuvmdlpewqytpv.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.nqzhxukuvmdlpewqytpv
APP_ENV=production
APP_URL=https://touchbase.sujeto10.com
DEFAULT_TENANT=sujeto10

IMPORTANTE: También añade DB_PASS
Obtén el password en: Supabase → Settings → Database

═══════════════════════════════════════════════════════════════

PASO 5️⃣  REDEPLOY (30 segundos)

vercel --prod

═══════════════════════════════════════════════════════════════

PASO 6️⃣  AÑADIR DOMINIO (1 minuto)

Vercel Dashboard → Settings → Domains
Añadir: touchbase.sujeto10.com

═══════════════════════════════════════════════════════════════

✅ VERIFICAR QUE FUNCIONA

curl https://touchbase.sujeto10.com/api/health

Debe retornar:
{
  "status": "ok",
  "service": "TouchBase API",
  "database": "pgsql",
  "supabase": "enabled"
}

═══════════════════════════════════════════════════════════════

🎉 LISTO! Tu app está en: https://touchbase.sujeto10.com

═══════════════════════════════════════════════════════════════

Archivos importantes:
✓ COPY_PASTE_THIS.sql        ← EL QUE DEBES EJECUTAR
✓ START_HERE.md              ← Guía completa
✓ vercel.json                ← Config de Vercel
✓ .env.production            ← Credenciales
✓ deploy/migrations_consolidated.sql ← Backup

═══════════════════════════════════════════════════════════════
