#!/bin/bash

# TouchBase Setup Script
# Automated installation for TouchBase plugin

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            TouchBase Setup & Installation                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check if running inside Docker
echo -e "${BLUE}[1/6]${NC} Checking environment..."

if [ -f /.dockerenv ]; then
    echo -e "${GREEN}✓${NC} Running inside Docker container"
    IN_DOCKER=true
else
    echo -e "${YELLOW}⚠${NC} Running outside Docker - some features may not work"
    IN_DOCKER=false
fi

# Step 2: Check if .env exists
echo -e "${BLUE}[2/6]${NC} Checking configuration..."

if [ ! -f "$PLUGIN_DIR/.env" ]; then
    if [ -f "$PLUGIN_DIR/.env.example" ]; then
        echo -e "${YELLOW}⚠${NC} .env not found, creating from .env.example"
        cp "$PLUGIN_DIR/.env.example" "$PLUGIN_DIR/.env"
        echo -e "${GREEN}✓${NC} Created .env file"
    else
        echo -e "${RED}✗${NC} .env.example not found!"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} .env file exists"
fi

# Step 3: Generate APP_KEY if needed
echo -e "${BLUE}[3/6]${NC} Checking APP_KEY..."

if grep -q "APP_KEY=change-me" "$PLUGIN_DIR/.env"; then
    NEW_KEY=$(openssl rand -base64 32 | tr -d '\n')
    sed -i.bak "s/APP_KEY=.*/APP_KEY=$NEW_KEY/" "$PLUGIN_DIR/.env"
    rm "$PLUGIN_DIR/.env.bak" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Generated new APP_KEY"
else
    echo -e "${GREEN}✓${NC} APP_KEY already set"
fi

# Step 4: Test database connection
echo -e "${BLUE}[4/6]${NC} Testing database connection..."

if $IN_DOCKER || command -v mysql &> /dev/null; then
    # Load database credentials from .env
    DB_HOST=$(grep DB_HOST "$PLUGIN_DIR/.env" | cut -d '=' -f2)
    DB_NAME=$(grep DB_NAME "$PLUGIN_DIR/.env" | cut -d '=' -f2)
    DB_USER=$(grep DB_USER "$PLUGIN_DIR/.env" | cut -d '=' -f2)
    DB_PASS=$(grep DB_PASS "$PLUGIN_DIR/.env" | cut -d '=' -f2)

    if mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Database connection successful"
        DB_CONNECTED=true
    else
        echo -e "${RED}✗${NC} Cannot connect to database"
        echo -e "${YELLOW}  Host: $DB_HOST${NC}"
        echo -e "${YELLOW}  If running outside Docker, you may need to change DB_HOST to 'localhost' or '127.0.0.1'${NC}"
        DB_CONNECTED=false
    fi
else
    echo -e "${YELLOW}⚠${NC} mysql client not found, skipping database check"
    DB_CONNECTED=false
fi

# Step 5: Run migrations
echo -e "${BLUE}[5/6]${NC} Running database migrations..."

if $DB_CONNECTED; then
    # Sort migration files
    for migration in $(ls -1 "$PLUGIN_DIR/migrations/"*.sql | sort); do
        filename=$(basename "$migration")
        echo -e "  Running ${filename}..."

        if mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$migration" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} $filename applied"
        else
            echo -e "  ${YELLOW}⚠${NC} $filename failed (may already be applied)"
        fi
    done
    echo -e "${GREEN}✓${NC} Migrations completed"
else
    echo -e "${YELLOW}⚠${NC} Skipping migrations (no database connection)"
    echo ""
    echo -e "${YELLOW}To run migrations manually:${NC}"
    echo -e "  docker compose exec db bash -c 'mysql -uchamilo -pchamilo chamilo < /var/www/html/plugin/touchbase/migrations/001_init.sql'"
fi

# Step 6: Run diagnostics
echo -e "${BLUE}[6/6]${NC} Running diagnostics..."
echo ""

if command -v php &> /dev/null; then
    php "$PLUGIN_DIR/bin/diagnose.php"
else
    echo -e "${YELLOW}⚠${NC} PHP not found in PATH, skipping diagnostics"
fi

# Final instructions
echo ""
echo -e "${BLUE}━━━ Next Steps ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}1.${NC} Configure Nginx to serve /pelota from plugin/touchbase/public"
echo -e "   Add this to your nginx config:"
echo ""
echo -e "${YELLOW}   location ^~ /pelota {${NC}"
echo -e "${YELLOW}     alias /var/www/html/plugin/touchbase/public;${NC}"
echo -e "${YELLOW}     index index.php;${NC}"
echo -e "${YELLOW}"
echo -e "${YELLOW}     location ~ \.php$ {${NC}"
echo -e "${YELLOW}       include fastcgi_params;${NC}"
echo -e "${YELLOW}       fastcgi_param SCRIPT_FILENAME \$request_filename;${NC}"
echo -e "${YELLOW}       fastcgi_pass app:9000;${NC}"
echo -e "${YELLOW}     }${NC}"
echo -e "${YELLOW}   }${NC}"
echo ""
echo -e "${GREEN}2.${NC} Restart Nginx: ${YELLOW}docker compose restart web${NC}"
echo ""
echo -e "${GREEN}3.${NC} Visit: ${YELLOW}http://localhost/pelota${NC}"
echo ""
echo -e "${GREEN}4.${NC} Read TROUBLESHOOTING.md if you encounter issues"
echo ""
