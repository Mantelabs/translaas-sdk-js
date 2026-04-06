# @translaas/caching

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
  - **Tooling:** Dev dependency refresh (Vitest, TypeDoc, TypeScript, ESLint ecosystem, MSW, lint-staged, Changesets, etc.); ESLint ignores **`**/dist/**`** and **`**/*.cjs`** so compiled output is not linted.

- Updated dependencies
  - @translaas/models@0.3.0-beta

## 0.2.0

### Minor Changes

- Implement comprehensive caching system with memory, file, and hybrid providers
  - **Memory Cache Provider**: In-memory caching with absolute and sliding expiration support
  - **File Cache Providers**: Node.js (`FileCacheProvider`) and browser (`BrowserCacheProvider`) variants for offline caching
  - **Hybrid Cache Provider**: Combines L1 (memory) and L2 (file) caching for optimal performance
  - **Cache Key Builder**: Utility class for consistent, URL-safe cache key generation

  This release adds complete caching infrastructure to the SDK, enabling offline translation access and improved performance through multi-level caching strategies.
