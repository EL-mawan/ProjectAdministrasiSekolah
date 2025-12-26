#!/bin/bash

# Script to automatically watch for changes and run sync.sh
# It checks for changes every 5 seconds.

echo "👀 Watching for changes in $(pwd)..."
echo "🚀 Auto-sync is active. Press [Ctrl+C] to stop."

while true; do
    # Check if there are any uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        echo "✨ Changes detected at $(date '+%H:%M:%S')"
        
        # Add a small delay to allow multiple file saves to complete
        sleep 2
        
        # Run the sync script
        bash sync.sh "auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
        
        echo "😴 Waiting for next changes..."
    fi
    sleep 5
done
