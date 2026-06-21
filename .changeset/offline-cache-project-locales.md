---
'@translaas/caching-file': minor
---

Read supported project locales from the offline cache in CacheOnly mode. Adds `getProjectLocalesAsync` to `IOfflineCacheProvider` and wires `CachingTranslaasClient` CacheOnly/CacheFirst/ApiFirst paths to read `locales.json`, root `manifest.json`, or cached locale directories.
