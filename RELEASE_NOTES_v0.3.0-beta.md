# Release v0.3.0-beta — SDK v1 API parity (beta)

## 🎉 Overview

This **beta** coordinates all public packages at **`0.3.0-beta`** (npm **`beta`** dist-tag). It aligns the SDK with the **Translaas SDK v1** HTTP surface—default routes under **`/sdk/v1/translations`**, API key validation, reporting missing keys, and offline cache bundles—while shipping the **caching stack** (memory, file, hybrid, cache keys) introduced in v0.2.0 at the same version line.

## 📦 Packages Released

- `@translaas/models@0.3.0-beta`
- `@translaas/client@0.3.0-beta`
- `@translaas/extensions@0.3.0-beta`
- `@translaas/caching@0.3.0-beta`
- `@translaas/caching-file@0.3.0-beta`
- `@translaas/core@0.3.0-beta`

## 📥 Install

```bash
npm install @translaas/core@beta
# or pin:
npm install @translaas/core@0.3.0-beta
```

## ✨ New Features

### 1. Translaas SDK v1 HTTP API (`@translaas/client`, `@translaas/models`)

- Default translation routes under **`/sdk/v1/translations`** (`text`, `group`, `project`, `locales`, **`report-missing`**, **`offline-cache`**) plus **`GET /api/v1/api-keys/validate`**.
- OpenAPI-aligned parsing for group/project payloads (e.g. **`entries`** envelope, **`format=flat-json`**, optional **`channel`**, **`v`**, **`includeContext`**).
- **`TranslaasOptions`**: **`sdkTranslationsPathPrefix`**, **`defaultProjectId`**, **`defaultSdkQuery`**, and wiring for offline cache flows.
- **`TranslaasClient`**: **`reportMissingKeysAsync`**, **`getOfflineCacheZipAsync`**, **`validateApiKeyAsync`**; **`TranslaasService`** forwards **`t`** where applicable (project scopes, cancellation).

```typescript
import { TranslaasClient } from '@translaas/client';

const client = new TranslaasClient({
  apiKey: process.env.TRANSLAAS_API_KEY!,
  baseUrl: 'https://your-api.example.com',
  // Optional; defaults to /sdk/v1/translations
  // sdkTranslationsPathPrefix: '/sdk/v1/translations',
});

const validation = await client.validateApiKeyAsync();

await client.reportMissingKeysAsync({
  keys: [
    { groupKey: 'common', entryKey: 'greeting.hello', languageIsoCode: 'en' },
  ],
});

const bundle = await client.getOfflineCacheZipAsync('my-project', { channel: 'prod' });
```

### 2. Memory Cache Provider (`@translaas/caching`)

In-memory caching with expiration support:

- **Absolute Expiration**: Entries expire after a fixed duration
- **Sliding Expiration**: Entries expire after a period of inactivity
- **Automatic Cleanup**: Expired entries are removed on access
- **Thread-Safe**: Uses `Map` for storage

```typescript
import { MemoryCacheProvider } from '@translaas/caching';

const cache = new MemoryCacheProvider();

// Set with absolute expiration (1 hour)
cache.set('key', value, { absoluteExpirationMs: 3600000 });

// Set with sliding expiration (30 minutes)
cache.set('key', value, { slidingExpirationMs: 1800000 });

// Get value (returns null if expired)
const value = cache.get('key');
```

### 3. File Cache Providers (`@translaas/caching-file`)

Offline caching for Node.js and browser environments:

#### Node.js: `FileCacheProvider`

- Persists translations to local JSON files
- Atomic writes to prevent corruption
- Directory structure: `{cacheDir}/{project}/{lang}/project.json`
- Manifest files track cache metadata

```typescript
import { FileCacheProvider } from '@translaas/caching-file';

const cache = new FileCacheProvider({
  cacheDir: './.translaas-cache',
});

// Save project translations
await cache.saveProjectAsync(project, lang, translationProject);

// Retrieve cached project
const cached = await cache.getProjectAsync(project, lang);
```

#### Browser: `BrowserCacheProvider`

- Uses `localStorage` for persistent storage
- Handles quota exceeded errors gracefully
- Storage key format: `translaas:cache:{project}:{lang}`

