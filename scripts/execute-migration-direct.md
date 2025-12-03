# Ejecutar Migración Directamente

## Método más rápido: Supabase Dashboard

1. **Abre el Dashboard:**
   - https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv

2. **Ve a SQL Editor:**
   - En el menú lateral, haz clic en "SQL Editor"

3. **Copia el SQL:**
   ```bash
   cat supabase/migrations/20251203205054_expand_players_teachers.sql
   ```

4. **Pega y ejecuta:**
   - Pega el contenido completo en el editor
   - Haz clic en "Run" o presiona Cmd/Ctrl + Enter

## Verificar que funcionó

Después de ejecutar, verifica que las tablas se crearon:

```sql
-- Verificar tabla de teachers
SELECT * FROM touchbase_teachers LIMIT 1;

-- Verificar tabla de budgets
SELECT * FROM touchbase_budgets LIMIT 1;

-- Verificar columnas nuevas en players
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'touchbase_players' 
  AND column_name IN ('photo_url', 'phone', 'email', 'academic_level');
```

## Si hay errores

Si encuentras errores como "relation already exists", significa que algunas partes ya están aplicadas. Esto es normal con `CREATE TABLE IF NOT EXISTS` y `ADD COLUMN IF NOT EXISTS`.

La migración es **idempotente** - puedes ejecutarla múltiples veces sin problemas.

