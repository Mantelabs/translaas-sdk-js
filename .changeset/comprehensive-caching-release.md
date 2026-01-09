---
"@translaas/caching": minor
"@translaas/caching-file": minor
"@translaas/core": minor
"@translaas/models": minor
"@translaas/client": minor
"@translaas/extensions": minor
---

Implement comprehensive caching system with memory, file, and hybrid providers

- **Memory Cache Provider**: In-memory caching with absolute and sliding expiration support
- **File Cache Providers**: Node.js (`FileCacheProvider`) and browser (`BrowserCacheProvider`) variants for offline caching
- **Hybrid Cache Provider**: Combines L1 (memory) and L2 (file) caching for optimal performance
- **Cache Key Builder**: Utility class for consistent, URL-safe cache key generation

This release adds complete caching infrastructure to the SDK, enabling offline translation access and improved performance through multi-level caching strategies.

All packages are versioned to 0.2.0 for coordinated release.
