#!/bin/bash

# Configuration
COMMIT_MSG=${1:-"auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"}

echo "🚀 Starting synchronization..."

# 1. Sync with GitHub
echo "📦 Staging changes..."
git add .

echo "💾 Committing changes with message: '$COMMIT_MSG'..."
# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "✨ No changes to commit."
else
    git commit -m "$COMMIT_MSG"
fi

echo "📤 Pushing to GitHub..."
git push origin $(git rev-parse --abbrev-ref HEAD)

# 2. Sync with Supabase (Prisma)
echo "🗄️ Syncing database schema to Supabase..."
npx prisma db push --accept-data-loss

echo "✅ Synchronization complete!"
