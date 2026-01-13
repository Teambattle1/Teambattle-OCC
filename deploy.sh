#!/bin/bash

# Auto-deploy script for OCC
# Usage: ./deploy.sh "commit message"

set -e

# Default commit message if none provided
MESSAGE="${1:-Auto-deploy: Updates and improvements}"

echo "🔨 Building project..."
npm run build

echo "📦 Adding changes..."
git add -A

echo "💾 Committing..."
git commit -m "$MESSAGE

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" || echo "No changes to commit"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Deployed to GitHub! Netlify will auto-deploy."
