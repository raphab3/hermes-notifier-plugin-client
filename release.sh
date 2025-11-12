#!/bin/bash

# Hermes Client - Release Script
# Creates a new release and makes it available via CDN

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Hermes Client - Release Script${NC}"
echo ""

# Check if version is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Version number required${NC}"
    echo "Usage: ./release.sh <version>"
    echo "Example: ./release.sh 1.0.0"
    exit 1
fi

VERSION=$1
TAG="v${VERSION}"

echo -e "${YELLOW}📦 Preparing release ${TAG}${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "hermes-client.js" ]; then
    echo -e "${RED}❌ Error: hermes-client.js not found${NC}"
    echo "Please run this script from the plugins/js-standalone directory"
    exit 1
fi

# Update version in package.json
echo -e "${YELLOW}📝 Updating package.json version...${NC}"
if command -v jq &> /dev/null; then
    jq ".version = \"${VERSION}\"" package.json > package.json.tmp
    mv package.json.tmp package.json
else
    sed -i "s/\"version\": \".*\"/\"version\": \"${VERSION}\"/" package.json
fi

# Minify the file
echo -e "${YELLOW}🔨 Minifying hermes-client.js...${NC}"
if command -v npx &> /dev/null; then
    npx terser hermes-client.js -c -m -o hermes-client.min.js --comments false
    echo -e "${GREEN}✅ Minified successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: terser not found, skipping minification${NC}"
fi

# Show file sizes
echo ""
echo -e "${YELLOW}📊 File sizes:${NC}"
ls -lh hermes-client.js hermes-client.min.js 2>/dev/null || ls -lh hermes-client.js

# Git operations
echo ""
echo -e "${YELLOW}📤 Committing changes...${NC}"

git add hermes-client.js hermes-client.min.js package.json

if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    git commit -m "Release ${TAG} - Hermes Client standalone"
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

# Create tag
echo ""
echo -e "${YELLOW}🏷️  Creating tag ${TAG}...${NC}"

if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Tag ${TAG} already exists${NC}"
    echo "Please use a different version number or delete the existing tag:"
    echo "  git tag -d ${TAG}"
    echo "  git push origin :refs/tags/${TAG}"
    exit 1
fi

git tag -a "$TAG" -m "Release ${TAG}"
echo -e "${GREEN}✅ Tag created${NC}"

# Push to remote
echo ""
echo -e "${YELLOW}📤 Pushing to remote...${NC}"
read -p "Push to remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    git push origin "$TAG"
    echo -e "${GREEN}✅ Pushed to remote${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped push to remote${NC}"
    echo "To push manually:"
    echo "  git push origin main"
    echo "  git push origin ${TAG}"
fi

# Show CDN URLs
echo ""
echo -e "${GREEN}✅ Release ${TAG} created successfully!${NC}"
echo ""
echo -e "${YELLOW}📦 CDN URLs:${NC}"
echo ""
echo "Latest (main branch):"
echo "  https://cdn.jsdelivr.net/gh/raphab3/microceft-notifications@main/plugins/js-standalone/hermes-client.min.js"
echo ""
echo "Specific version (${TAG}):"
echo "  https://cdn.jsdelivr.net/gh/raphab3/microceft-notifications@${TAG}/plugins/js-standalone/hermes-client.min.js"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Create a GitHub release at:"
echo "   https://github.com/raphab3/microceft-notifications/releases/new"
echo "2. Tag: ${TAG}"
echo "3. Title: Hermes Client ${TAG}"
echo "4. Wait a few minutes for CDN to update"
echo "5. Test the CDN URL"
echo ""
echo -e "${GREEN}🎉 Done!${NC}"

