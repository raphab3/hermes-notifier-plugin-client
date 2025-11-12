#!/bin/bash

# Hermes Client - npm Publish Script
# Publishes the package to npm and makes it available via CDN

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Hermes Client - npm Publish Script${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "hermes-client.js" ]; then
    echo -e "${RED}❌ Error: hermes-client.js not found${NC}"
    echo "Please run this script from the plugins/js-standalone directory"
    exit 1
fi

# Check if logged in to npm
if ! npm whoami &> /dev/null; then
    echo -e "${RED}❌ Error: Not logged in to npm${NC}"
    echo "Please run: npm login"
    exit 1
fi

echo -e "${GREEN}✅ Logged in as: $(npm whoami)${NC}"
echo ""

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"
echo ""

# Ask for version bump type
echo "Select version bump type:"
echo "  1) patch (${CURRENT_VERSION} -> $(npm version patch --no-git-tag-version --dry-run | grep -oP '\d+\.\d+\.\d+'))"
echo "  2) minor (${CURRENT_VERSION} -> $(npm version minor --no-git-tag-version --dry-run | grep -oP '\d+\.\d+\.\d+'))"
echo "  3) major (${CURRENT_VERSION} -> $(npm version major --no-git-tag-version --dry-run | grep -oP '\d+\.\d+\.\d+'))"
echo "  4) custom"
echo "  5) keep current (${CURRENT_VERSION})"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        NEW_VERSION=$(npm version patch --no-git-tag-version)
        ;;
    2)
        NEW_VERSION=$(npm version minor --no-git-tag-version)
        ;;
    3)
        NEW_VERSION=$(npm version major --no-git-tag-version)
        ;;
    4)
        read -p "Enter new version: " custom_version
        npm version $custom_version --no-git-tag-version
        NEW_VERSION="v${custom_version}"
        ;;
    5)
        NEW_VERSION="v${CURRENT_VERSION}"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

VERSION=${NEW_VERSION#v}
echo ""
echo -e "${GREEN}📝 Version: ${VERSION}${NC}"
echo ""

# Build
echo -e "${YELLOW}🔨 Building...${NC}"
npm run build

if [ ! -f "hermes-client.min.js" ]; then
    echo -e "${RED}❌ Error: Build failed - hermes-client.min.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Show what will be published
echo -e "${YELLOW}📋 Files to be published:${NC}"
npm pack --dry-run
echo ""

# Confirm
read -p "Publish version ${VERSION} to npm? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Publish cancelled${NC}"
    exit 0
fi

# Publish to npm
echo ""
echo -e "${YELLOW}📤 Publishing to npm...${NC}"

if npm publish --access public; then
    echo -e "${GREEN}✅ Published successfully!${NC}"
else
    echo -e "${RED}❌ Publish failed${NC}"
    exit 1
fi

# Git operations
echo ""
echo -e "${YELLOW}📝 Git operations...${NC}"

git add package.json hermes-client.min.js

if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    git commit -m "Release v${VERSION}"
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

# Create tag
TAG="v${VERSION}"
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Tag ${TAG} already exists${NC}"
else
    git tag -a "$TAG" -m "Release ${TAG}"
    echo -e "${GREEN}✅ Tag ${TAG} created${NC}"
fi

# Push
read -p "Push to GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    git push origin "$TAG"
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped push to GitHub${NC}"
    echo "To push manually:"
    echo "  git push origin main"
    echo "  git push origin ${TAG}"
fi

# Show results
echo ""
echo -e "${GREEN}🎉 Success! Package published${NC}"
echo ""
echo -e "${BLUE}📦 npm Package:${NC}"
echo "  https://www.npmjs.com/package/@hermes-notifications/client"
echo ""
echo -e "${BLUE}🌐 CDN URLs:${NC}"
echo ""
echo "Latest version:"
echo "  https://cdn.jsdelivr.net/npm/@hermes-notifications/client"
echo ""
echo "Specific version (${VERSION}):"
echo "  https://cdn.jsdelivr.net/npm/@hermes-notifications/client@${VERSION}"
echo ""
echo "Unminified:"
echo "  https://cdn.jsdelivr.net/npm/@hermes-notifications/client@${VERSION}/hermes-client.js"
echo ""
echo -e "${BLUE}📝 Usage:${NC}"
echo '  <script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client"></script>'
echo ""
echo -e "${YELLOW}⏳ Note: CDN may take a few minutes to update${NC}"
echo ""
echo -e "${GREEN}✅ Done!${NC}"

