#!/usr/bin/env bash

#################################################################
# TouchBase Quick Deploy Script
# One-command local deployment for development
#################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║      TouchBase Deployment Script         ║"
echo "║   Baseball Club Management for Chamilo    ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

#  1) Check dependencies
echo -e "${YELLOW}[1/7]${NC} Checking dependencies..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# 2) Setup environment file
echo -e "${YELLOW}[2/7]${NC} Setting up environment..."

if [ ! -f "$PLUGIN_DIR/.env" ]; then
    echo "Creating .env from .env.example..."
    cp "$PLUGIN_DIR/.env.example" "$PLUGIN_DIR/.env"
    echo -e "${GREEN}✓ Created .env file${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# 3) Start Docker containers
echo -e "${YELLOW}[3/7]${NC} Starting Docker containers..."

cd "$PLUGIN_DIR"

# Stop any existing containers
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Start containers
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

echo -e "${GREEN}✓ Docker containers started${NC}"

# 4) Wait for database to be ready
echo -e "${YELLOW}[4/7]${NC} Waiting for database..."

sleep 5

MAX_RETRIES=30
RETRY_COUNT=0

while ! docker exec touchbase_db mysqladmin ping -h localhost -u root -proot --silent &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}❌ Database failed to start${NC}"
        exit 1
    fi
    echo "Waiting for database... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo -e "${GREEN}✓ Database is ready${NC}"

# 5) Run migrations
echo -e "${YELLOW}[5/7]${NC} Running database migrations..."

docker exec -i touchbase_db mysql -uchamilo -pchamilo chamilo < "$PLUGIN_DIR/migrations/001_init.sql"
echo -e "${GREEN}✓ Main schema created${NC}"

if [ -f "$PLUGIN_DIR/migrations/002_sample_data.sql" ]; then
    docker exec -i touchbase_db mysql -uchamilo -pchamilo chamilo < "$PLUGIN_DIR/migrations/002_sample_data.sql"
    echo -e "${GREEN}✓ Sample data loaded${NC}"
fi

# 6) Show container status
echo -e "${YELLOW}[6/7]${NC} Container status..."

if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

# 7) Final instructions
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         🎉 Deployment Complete! 🎉       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Access Points:${NC}"
echo -e "   • Main Site:    ${GREEN}http://localhost${NC}"
echo -e "   • TouchBase:   ${GREEN}http://localhost/touchbase${NC}"
echo -e "   • API Docs:     ${GREEN}http://localhost/touchbase/api/teams${NC}"
echo ""
echo -e "${BLUE}🔧 Database:${NC}"
echo -e "   • Host:         ${GREEN}localhost:3306${NC}"
echo -e "   • Database:     ${GREEN}chamilo${NC}"
echo -e "   • User:         ${GREEN}chamilo${NC}"
echo -e "   • Password:     ${GREEN}chamilo${NC}"
echo ""
echo -e "${BLUE}📊 Sample Data:${NC}"
echo -e "   • Club:         ${GREEN}Demo Baseball Club${NC}"
echo -e "   • Season:       ${GREEN}2025-2026${NC}"
echo ""
echo -e "${YELLOW}🚀 Quick Commands:${NC}"
echo -e "   • Stop:         ${GREEN}docker-compose down${NC}"
echo -e "   • Restart:      ${GREEN}docker-compose restart${NC}"
echo -e "   • Logs:         ${GREEN}docker-compose logs -f${NC}"
echo -e "   • Shell:        ${GREEN}docker exec -it touchbase_php bash${NC}"
echo ""
echo -e "${BLUE}📖 Next Steps:${NC}"
echo -e "   1. Complete Chamilo installation at http://localhost"
echo -e "   2. Test API: ${GREEN}curl http://localhost/touchbase/api/teams${NC}"
echo -e "   3. View widgets: ${GREEN}http://localhost/touchbase/widgets/schedule?team_id=1${NC}"
echo ""
echo -e "${GREEN}Happy coding! ⚾${NC}"
