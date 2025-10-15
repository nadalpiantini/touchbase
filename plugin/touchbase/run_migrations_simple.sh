#!/bin/bash
# Simple migration runner for Sprint 2
# Executes SQL migrations directly

echo "🚀 TouchBase Sprint 2 - Migration Runner"
echo "=========================================="
echo ""

# Get database credentials from .env or use defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-chamilo}
DB_USER=${DB_USER:-root}

# Function to run a migration
run_migration() {
    local file=$1
    local description=$2

    echo "📄 Running: $file"
    echo "   → $description"

    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < "migrations/$file" 2>/dev/null; then
        echo "   ✅ Success"
    else
        echo "   ❌ Failed (check if already applied or database credentials)"
    fi
    echo ""
}

# Sprint 2 migrations
run_migration "002_branding.sql" "Multi-tenant branding system"
run_migration "005_email_queue.sql" "Email notification queue"
run_migration "006_billing.sql" "Billing and payments"

# Verify tables
echo "🔍 Verifying tables..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" -e "
    SELECT
        CASE
            WHEN COUNT(*) > 0 THEN '✅ pelota_tenants'
            ELSE '❌ pelota_tenants not found'
        END as status
    FROM information_schema.tables
    WHERE table_schema = '$DB_NAME' AND table_name = 'pelota_tenants'
    UNION ALL
    SELECT
        CASE
            WHEN COUNT(*) > 0 THEN '✅ pelota_email_queue'
            ELSE '❌ pelota_email_queue not found'
        END
    FROM information_schema.tables
    WHERE table_schema = '$DB_NAME' AND table_name = 'pelota_email_queue'
    UNION ALL
    SELECT
        CASE
            WHEN COUNT(*) > 0 THEN '✅ pelota_billing_transactions'
            ELSE '❌ pelota_billing_transactions not found'
        END
    FROM information_schema.tables
    WHERE table_schema = '$DB_NAME' AND table_name = 'pelota_billing_transactions'
" 2>/dev/null

echo ""
echo "✅ Sprint 2 migrations complete!"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost/pelota/ai/assistant"
echo "2. Test API endpoints"
echo "3. Configure AWS/Stripe credentials (optional)"
