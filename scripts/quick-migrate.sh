#!/bin/bash

# Script rápido para ejecutar la migración
# Intenta usar psql si está disponible y hay credenciales

MIGRATION_FILE="supabase/migrations/20251203205054_expand_players_teachers.sql"

echo "🚀 Ejecutando migración..."
echo ""

# Verificar si psql está disponible
if ! command -v psql &> /dev/null; then
    echo "❌ psql no está instalado"
    echo "📋 Por favor ejecuta la migración manualmente en el dashboard:"
    echo "   https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql/new"
    exit 1
fi

echo "✅ psql encontrado"
echo ""

# Intentar leer credenciales de variables de entorno o archivos
DB_PASSWORD=${DB_PASS:-${SUPABASE_DB_PASSWORD:-""}}

if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  No se encontró la contraseña de la base de datos"
    echo ""
    echo "📋 OPCIONES:"
    echo ""
    echo "1. Ejecutar manualmente en el dashboard:"
    echo "   https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql/new"
    echo ""
    echo "2. O proporciona la contraseña como variable de entorno:"
    echo "   export DB_PASS='tu_contraseña'"
    echo "   ./scripts/quick-migrate.sh"
    echo ""
    exit 1
fi

# Construir connection string
DB_HOST="db.nqzhxukuvmdlpewqytpv.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres.nqzhxukuvmdlpewqytpv"

CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "🔗 Conectando a Supabase..."
echo ""

# Ejecutar la migración
if psql "$CONNECTION_STRING" -f "$MIGRATION_FILE" -v ON_ERROR_STOP=1; then
    echo ""
    echo "✅ Migración ejecutada exitosamente!"
    echo ""
    echo "📊 Verificando tablas creadas..."
    psql "$CONNECTION_STRING" -c "\dt touchbase_teachers" 2>/dev/null && echo "✅ Tabla touchbase_teachers creada"
    psql "$CONNECTION_STRING" -c "\dt touchbase_budgets" 2>/dev/null && echo "✅ Tabla touchbase_budgets creada"
    psql "$CONNECTION_STRING" -c "\dt touchbase_placement_tests" 2>/dev/null && echo "✅ Tabla touchbase_placement_tests creada"
    echo ""
else
    echo ""
    echo "❌ Error al ejecutar la migración"
    echo "📋 Por favor ejecuta manualmente en el dashboard:"
    echo "   https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql/new"
    exit 1
fi

