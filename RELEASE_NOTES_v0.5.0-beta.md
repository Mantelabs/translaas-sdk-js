# Release v0.5.0-beta — multi-project keys and .NET parity (beta)

## Overview

Coordinated **beta** release at **`0.5.0-beta`** on all `@translaas/*` packages (npm **`beta`** dist-tag). Builds on **0.4.0-beta** with default project resolution from validate and .NET-aligned `t()` / offline behavior. Aligns with Python **0.5.0b1** and .NET **0.4.1-beta** / **0.5.0** SDK lines.

## Packages released

- `@translaas/models@0.5.0-beta`
- `@translaas/client@0.5.0-beta`
- `@translaas/extensions@0.5.0-beta`
- `@translaas/caching@0.5.0-beta`
- `@translaas/caching-file@0.5.0-beta`
- `@translaas/core@0.5.0-beta`

## Install

```bash
npm install @translaas/core@beta
# or pin:
npm install @translaas/core@0.5.0-beta
```

## Highlights

- **`TranslaasClient.createAsync()`** — resolves `defaultProjectId` from validate when omitted
- **`TranslaasService.t()`** — numeric third argument is plural count with auto language (breaking for numeric language codes passed positionally)
- **`CachingTranslaasClient`** — CacheFirst / ApiFirst / CacheOnly with .NET one/other offline plural and `{name}` substitution
- **`getEntryAsync`** — merges `N` into query parameters when `number` is set

## Migration

**From `0.4.0-beta`:** bump every `@translaas/*` package to **`0.5.0-beta`** together. Re-test offline plural/interpolation and `t()` positional arguments.

## Changelog

- [`packages/@translaas/client/CHANGELOG.md`](packages/@translaas/client/CHANGELOG.md)
- [`packages/@translaas/models/CHANGELOG.md`](packages/@translaas/models/CHANGELOG.md)
- [`packages/@translaas/caching-file/CHANGELOG.md`](packages/@translaas/caching-file/CHANGELOG.md)

---

**Full diff**: https://github.com/acuencadev/translaas-sdk-js/compare/v0.4.0-beta...v0.5.0-beta
