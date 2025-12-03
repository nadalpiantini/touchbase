# Instrucciones para Ejecutar la Migración

## Migración: Expand Players & Teachers Tables

La migración está lista en: `supabase/migrations/20251203205054_expand_players_teachers.sql`

### Opción 1: Usar Supabase Dashboard (Recomendado)

1. Ve a https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv
2. Navega a **SQL Editor**
3. Copia el contenido completo de `supabase/migrations/20251203205054_expand_players_teachers.sql`
4. Pega el SQL en el editor
5. Haz clic en **Run** para ejecutar

### Opción 2: Usar Supabase CLI (si tienes acceso)

```bash
cd /Users/nadalpiantini/Dev/touchbase
supabase db push --linked
```

### Qué hace esta migración:

1. **Expande la tabla `touchbase_players`** con:
   - Foto, teléfono, email, país
   - Afiliación, año de firma
   - Información familiar (JSONB)
   - Niveles académicos (académico, inglés, español, matemáticas, ciencias)
   - Notas

2. **Crea la tabla `touchbase_teachers`** con:
   - Información personal completa
   - Datos de empleo
   - Educación y certificaciones
   - Materias que enseña

3. **Crea tablas de presupuesto**:
   - `touchbase_budgets` - Presupuestos por categoría
   - `touchbase_expenses` - Gastos con aprobación

4. **Crea tablas de pruebas de colocación**:
   - `touchbase_placement_tests` - Pruebas
   - `touchbase_placement_test_results` - Resultados

5. **Crea tablas de vida estudiantil**:
   - `touchbase_wellness_programs` - Programas de bienestar
   - `touchbase_extracurricular_activities` - Actividades
   - `touchbase_activity_participants` - Participantes
   - `touchbase_personal_development_logs` - Logs de desarrollo

Todas las tablas incluyen:
- Índices para performance
- Row Level Security (RLS) habilitado
- Políticas de seguridad configuradas

