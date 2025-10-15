#!/bin/bash
# TouchBase Sprint 2 - Local Deployment Script
# Validates prerequisites and deploys locally

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         TouchBase Sprint 2 - Local Deploy                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo "🔍 Step 1/6: Checking Prerequisites..."
echo ""

HAS_PHP=false
HAS_MYSQL=false
HAS_DOCKER=false

# Check PHP
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1 | cut -d ' ' -f 2)
    echo -e "  ${GREEN}✅${NC} PHP installed: $PHP_VERSION"
    HAS_PHP=true
else
    echo -e "  ${RED}❌${NC} PHP not found"
fi

# Check MySQL/MariaDB
if command -v mysql &> /dev/null; then
    echo -e "  ${GREEN}✅${NC} MySQL client found"
    HAS_MYSQL=true
elif pgrep -x mysqld > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} MySQL server running (no client)"
    HAS_MYSQL=true
else
    echo -e "  ${YELLOW}⚠️${NC}  MySQL not found"
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo -e "  ${GREEN}✅${NC} Docker installed"
    HAS_DOCKER=true
else
    echo -e "  ${YELLOW}⚠️${NC}  Docker not found"
fi

echo ""

# Validate minimum requirements
if [ "$HAS_PHP" = false ]; then
    echo -e "${RED}❌ ERROR: PHP is required${NC}"
    echo "   Install PHP 8.2+ from https://www.php.net/downloads"
    exit 1
fi

if [ "$HAS_MYSQL" = false ] && [ "$HAS_DOCKER" = false ]; then
    echo -e "${RED}❌ ERROR: Database required${NC}"
    echo "   Option 1: Install MySQL/MariaDB"
    echo "   Option 2: Install Docker Desktop"
    echo ""
    echo "   MySQL:  https://dev.mysql.com/downloads/mysql/"
    echo "   Docker: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Step 2: Check Database Connection
echo "🔗 Step 2/6: Checking Database Connection..."
echo ""

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-chamilo}
DB_USER=${DB_USER:-root}

# Try to connect using PHP PDO
php -r "
try {
    \$pdo = new PDO('mysql:host=${DB_HOST};port=${DB_PORT}', '${DB_USER}', '');
    echo '  ✅ Database server is accessible\n';
    exit(0);
} catch (PDOException \$e) {
    echo '  ❌ Cannot connect to database: ' . \$e->getMessage() . \"\n\";
    exit(1);
}
" 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Database not accessible${NC}"
    echo ""
    echo "   To fix:"
    if [ "$HAS_DOCKER" = true ]; then
        echo "   1. Start Docker Desktop"
        echo "   2. Run: docker compose up -d (in project root)"
        echo "   3. Wait 30 seconds for database to initialize"
    else
        echo "   1. Start MySQL: mysql.server start (or brew services start mysql)"
        echo "   2. Create database: mysql -u root -e 'CREATE DATABASE IF NOT EXISTS chamilo'"
    fi
    echo ""
    read -p "   Press Enter once database is ready, or Ctrl+C to exit..."
fi

echo ""

# Step 3: Verify Sprint 2 Files
echo "📁 Step 3/6: Verifying Sprint 2 Files..."
echo ""

FILES_TO_CHECK=(
    "src/Controllers/AIController.php"
    "src/Controllers/NotifyController.php"
    "src/Controllers/BillingController.php"
    "src/AI/LLMProvider.php"
    "src/AI/DeepSeekBedrock.php"
    "src/AI/CoachAssistant.php"
    "migrations/002_branding.sql"
    "migrations/005_email_queue.sql"
    "migrations/006_billing.sql"
    "views/app_layout.php"
    "views/assistant.php"
)

MISSING_FILES=0
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $file"
    else
        echo -e "  ${RED}❌${NC} $file (missing)"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ $MISSING_FILES files missing${NC}"
    exit 1
fi

echo ""

# Step 4: Run Composer Autoload
echo "📦 Step 4/6: Generating Composer Autoload..."
echo ""

if command -v composer &> /dev/null; then
    composer dump-autoload --quiet
    echo -e "  ${GREEN}✅${NC} Autoload generated"
else
    echo -e "  ${YELLOW}⚠️${NC}  Composer not found (autoload may fail)"
fi

echo ""

# Step 5: Run Migrations
echo "🗄️  Step 5/6: Running Database Migrations..."
echo ""

php run_migrations.php

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅${NC} Migrations completed"
else
    echo -e "  ${RED}❌${NC} Migrations failed"
    echo ""
    echo "   Check error messages above and verify:"
    echo "   - Database is running"
    echo "   - Database credentials in .env"
    echo "   - User has CREATE/ALTER permissions"
    exit 1
fi

echo ""

# Step 6: Success
echo "✅ Step 6/6: Deployment Complete!"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          🎉 Sprint 2 Deployed Successfully! 🎉            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Next steps:"
echo ""
echo "   1. Open UI:"
echo "      → http://localhost/pelota/ai/assistant"
echo ""
echo "   2. Test API:"
echo "      → curl http://localhost/pelota/api/health | jq"
echo "      → curl http://localhost/pelota/api/ai/suggestions | jq"
echo ""
echo "   3. Configure credentials (optional):"
echo "      → Edit .env with AWS_ACCESS_KEY_ID (for AI)"
echo "      → Edit .env with STRIPE_SECRET (for Billing)"
echo "      → Edit .env with SMTP_* (for Notifications)"
echo ""
echo "📚 Documentation:"
echo "   → SPRINT2_SUMMARY.md"
echo "   → DEPLOY_LOCAL.md"
echo "   → TODO_SPRINT3.md"
echo ""
