#!/bin/bash

# Configuration
COMMIT_MSG=${1:-"auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"}
SKIP_DEPLOY=false

# Check for skip flag
for arg in "$@"; do
    if [ "$arg" == "--no-deploy" ] || [ "$arg" == "--skip" ]; then
        SKIP_DEPLOY=true
        COMMIT_MSG="$COMMIT_MSG [skip ci]"
    fi
done

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting synchronization...${NC}"
if [ "$SKIP_DEPLOY" = true ]; then
    echo -e "${YELLOW}⚠️  Vercel deployment will be skipped ([skip ci])${NC}"
fi

# 1. Sync with GitHub
echo -e "${YELLOW}📦 Staging changes...${NC}"
git add .

echo -e "${YELLOW}💾 Committing changes...${NC}"
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✨ No changes to commit.${NC}"
else
    if git commit -m "$COMMIT_MSG"; then
        echo -e "${GREEN}✅ Changes committed: '$COMMIT_MSG'${NC}"
    else
        echo -e "${RED}❌ Failed to commit changes.${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
if git push origin $(git rev-parse --abbrev-ref HEAD); then
    echo -e "${GREEN}✅ Pushed to GitHub successfully!${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub.${NC}"
    exit 1
fi

# 2. Sync with Supabase (Prisma)
# Optimization: Only push if schema changed
if git diff --name-only HEAD~1 HEAD | grep -q "prisma/schema.prisma"; then
    echo -e "${YELLOW}🗄️ Schema change detected! Syncing to Supabase...${NC}"
    if npx prisma db push --accept-data-loss; then
        echo -e "${GREEN}✅ Database schema synced successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to sync database schema.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No schema changes detected. Skipping db push.${NC}"
fi

echo -e "${BLUE}✨ All systems synchronized!${NC}"

