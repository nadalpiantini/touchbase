#!/bin/bash

# Script para ejecutar la migración de expand_players_teachers
# Usa Supabase CLI para ejecutar el SQL directamente

set -e

MIGRATION_FILE="supabase/migrations/20251203205054_expand_players_teachers.sql"

echo "🚀 Ejecutando migración: expand_players_teachers"
echo ""

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: No se encontró el archivo de migración: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Archivo de migración encontrado"
echo ""

# Intentar ejecutar usando Supabase CLI
echo "Intentando ejecutar con Supabase CLI..."
echo ""

# Leer el SQL del archivo
SQL_CONTENT=$(cat "$MIGRATION_FILE")

# Usar supabase db execute si está disponible, o mostrar instrucciones
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI encontrado"
    echo ""
    echo "Ejecutando migración..."
    echo ""
    
    # Intentar con db push incluyendo todas las migraciones
    supabase db push --linked --include-all --yes 2>&1 || {
        echo ""
        echo "⚠️  No se pudo ejecutar automáticamente con db push"
        echo ""
        echo "📋 INSTRUCCIONES MANUALES:"
        echo ""
        echo "1. Ve a: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv"
        echo "2. Navega a SQL Editor"
        echo "3. Copia y pega el contenido de: $MIGRATION_FILE"
        echo "4. Haz clic en 'Run'"
        echo ""
        echo "O ejecuta manualmente con psql:"
        echo "psql 'postgresql://postgres:[PASSWORD]@db.nqzhxukuvmdlpewqytpv.supabase.co:5432/postgres' -f $MIGRATION_FILE"
        echo ""
    }
else
    echo "❌ Supabase CLI no encontrado"
    echo ""
    echo "📋 INSTRUCCIONES MANUALES:"
    echo ""
    echo "1. Ve a: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv"
    echo "2. Navega a SQL Editor"
    echo "3. Copia y pega el contenido de: $MIGRATION_FILE"
    echo "4. Haz clic en 'Run'"
    echo ""
fi

