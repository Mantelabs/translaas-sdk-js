#!/bin/bash

# Release script for v0.2.0
# This script helps create a GitHub release and publish to npm

set -e

VERSION="v0.2.0"
TAG_NAME="v0.2.0"
RELEASE_NOTES_FILE="RELEASE_NOTES_v0.2.0.md"

echo "🚀 Starting release process for $VERSION"
echo ""

# Step 1: Check if we're on the right branch
echo "📋 Step 1: Checking git status..."
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Step 2: Check if changes are committed
echo ""
echo "📋 Step 2: Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes."
    echo "Please commit or stash them before proceeding."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 3: Build packages
echo ""
echo "📋 Step 3: Building packages..."
npm run build

# Step 4: Run tests
echo ""
echo "📋 Step 4: Running tests..."
npm test

# Step 5: Create git tag
echo ""
echo "📋 Step 5: Creating git tag $TAG_NAME..."
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    echo "⚠️  Tag $TAG_NAME already exists. Skipping tag creation."
else
    git tag -a "$TAG_NAME" -m "Release $VERSION - Comprehensive Caching System"
    echo "✅ Tag $TAG_NAME created"
fi

# Step 6: Push tag to GitHub
echo ""
echo "📋 Step 6: Pushing tag to GitHub..."
read -p "Push tag to GitHub? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin "$TAG_NAME"
    echo "✅ Tag pushed to GitHub"
fi

# Step 7: Publish to npm
echo ""
echo "📋 Step 7: Publishing to npm..."
echo "⚠️  Make sure you're logged in to npm: npm login"
read -p "Publish to npm? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run changeset:publish
    echo "✅ Packages published to npm"
fi

# Step 8: Create GitHub release
echo ""
echo "📋 Step 8: Creating GitHub release..."
echo "⚠️  You can create a GitHub release manually at:"
echo "   https://github.com/acuencadev/translaas-sdk-js/releases/new"
echo ""
echo "Tag: $TAG_NAME"
echo "Title: Release $VERSION - Comprehensive Caching System"
echo "Description: Use the content from $RELEASE_NOTES_FILE"

echo ""
echo "✅ Release process complete!"
echo ""
echo "Next steps:"
echo "1. Create GitHub release at: https://github.com/acuencadev/translaas-sdk-js/releases/new"
echo "2. Use tag: $TAG_NAME"
echo "3. Copy content from $RELEASE_NOTES_FILE"
echo "4. Mark as 'Latest release' if this is the newest version"
