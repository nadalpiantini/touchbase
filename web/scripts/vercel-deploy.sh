#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TouchBase - Vercel API Deployment${NC}"
echo "========================================"

# Load VERCEL_TOKEN from .env.vercel
if [ -f "../.env.vercel" ]; then
  export $(cat ../.env.vercel | grep -v '^#' | xargs)
elif [ -f "../../.env.vercel" ]; then
  export $(cat ../../.env.vercel | grep -v '^#' | xargs)
fi

# Check token
if [ -z "$VERCEL_TOKEN" ] || [ "$VERCEL_TOKEN" = "your_token_here_VcTOKEN_XXXXXXXXXXXXXXXXXXXXXXX" ]; then
  echo -e "${RED}❌ ERROR: VERCEL_TOKEN not set${NC}"
  echo ""
  echo "Get your token at: https://vercel.com/account/tokens"
  echo "Then edit: .env.vercel"
  exit 1
fi

# Load project info
PROJECT_JSON="../.vercel/project.json"
if [ ! -f "$PROJECT_JSON" ]; then
  PROJECT_JSON="../../.vercel/project.json"
fi

if [ ! -f "$PROJECT_JSON" ]; then
  echo -e "${RED}❌ ERROR: .vercel/project.json not found${NC}"
  exit 1
fi

PROJECT_ID=$(cat "$PROJECT_JSON" | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
ORG_ID=$(cat "$PROJECT_JSON" | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)

echo -e "${BLUE}📋 Project Info:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Org ID: $ORG_ID"
echo ""

# Get current git info
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_COMMIT=$(git rev-parse HEAD)
GIT_REPO="nadalpiantini/touchbase"

echo -e "${BLUE}🔍 Git Info:${NC}"
echo "  Branch: $GIT_BRANCH"
echo "  Commit: ${GIT_COMMIT:0:8}"
echo ""

# First, update project settings to force rootDirectory
echo -e "${YELLOW}🔧 Updating project settings...${NC}"

SETTINGS_PAYLOAD=$(cat <<EOF
{
  "framework": "nextjs",
  "rootDirectory": "web",
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev"
}
EOF
)

SETTINGS_RESPONSE=$(curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SETTINGS_PAYLOAD")

if echo "$SETTINGS_RESPONSE" | grep -q '"error"'; then
  echo -e "${YELLOW}⚠️  Could not update settings (may not have permissions)${NC}"
else
  echo -e "${GREEN}✅ Project settings updated${NC}"
fi

echo ""
echo -e "${YELLOW}🔄 Creating deployment...${NC}"

# Create deployment using simpler payload (let Vercel use git integration)
PAYLOAD=$(cat <<EOF
{
  "name": "touchbase",
  "target": "production"
}
EOF
)

# Create deployment
RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Check for errors
if echo "$RESPONSE" | grep -q '"error"'; then
  echo -e "${RED}❌ Deployment failed:${NC}"
  echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4
  exit 1
fi

# Extract deployment URL
DEPLOY_URL=$(echo "$RESPONSE" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
DEPLOY_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DEPLOY_URL" ]; then
  echo -e "${RED}❌ Could not extract deployment URL${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Deployment created!${NC}"
echo "  URL: https://$DEPLOY_URL"
echo "  ID: $DEPLOY_ID"
echo ""

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
MAX_ATTEMPTS=60
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  STATUS_RESPONSE=$(curl -s "https://api.vercel.com/v13/deployments/$DEPLOY_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN")

  STATE=$(echo "$STATUS_RESPONSE" | grep -o '"state":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ "$STATE" = "READY" ]; then
    echo -e "${GREEN}✅ Deployment is READY!${NC}"
    break
  elif [ "$STATE" = "ERROR" ]; then
    echo -e "${RED}❌ Deployment failed with ERROR state${NC}"
    exit 1
  fi

  echo -n "."
  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done

echo ""

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo -e "${YELLOW}⚠️  Timeout waiting for deployment${NC}"
  echo "Check status at: https://vercel.com/dashboard"
  exit 0
fi

# Validate endpoints
echo ""
echo -e "${BLUE}🔍 Validating endpoints...${NC}"

validate_endpoint() {
  local PATH=$1
  local URL="https://$DEPLOY_URL$PATH"

  echo -n "  $PATH → "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "$URL")

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "308" ]; then
    echo -e "${GREEN}$HTTP_CODE ✅${NC}"
    return 0
  else
    echo -e "${RED}$HTTP_CODE ❌${NC}"
    return 1
  fi
}

ALL_OK=true
validate_endpoint "/" || ALL_OK=false
validate_endpoint "/es" || ALL_OK=false
validate_endpoint "/en" || ALL_OK=false

echo ""

if [ "$ALL_OK" = true ]; then
  echo -e "${GREEN}🎉 Deployment successful and validated!${NC}"
  echo ""
  echo -e "${BLUE}🌐 Live URLs:${NC}"
  echo "  Production: https://touchbase.sujeto10.com"
  echo "  Preview: https://$DEPLOY_URL"
else
  echo -e "${YELLOW}⚠️  Deployment created but validation failed${NC}"
  echo "Check logs at: https://vercel.com/dashboard"
fi
