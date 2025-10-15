╔═══════════════════════════════════════════════════════════════╗
║           TOUCHBASE - EJECUTA SOLO ESTE ARCHIVO               ║
╚═══════════════════════════════════════════════════════════════╝

✅ ARCHIVO FINAL: FINAL_IDEMPOTENT.sql

Este archivo:
✓ Se puede ejecutar MÚLTIPLES veces sin errores
✓ SOLO afecta objetos con prefijo touchbase_
✓ NO toca otras apps en Supabase
✓ Maneja automáticamente objetos existentes
✓ 596 líneas de SQL PostgreSQL válido

═══════════════════════════════════════════════════════════════
EJECUTA ESTO AHORA:
═══════════════════════════════════════════════════════════════

1. Abre en tu editor: FINAL_IDEMPOTENT.sql

2. Select All (Cmd+A)

3. Copy (Cmd+C)

4. Abre: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql

5. Click "New query"

6. Paste (Cmd+V)

7. Click "RUN"

8. Espera ~30 segundos

9. Ignora warnings sobre "already exists" - es normal y seguro

═══════════════════════════════════════════════════════════════
VERIFICAR:
═══════════════════════════════════════════════════════════════

Ejecuta esto en SQL Editor:

SELECT code, name, website_url, features_enabled
FROM touchbase_tenants
WHERE code = 'sujeto10';

Debe retornar:
  code: sujeto10
  name: SUJETO10
  website_url: https://touchbase.sujeto10.com
  features_enabled: {...todos habilitados...}

═══════════════════════════════════════════════════════════════
SIGUIENTE: DEPLOY
═══════════════════════════════════════════════════════════════

cd /Users/nadalpiantini/Dev/chamilo-lms/chamilo-lms/plugin/touchbase
vercel --prod

Luego configura env vars (ver START_HERE.md)

═══════════════════════════════════════════════════════════════

Archivos importantes:
  → FINAL_IDEMPOTENT.sql   ← EJECUTA ESTE
  → START_HERE.md          ← Guía de deploy completa
  → vercel.json            ← Config de Vercel
  → .env.production        ← Credenciales

═══════════════════════════════════════════════════════════════
