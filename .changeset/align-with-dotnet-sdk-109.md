---
'@translaas/client': minor
'@translaas/models': minor
'@translaas/caching-file': minor
---

Align the JavaScript SDK with the .NET contract:

- **`TranslaasService.t()`** — numeric third argument is treated as plural count with automatic language resolution (breaking change for callers that previously passed a numeric language code positionally).
- **`TranslaasClient.getEntryAsync`** — merges `N` into query parameters when `number` is set (case-insensitive overwrite replaces `n`, matching .NET wire format).
- **`CachingTranslaasClient`** — shipped in `@translaas/caching-file` with CacheFirst / ApiFirst / CacheOnly modes, .NET-aligned one/other offline plural rules, and `{name}` substitution.
