#!/bin/bash

# ============================================================
# TouchBase - Vercel Deployment Script
# ============================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         TouchBase - Vercel Deployment                        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Vercel CLI not found"
    echo -e "${BLUE}→${NC} Installing Vercel CLI..."
    npm i -g vercel
fi

echo -e "${BLUE}[1/4]${NC} Checking configuration..."

# Verify vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo -e "${YELLOW}⚠${NC} vercel.json not found!"
    exit 1
fi

echo -e "${GREEN}✓${NC} Configuration files OK"

echo -e "${BLUE}[2/4]${NC} Setting up environment variables..."

# Guide user to set env vars in Vercel
echo -e "${YELLOW}→${NC} You need to configure these environment variables in Vercel dashboard:"
echo ""
echo "  SUPABASE_URL"
echo "  SUPABASE_ANON_KEY"
echo "  SUPABASE_SERVICE_KEY"
echo "  DB_HOST"
echo "  DB_PORT"
echo "  DB_NAME"
echo "  DB_USER"
echo "  DB_PASS"
echo "  DB_DRIVER=pgsql"
echo "  APP_ENV=production"
echo ""
read -p "Have you configured these in Vercel dashboard? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}→${NC} Please configure environment variables first:"
    echo -e "  vercel env add SUPABASE_URL"
    echo -e "  (repeat for each variable)"
    exit 1
fi

echo -e "${BLUE}[3/4]${NC} Deploying to Vercel..."

# Deploy to production
vercel --prod

echo -e "${BLUE}[4/4]${NC} Configuring custom domain..."

echo -e "${YELLOW}→${NC} To add custom domain touchbase.sujeto10.com:"
echo -e "  1. Go to Vercel dashboard → Your project → Settings → Domains"
echo -e "  2. Add: touchbase.sujeto10.com"
echo -e "  3. Configure DNS records as shown by Vercel"
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Deployment Complete!                                ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Configure custom domain in Vercel dashboard"
echo -e "  2. Test: https://touchbase.sujeto10.com/api/teams"
echo -e "  3. Create admin user via Supabase Auth"
echo ""
