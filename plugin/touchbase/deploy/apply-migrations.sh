#!/bin/bash

# ============================================================
# TouchBase - Apply Database Migrations to Supabase
# ============================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/migrations/postgres"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         TouchBase - Supabase Migration Tool                  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.production exists
if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
    echo -e "${RED}✗${NC} .env.production not found!"
    echo -e "${YELLOW}  Create it from .env.example or check the path${NC}"
    exit 1
fi

# Load environment variables
export $(cat "$PROJECT_ROOT/.env.production" | grep -v '^#' | xargs)

echo -e "${BLUE}[1/5]${NC} Verifying Supabase connection..."

# Extract connection details
PGHOST="$DB_HOST"
PGPORT="$DB_PORT"
PGDATABASE="$DB_NAME"
PGUSER="$DB_USER"
PGPASSWORD="$DB_PASS"

export PGHOST PGPORT PGDATABASE PGUSER PGPASSWORD

# Test connection
if psql -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Connected to Supabase PostgreSQL"
else
    echo -e "${RED}✗${NC} Cannot connect to Supabase"
    echo -e "${YELLOW}  Host: $PGHOST${NC}"
    echo -e "${YELLOW}  Port: $PGPORT${NC}"
    echo -e "${YELLOW}  Database: $PGDATABASE${NC}"
    echo -e "${YELLOW}  User: $PGUSER${NC}"
    exit 1
fi

echo -e "${BLUE}[2/5]${NC} Checking migrations directory..."

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}✗${NC} Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✓${NC} Found $MIGRATION_COUNT migration files"

echo -e "${BLUE}[3/5]${NC} Applying migrations..."

# Sort and apply migrations
APPLIED_COUNT=0
FAILED_COUNT=0

for migration_file in $(ls -1 "$MIGRATIONS_DIR"/*.sql | sort); do
    filename=$(basename "$migration_file")
    echo -e "  ${BLUE}→${NC} Applying $filename..."

    if psql -v ON_ERROR_STOP=1 -f "$migration_file" > /dev/null 2>&1; then
        echo -e "    ${GREEN}✓${NC} $filename applied successfully"
        ((APPLIED_COUNT++))

        # Record migration in tracking table
        psql -v ON_ERROR_STOP=1 -c "
            INSERT INTO touchbase_migrations (migration_name, batch)
            VALUES ('$filename', 1)
            ON CONFLICT (migration_name) DO NOTHING;
        " > /dev/null 2>&1 || true
    else
        echo -e "    ${YELLOW}⚠${NC} $filename may already be applied or failed"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo -e "${GREEN}✓${NC} Migrations completed:"
echo -e "  ${GREEN}Applied: $APPLIED_COUNT${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "  ${YELLOW}Skipped/Failed: $FAILED_COUNT${NC}"
fi

echo -e "${BLUE}[4/5]${NC} Verifying tables..."

# Check critical tables
TABLES_TO_CHECK=(
    "touchbase_clubs"
    "touchbase_seasons"
    "touchbase_teams"
    "touchbase_roster"
    "touchbase_schedule"
    "touchbase_attendance"
    "touchbase_stats"
    "touchbase_tenants"
    "touchbase_tournaments"
)

MISSING_TABLES=0

for table in "${TABLES_TO_CHECK[@]}"; do
    if psql -c "\dt $table" | grep -q "$table"; then
        echo -e "  ${GREEN}✓${NC} $table exists"
    else
        echo -e "  ${RED}✗${NC} $table is missing"
        ((MISSING_TABLES++))
    fi
done

if [ $MISSING_TABLES -gt 0 ]; then
    echo -e "${RED}✗${NC} $MISSING_TABLES tables are missing!"
    echo -e "${YELLOW}  Review migration output for errors${NC}"
    exit 1
fi

echo -e "${BLUE}[5/5]${NC} Verifying SUJETO10 tenant..."

# Check if SUJETO10 tenant exists
TENANT_EXISTS=$(psql -t -c "SELECT COUNT(*) FROM touchbase_tenants WHERE code = 'sujeto10';" | xargs)

if [ "$TENANT_EXISTS" -eq "0" ]; then
    echo -e "  ${YELLOW}⚠${NC} SUJETO10 tenant not found, creating..."

    psql -c "
        INSERT INTO touchbase_tenants (
            code,
            name,
            color_primary,
            color_secondary,
            color_accent,
            color_danger,
            theme_mode,
            website_url,
            email,
            timezone,
            locale,
            features_enabled,
            is_active
        ) VALUES (
            'sujeto10',
            'SUJETO10',
            '#0ea5e9',
            '#22c55e',
            '#f59e0b',
            '#ef4444',
            'dark',
            'https://touchbase.sujeto10.com',
            'info@sujeto10.com',
            'America/Santo_Domingo',
            'es_DO',
            '{\"tournaments\": true, \"notifications\": true, \"payments\": true, \"ai_assistant\": true}'::jsonb,
            TRUE
        )
        ON CONFLICT (code) DO NOTHING;
    " > /dev/null 2>&1

    echo -e "  ${GREEN}✓${NC} SUJETO10 tenant created"
else
    echo -e "  ${GREEN}✓${NC} SUJETO10 tenant already exists"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Migration Completed Successfully                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Deploy application to Vercel/Railway"
echo -e "  2. Configure domain: touchbase.sujeto10.com"
echo -e "  3. Test endpoints: https://touchbase.sujeto10.com/api/health"
echo ""
