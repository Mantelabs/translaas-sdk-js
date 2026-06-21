# @translaas/caching-file

## 0.5.0-beta.0

### Minor Changes

- 6ed1aa4: Read supported project locales from the offline cache in CacheOnly mode. Adds `getProjectLocalesAsync` to `IOfflineCacheProvider` and wires `CachingTranslaasClient` CacheOnly/CacheFirst/ApiFirst paths to read `locales.json`, root `manifest.json`, or cached locale directories.

## 0.5.0-beta

### Minor Changes

- f797f92: Align the JavaScript SDK with the .NET contract:
  - **`TranslaasService.t()`** — numeric third argument is treated as plural count with automatic language resolution (breaking change for callers that previously passed a numeric language code positionally).
  - **`TranslaasClient.getEntryAsync`** — merges `N` into query parameters when `number` is set (case-insensitive overwrite replaces `n`, matching .NET wire format).
  - **`CachingTranslaasClient`** — shipped in `@translaas/caching-file` with CacheFirst / ApiFirst / CacheOnly modes, .NET-aligned one/other offline plural rules, and `{name}` substitution.

### Patch Changes

- Updated dependencies [f797f92]
- Updated dependencies [0c15ef2]
  - @translaas/client@0.5.0-beta
  - @translaas/models@0.5.0-beta

## 0.4.0-beta

### Minor Changes

- Coordinated **beta** release for the JS SDK (version **`0.4.0-beta`** on all public packages, npm **`beta`** dist-tag). Builds on **`0.3.0-beta`** with consolidated release notes, GitHub template sync, and continued SDK v1 / caching parity.

  ### Translaas SDK v1 HTTP API
  - Default routes under **`/sdk/v1/translations`** (`text`, `group`, `project`, `locales`, **`report-missing`**, **`offline-cache`**) and **`GET /api/v1/api-keys/validate`**.
  - OpenAPI-aligned parsing for group/project payloads (including **`entries`** envelope, **`format=flat-json`**, optional **`channel`**, **`v`**, **`includeContext`**).
  - **`TranslaasOptions`**: **`sdkTranslationsPathPrefix`**, **`defaultProjectId`**, **`defaultSdkQuery`**, offline cache wiring.
  - **`TranslaasClient`**: **`reportMissingKeysAsync`**, **`getOfflineCacheZipAsync`**, **`validateApiKeyAsync`**; **`TranslaasService.t`** forwarding for project scopes and cancellation where applicable.

  **Breaking (vs legacy `/api/translations/...`):** set **`baseUrl`** to the API host and use the default **`/sdk/v1/translations`** prefix or override with **`sdkTranslationsPathPrefix`**. See the repository **README** for migration examples.

  ### Caching
  - Memory, file, and hybrid cache providers; **`CacheKeyBuilder`**; Node **`FileCacheProvider`** and browser **`BrowserCacheProvider`** for offline-capable flows.

  ### Documentation and developer experience
  - TypeDoc entry points, **`npm run docs`**, GitHub Actions for API docs and Pages.
  - README updates for v1 configuration, project scoping, SDK query parameters, validate / report-missing / offline bundle flows.
  - Integration tests and framework examples; release notes template for GitHub releases.

  ### Repository maintenance
  - **CI:** Ubuntu on push/PR; Windows and macOS via **`workflow_dispatch`**. Dependency and Actions updates.
  - **Tooling:** Vitest, TypeDoc, TypeScript, ESLint ecosystem, MSW, lint-staged, Changesets refresh.
  - GitHub issue and PR templates aligned with the monorepo.

### Patch Changes

- Updated dependencies
  - @translaas/models@0.4.0-beta
  - @translaas/client@0.4.0-beta
  - @translaas/caching@0.4.0-beta

## 0.3.0-beta

### Patch Changes

- Coordinated **beta** release for the JS SDK (version **`0.3.0-beta`** on all public packages). Summary of what ships:

  ### Translaas SDK v1 HTTP API
  - Default routes under **`/sdk/v1/translations`** (`text`, `group`, `project`, `locales`, **`report-missing`**, **`offline-cache`**) and **`GET /api/v1/api-keys/validate`**.
  - OpenAPI-aligned parsing for group/project payloads (including **`entries`** envelope, **`format=flat-json`**, optional **`channel`**, **`v`**, **`includeContext`**).
  - **`TranslaasOptions`**: **`sdkTranslationsPathPrefix`**, **`defaultProjectId`**, **`defaultSdkQuery`**, offline cache wiring.
  - **`TranslaasClient`**: **`reportMissingKeysAsync`**, **`getOfflineCacheZipAsync`**, **`validateApiKeyAsync`**; **`TranslaasService.t`** forwarding for project and cancellation where applicable.

  **Breaking (vs legacy `/api/translations/...`):** point **`baseUrl`** at the API host; use default prefix or **`sdkTranslationsPathPrefix`** during migration. See repo **README** for options and examples.

  ### Caching
  - Memory, file, and hybrid cache providers; key builder; Node and browser file cache paths for offline-capable flows.

  ### Documentation & developer experience
  - TypeDoc entry points, **`npm run docs`**, GitHub Actions for API docs / Pages.
  - README updates for v1 configuration, project scoping, SDK query params, validate / report-missing / offline bundle.

  ### Repository maintenance (chore)
  - **CI:** Ubuntu-only on push/PR; **Windows** and **macOS** via **`workflow_dispatch`** to reduce Actions usage. Actions bumps (e.g. **upload-artifact**, **codecov**, GitHub Pages-related actions).
  - **Tooling:** Dev dependency refresh (Vitest, TypeDoc, TypeScript, ESLint ecosystem, MSW, lint-staged, Changesets, etc.); ESLint ignores **`**/dist/**`** and **`**/\*.cjs`\*\* so compiled output is not linted.

- Updated dependencies
  - @translaas/models@0.3.0-beta
  - @translaas/client@0.3.0-beta
  - @translaas/caching@0.3.0-beta

## 0.2.0

### Minor Changes

- Implement comprehensive caching system with memory, file, and hybrid providers
  - **Memory Cache Provider**: In-memory caching with absolute and sliding expiration support
  - **File Cache Providers**: Node.js (`FileCacheProvider`) and browser (`BrowserCacheProvider`) variants for offline caching
  - **Hybrid Cache Provider**: Combines L1 (memory) and L2 (file) caching for optimal performance
  - **Cache Key Builder**: Utility class for consistent, URL-safe cache key generation

  This release adds complete caching infrastructure to the SDK, enabling offline translation access and improved performance through multi-level caching strategies.

### Patch Changes

- Updated dependencies
  - @translaas/caching@0.2.0

### Minor Changes

- Implement comprehensive caching system with memory, file, and hybrid providers
  - **Memory Cache Provider**: In-memory caching with absolute and sliding expiration support
  - **File Cache Providers**: Node.js (`FileCacheProvider`) and browser (`BrowserCacheProvider`) variants for offline caching
  - **Hybrid Cache Provider**: Combines L1 (memory) and L2 (file) caching for optimal performance
  - **Cache Key Builder**: Utility class for consistent, URL-safe cache key generation

  This release adds complete caching infrastructure to the SDK, enabling offline translation access and improved performance through multi-level caching strategies.

### Patch Changes

- Updated dependencies
  - @translaas/caching@0.2.0
