# Release script for v0.2.0 (PowerShell)
# This script helps create a GitHub release and publish to npm

$ErrorActionPreference = "Stop"

$VERSION = "v0.2.0"
$TAG_NAME = "v0.2.0"
$RELEASE_NOTES_FILE = "RELEASE_NOTES_v0.2.0.md"

Write-Host "🚀 Starting release process for $VERSION" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're on the right branch
Write-Host "📋 Step 1: Checking git status..." -ForegroundColor Yellow
$CURRENT_BRANCH = git branch --show-current
Write-Host "Current branch: $CURRENT_BRANCH"

# Step 2: Check if changes are committed
Write-Host ""
Write-Host "📋 Step 2: Checking for uncommitted changes..." -ForegroundColor Yellow
$uncommitted = git diff-index --quiet HEAD --
if (-not $uncommitted) {
    Write-Host "⚠️  Warning: You have uncommitted changes." -ForegroundColor Yellow
    Write-Host "Please commit or stash them before proceeding."
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Step 3: Build packages
Write-Host ""
Write-Host "📋 Step 3: Building packages..." -ForegroundColor Yellow
npm run build

# Step 4: Run tests
Write-Host ""
Write-Host "📋 Step 4: Running tests..." -ForegroundColor Yellow
npm test

# Step 5: Create git tag
Write-Host ""
Write-Host "📋 Step 5: Creating git tag $TAG_NAME..." -ForegroundColor Yellow
$tagExists = git rev-parse "$TAG_NAME" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Tag $TAG_NAME already exists. Skipping tag creation." -ForegroundColor Yellow
} else {
    git tag -a "$TAG_NAME" -m "Release $VERSION - Comprehensive Caching System"
    Write-Host "✅ Tag $TAG_NAME created" -ForegroundColor Green
}

# Step 6: Push tag to GitHub
Write-Host ""
Write-Host "📋 Step 6: Pushing tag to GitHub..." -ForegroundColor Yellow
$pushTag = Read-Host "Push tag to GitHub? (y/N)"
if ($pushTag -eq "y" -or $pushTag -eq "Y") {
    git push origin "$TAG_NAME"
    Write-Host "✅ Tag pushed to GitHub" -ForegroundColor Green
}

# Step 7: Publish to npm
Write-Host ""
Write-Host "📋 Step 7: Publishing to npm..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure you're logged in to npm: npm login" -ForegroundColor Yellow
$publishNpm = Read-Host "Publish to npm? (y/N)"
if ($publishNpm -eq "y" -or $publishNpm -eq "Y") {
    npm run changeset:publish
    Write-Host "✅ Packages published to npm" -ForegroundColor Green
}

# Step 8: Create GitHub release
Write-Host ""
Write-Host "📋 Step 8: Creating GitHub release..." -ForegroundColor Yellow
Write-Host "⚠️  You can create a GitHub release manually at:" -ForegroundColor Yellow
Write-Host "   https://github.com/acuencadev/translaas-sdk-js/releases/new"
Write-Host ""
Write-Host "Tag: $TAG_NAME"
Write-Host "Title: Release $VERSION - Comprehensive Caching System"
Write-Host "Description: Use the content from $RELEASE_NOTES_FILE"

Write-Host ""
Write-Host "✅ Release process complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Create GitHub release at: https://github.com/acuencadev/translaas-sdk-js/releases/new"
Write-Host "2. Use tag: $TAG_NAME"
Write-Host "3. Copy content from $RELEASE_NOTES_FILE"
Write-Host "4. Mark as 'Latest release' if this is the newest version"
