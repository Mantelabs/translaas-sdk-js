# Release process — `@translaas/*` JavaScript SDK

This document describes how to cut a release of the JS SDK monorepo (`acuencadev/translaas-sdk-js`).

## Versioning

- Follow [Semantic Versioning](https://semver.org/) across all published packages (`@translaas/models`, `@translaas/client`, `@translaas/core`, etc.).
- Keep package versions aligned in the monorepo for a given release line (e.g. `0.3.0`).
- Pre-releases use npm dist-tags (`beta`, `next`) — do not overwrite stable tags.

## Pre-release checklist

1. **Changelog** — Update each affected package `CHANGELOG.md` under [Keep a Changelog](https://keepachangelog.com/) format.
2. **Tests** — From repo root: `npm run test:all`.
3. **Build** — `npm run build` (all packages compile cleanly).
4. **Docs** — README / TypeDoc match shipped behavior (no claims for unreleased sync/retry features).
5. **API parity** — Cross-check against `.docs/translaas-sdk-http-api-spec.md` and .NET SDK where applicable.

## Release steps

```bash
# 1. Ensure clean tree on main (or release branch)
git status

# 2. Run full verification
npm run test:all
npm run build

# 3. Bump versions (workspace tool or manual package.json edits)
# Example: npm version 0.3.0 --workspaces --include-workspace-root

# 4. Commit
git commit -am "chore(release): v0.3.0"

# 5. Tag
git tag v0.3.0

# 6. Push and publish (requires npm auth)
git push origin main --tags
npm publish --workspaces --access public
```

## Post-release

- Create a GitHub Release with notes from `RELEASE_NOTES_vX.Y.Z*.md` when present.
- Update consumer repos / meta-repo submodule pointers (`translaas-all`) after validation.
- Open follow-up issues for deferred scope (e.g. offline sync decorator in **0.4.0**).

## Hotfix policy

- Patch releases (`x.y.Z`) for backward-compatible bug fixes only.
- If a breaking HTTP contract change is required, coordinate with the platform API version and bump minor/major per SemVer.
