# Release v0.4.0-beta — SDK v1 API parity (beta)

## Overview

This **beta** coordinates all public packages at **`0.4.0-beta`** (npm **`beta`** dist-tag). It continues the **`0.3.0-beta`** line with consolidated release tooling, GitHub template sync, and the full **Translaas SDK v1** HTTP surface plus **caching stack** (memory, file, hybrid, cache keys).

## Packages released

- `@translaas/models@0.4.0-beta`
- `@translaas/client@0.4.0-beta`
- `@translaas/extensions@0.4.0-beta`
- `@translaas/caching@0.4.0-beta`
- `@translaas/caching-file@0.4.0-beta`
- `@translaas/core@0.4.0-beta`

## Install

```bash
npm install @translaas/core@beta
# or pin:
npm install @translaas/core@0.4.0-beta
```

## What's new in 0.4.0-beta vs 0.3.0-beta

- Coordinated **`0.4.0-beta`** version line on all `@translaas/*` packages (stay on **`@beta`** / pin **`0.4.0-beta`** together).
- Release notes template and GitHub issue/PR templates aligned with the monorepo.
- Changesets **beta** prerelease mode restored for npm **`beta`** publishes.

## Features (included in this beta line)

### Translaas SDK v1 HTTP API (`@translaas/client`, `@translaas/models`)

- Default routes under **`/sdk/v1/translations`** (`text`, `group`, `project`, `locales`, **`report-missing`**, **`offline-cache`**) and **`GET /api/v1/api-keys/validate`**.
- OpenAPI-aligned parsing; **`TranslaasOptions`** for path prefix, default project, SDK query, offline cache.
- **`TranslaasClient`**: **`reportMissingKeysAsync`**, **`getOfflineCacheZipAsync`**, **`validateApiKeyAsync`**.

### Caching (`@translaas/caching`, `@translaas/caching-file`)

- **`MemoryCacheProvider`**, **`FileCacheProvider`**, **`BrowserCacheProvider`**, **`HybridCacheProvider`**, **`CacheKeyBuilder`**.

### Extensions and DX

- Language resolution providers; TypeDoc; integration tests; README v1 configuration docs.

## Migration

**From `0.3.0-beta`:** bump every `@translaas/*` package to **`0.4.0-beta`** (or **`@beta`**) in one step.

**From legacy `/api/translations/...`:** set **`baseUrl`** to the API host; use default **`/sdk/v1/translations`** or **`sdkTranslationsPathPrefix`**.

## Changelog

- [`packages/@translaas/core/CHANGELOG.md`](packages/@translaas/core/CHANGELOG.md)
- [`packages/@translaas/client/CHANGELOG.md`](packages/@translaas/client/CHANGELOG.md)
- [`packages/@translaas/models/CHANGELOG.md`](packages/@translaas/models/CHANGELOG.md)
- [`packages/@translaas/extensions/CHANGELOG.md`](packages/@translaas/extensions/CHANGELOG.md)
- [`packages/@translaas/caching/CHANGELOG.md`](packages/@translaas/caching/CHANGELOG.md)
- [`packages/@translaas/caching-file/CHANGELOG.md`](packages/@translaas/caching-file/CHANGELOG.md)

---

**Full changelog**: https://github.com/acuencadev/translaas-sdk-js/compare/v0.3.0-beta...v0.4.0-beta