```typescript
import { BrowserCacheProvider } from '@translaas/caching-file';

const cache = new BrowserCacheProvider();

// Save project translations
await cache.saveProjectAsync(project, lang, translationProject);

// Retrieve cached project
const cached = await cache.getProjectAsync(project, lang);
```

### 4. Hybrid Cache Provider (`@translaas/caching-file`)

Combines L1 (memory) and L2 (file) caching for optimal performance:

- **L1 Cache**: Fast in-memory access (checked first)
- **L2 Cache**: Persistent file storage (checked on L1 miss)
- **Automatic Promotion**: L2 hits are promoted to L1
- **LRU Eviction**: L1 cache evicts least recently used entries when size limit reached
- **Warmup**: Pre-load projects/languages from L2 into L1

```typescript
import { HybridCacheProvider, FileCacheProvider } from '@translaas/caching-file';

const l2Cache = new FileCacheProvider({ cacheDir: './.translaas-cache' });
const hybridCache = new HybridCacheProvider(l2Cache, {
  l1ExpirationMs: 3600000, // 1 hour
  maxMemoryCacheEntries: 100,
  warmupOnStartup: true,
});

// Warmup: Load specific projects into L1
await hybridCache.warmupAsync([{ project: 'my-project', languages: ['en', 'es'] }]);

// Get project (checks L1 → L2 → returns null if both miss)
const project = await hybridCache.getProjectAsync('my-project', 'en');
```

### 5. Cache Key Builder (`@translaas/caching`)

Utility class for generating consistent, URL-safe cache keys:

```typescript
import { CacheKeyBuilder } from '@translaas/caching';

// Entry key: entry:{group}:{entry}:{lang}
const entryKey = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
// Result: "entry:common:welcome:en"

// Group key: group:{project}:{group}:{lang}
const groupKey = CacheKeyBuilder.buildGroupKey('my-project', 'common', 'en');
// Result: "group:my-project:common:en"

// Project key: project:{project}:{lang}
const projectKey = CacheKeyBuilder.buildProjectKey('my-project', 'en');
// Result: "project:my-project:en"
```

## 🧪 Testing

Workspace unit tests (Vitest):

- **`@translaas/models`**: 308 test cases
- **`@translaas/client`**: 89 test cases
- **`@translaas/caching-file`**: 88 test cases
- **`@translaas/caching`**: 82 test cases
- **`@translaas/extensions`**: 42 test cases

**Total**: **609** test cases across published workspaces (`@translaas/core` has no dedicated test files; behaviour is covered via dependent packages).

## 📚 Documentation

- Full TypeScript types across all packages
- TypeDoc entry points and **`npm run docs`**
- README updates for v1 **`baseUrl`**, project scoping, SDK query parameters, validate / report-missing / offline bundle flows
- Error handling including **`TranslaasOfflineCacheException`** where applicable

## 🔄 Migration Guide

**Vs legacy `/api/translations/...`:** treat this beta as a **breaking URL contract** relative to older paths. Set **`baseUrl`** to the API host and use the default **`/sdk/v1/translations`** prefix or override with **`sdkTranslationsPathPrefix`** while migrating. See the repository **README** and **CONFIGURATION** docs.

Caching APIs from v0.2.0 remain conceptually compatible at the code level; bump package versions to **`0.3.0-beta`** (or **`@beta`**) together to avoid mixed semver lines.

## 🐛 Bug Fixes

_No separate bug-fix section for this coordinated beta; see package changelogs for patches included in this line._

## 📝 Changelog

See individual package changelogs:

- [`@translaas/core/CHANGELOG.md`](packages/@translaas/core/CHANGELOG.md)
- [`@translaas/client/CHANGELOG.md`](packages/@translaas/client/CHANGELOG.md)
- [`@translaas/models/CHANGELOG.md`](packages/@translaas/models/CHANGELOG.md)
- [`@translaas/extensions/CHANGELOG.md`](packages/@translaas/extensions/CHANGELOG.md)
- [`@translaas/caching/CHANGELOG.md`](packages/@translaas/caching/CHANGELOG.md)
- [`@translaas/caching-file/CHANGELOG.md`](packages/@translaas/caching-file/CHANGELOG.md)

## 🙏 Contributors

Translaas SDK Contributors

---

**Full Changelog**: https://github.com/acuencadev/translaas-sdk-js/compare/v0.2.0...v0.3.0-beta
