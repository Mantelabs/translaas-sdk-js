# Changesets

This directory contains changeset files that describe changes to packages in this monorepo.

## What is a Changeset?

A changeset is a markdown file that describes:

- Which packages changed
- What type of change (major, minor, patch)
- A summary of the changes

## Creating a Changeset

Run the interactive command:

```bash
npm run changeset
```

This will:

1. Show you which packages have changed
2. Ask you to select the packages that need version bumps
3. Ask for the type of change (major/minor/patch)
4. Ask for a summary of the changes
5. Create a changeset file in this directory

## Changeset File Format

Example changeset file (`.changeset/my-feature.md`):

```markdown
---
'@translaas/client': minor
'@translaas/models': patch
---

Added support for custom retry policies in the HTTP client
```

## Changeset Types

- **major**: Breaking changes that require users to update their code
- **minor**: New features that are backward compatible
- **patch**: Bug fixes that are backward compatible

## When to Create a Changeset

Create a changeset when:

- ✅ Adding new features
- ✅ Fixing bugs
- ✅ Making breaking changes
- ✅ Updating dependencies that affect behavior

Don't create a changeset for:

- ❌ Internal refactoring
- ❌ Test-only changes
- ❌ Build system changes
- ❌ Documentation-only changes (unless they affect API usage)

## Prerelease mode (`beta`)

The repo may use **prerelease** versioning (e.g. `0.3.0-beta`). While **`.changeset/pre.json`** exists:

- You are in **pre** mode with npm dist-tag **`beta`** (see `pre.json`).
- New publishes land on **`beta`**; **`latest`** is not updated automatically.
- To point **`latest`** at a published beta (so `npm install @translaas/core` resolves to it), run the **Promote beta to latest** workflow in GitHub Actions (`.github/workflows/promote-beta-to-latest.yml`). It uses the repo **`NPM_TOKEN`** secret — no local npm login required.
- After publishing this line, run **`npx changeset pre exit`** when you are ready to return to normal (non-prerelease) versioning.

Do not leave multiple stale changeset files on `main`; consolidate into one release changeset or consume them with `changeset version` so CI does not open conflicting “Version packages” PRs.

## What Happens Next?

1. Commit your changeset file with your PR
2. When your PR is merged, CI will detect the changeset
3. CI will create a "Version Packages" PR
4. When the version PR is merged, packages are published to npm and a single coordinated `v*` git tag is pushed (see [Git tags](#git-tags) in CONTRIBUTING.md)
