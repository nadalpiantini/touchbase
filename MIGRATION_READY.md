# ✅ Migración Lista para Ejecutar

## 📍 Ubicación del archivo
`supabase/migrations/20251203205054_expand_players_teachers.sql`

## 🚀 Ejecutar en Supabase Dashboard

### Pasos:

1. **Abre el Dashboard:**
   ```
   https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv
   ```

2. **Ve a SQL Editor:**
   - Menú lateral → "SQL Editor"

3. **Copia el SQL completo:**
   ```bash
   # Desde la terminal:
   cat supabase/migrations/20251203205054_expand_players_teachers.sql
   ```
   
   O abre el archivo directamente:
   ```
   supabase/migrations/20251203205054_expand_players_teachers.sql
   ```

4. **Pega y ejecuta:**
   - Pega todo el contenido en el editor SQL
   - Haz clic en **"Run"** o presiona `Cmd/Ctrl + Enter`

## ✅ Verificar ejecución exitosa

Después de ejecutar, verifica en el SQL Editor:

```sql
-- Verificar que las nuevas columnas existen en players
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'touchbase_players' 
  AND column_name IN ('photo_url', 'phone', 'email', 'academic_level', 'family_info');

-- Verificar que la tabla teachers existe
SELECT COUNT(*) FROM touchbase_teachers;

-- Verificar que la tabla budgets existe
SELECT COUNT(*) FROM touchbase_budgets;

-- Verificar que la tabla placement_tests existe
SELECT COUNT(*) FROM touchbase_placement_tests;
```

## 📊 Qué crea esta migración

### 1. Expande `touchbase_players`:
- ✅ photo_url, phone, email, country
- ✅ affiliate, signing_year
- ✅ family_info (JSONB)
- ✅ academic_level, english_level, spanish_level, math_level, science_level
- ✅ notes

### 2. Crea `touchbase_teachers`:
- ✅ Información personal completa
- ✅ Datos de empleo
- ✅ Educación y certificaciones
- ✅ Materias que enseña

### 3. Crea sistema de presupuesto:
- ✅ `touchbase_budgets` - Presupuestos por categoría
- ✅ `touchbase_expenses` - Gastos con aprobación

### 4. Crea sistema de pruebas:
- ✅ `touchbase_placement_tests` - Pruebas de colocación
- ✅ `touchbase_placement_test_results` - Resultados

### 5. Crea sistema de vida estudiantil:
- ✅ `touchbase_wellness_programs` - Programas de bienestar
- ✅ `touchbase_extracurricular_activities` - Actividades
- ✅ `touchbase_activity_participants` - Participantes
- ✅ `touchbase_personal_development_logs` - Logs

## 🔒 Seguridad

Todas las tablas incluyen:
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de seguridad configuradas
- ✅ Índices para performance

## ⚠️ Nota

La migración es **idempotente** - usa `IF NOT EXISTS` y `ADD COLUMN IF NOT EXISTS`, por lo que puedes ejecutarla múltiples veces sin problemas.

