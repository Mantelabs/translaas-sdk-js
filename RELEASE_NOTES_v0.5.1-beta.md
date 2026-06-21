# Release v0.5.1-beta — offline cache project locales (beta)

## Overview

Coordinated **beta** release at **`0.5.1-beta`** on all `@translaas/*` packages (npm **`beta`** dist-tag). Builds on **0.5.0-beta** with offline-cache project locale discovery for CacheOnly and hybrid cache modes.

## Packages released

- `@translaas/models@0.5.1-beta`
- `@translaas/client@0.5.1-beta`
- `@translaas/extensions@0.5.1-beta`
- `@translaas/caching@0.5.1-beta`
- `@translaas/caching-file@0.5.1-beta`
- `@translaas/core@0.5.1-beta`

## Install

```bash
npm install @translaas/core@beta
# or pin:
npm install @translaas/core@0.5.1-beta
```

## Highlights

- **`IOfflineCacheProvider.getProjectLocalesAsync`** — read supported project locales from the offline cache
- **`CachingTranslaasClient`** — CacheOnly / CacheFirst / ApiFirst paths resolve locales from `locales.json`, root `manifest.json`, or cached locale directories

## Migration

**From `0.5.0-beta`:** bump every `@translaas/*` package to **`0.5.1-beta`** together. No breaking API changes beyond the new optional offline-cache helper.

## Changelog

- [`packages/@translaas/caching-file/CHANGELOG.md`](packages/@translaas/caching-file/CHANGELOG.md)
- [`packages/@translaas/core/CHANGELOG.md`](packages/@translaas/core/CHANGELOG.md)

---

**Full diff**: https://github.com/acuencadev/translaas-sdk-js/compare/v0.5.0-beta...v0.5.1-beta
