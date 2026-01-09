# Release v0.2.0 - Comprehensive Caching System

## 🎉 Overview

This release introduces a complete caching infrastructure for the Translaas SDK, enabling offline translation access and improved performance through multi-level caching strategies.

## 📦 Packages Released

- `@translaas/caching@0.2.0`
- `@translaas/caching-file@0.2.0`

## ✨ New Features

### 1. Memory Cache Provider (`@translaas/caching`)

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

### 2. File Cache Providers (`@translaas/caching-file`)

Offline caching for Node.js and browser environments:

#### Node.js: `FileCacheProvider`

- Persists translations to local JSON files
- Atomic writes to prevent corruption
- Directory structure: `{cacheDir}/{project}/{lang}/project.json`
- Manifest files track cache metadata

```typescript
import { FileCacheProvider } from '@translaas/caching-file';

const cache = new FileCacheProvider({
  cacheDir: './.translaas-cache'
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

### 3. Hybrid Cache Provider (`@translaas/caching-file`)

Combines L1 (memory) and L2 (file) caching for optimal performance:

- **L1 Cache**: Fast in-memory access (checked first)
- **L2 Cache**: Persistent file storage (checked on L1 miss)
- **Automatic Promotion**: L2 hits are promoted to L1
- **LRU Eviction**: L1 cache evicts least recently used entries when size limit reached
- **Warmup**: Pre-load projects/languages from L2 into L1

```typescript
import { HybridCacheProvider } from '@translaas/caching-file';
import { FileCacheProvider } from '@translaas/caching-file';

const l2Cache = new FileCacheProvider({ cacheDir: './.translaas-cache' });
const hybridCache = new HybridCacheProvider(l2Cache, {
  l1ExpirationMs: 3600000, // 1 hour
  maxMemoryCacheEntries: 100,
  warmupOnStartup: true
});

// Warmup: Load specific projects into L1
await hybridCache.warmupAsync([
  { project: 'my-project', languages: ['en', 'es'] }
]);

// Get project (checks L1 → L2 → returns null if both miss)
const project = await hybridCache.getProjectAsync('my-project', 'en');
```

### 4. Cache Key Builder (`@translaas/caching`)

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

All components include comprehensive unit tests:

- **MemoryCacheProvider**: 31 test cases
- **FileCacheProvider**: 29 test cases
- **BrowserCacheProvider**: 32 test cases
- **HybridCacheProvider**: 27 test cases
- **CacheKeyBuilder**: 30 test cases

**Total**: 149 test cases covering all scenarios

## 📚 Documentation

- Full TypeScript type definitions
- Comprehensive inline documentation
- Error handling with `TranslaasOfflineCacheException`

## 🔄 Migration Guide

No breaking changes. This is a new feature addition.

## 🐛 Bug Fixes

N/A - Initial release

## 📝 Changelog

See individual package changelogs:
- [`@translaas/caching/CHANGELOG.md`](packages/@translaas/caching/CHANGELOG.md)
- [`@translaas/caching-file/CHANGELOG.md`](packages/@translaas/caching-file/CHANGELOG.md)

## 🙏 Contributors

Translaas SDK Contributors

---

**Full Changelog**: https://github.com/acuencadev/translaas-sdk-js/compare/v0.1.0...v0.2.0
