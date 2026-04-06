# @translaas/models

## 0.3.0

### Minor Changes

- 4903afb: Implement comprehensive caching system with memory, file, and hybrid providers
  - **Memory Cache Provider**: In-memory caching with absolute and sliding expiration support
  - **File Cache Providers**: Node.js (`FileCacheProvider`) and browser (`BrowserCacheProvider`) variants for offline caching
  - **Hybrid Cache Provider**: Combines L1 (memory) and L2 (file) caching for optimal performance
  - **Cache Key Builder**: Utility class for consistent, URL-safe cache key generation

  This release adds complete caching infrastructure to the SDK, enabling offline translation access and improved performance through multi-level caching strategies.

  All packages are versioned to 0.2.0 for coordinated release.

- 51605b1: Align the JS SDK with the backend **`/sdk/v1/translations`** API and OpenAPI response shapes.

  ### Breaking changes
  - Default translation HTTP routes use **`/sdk/v1/translations`** (e.g. `text`, `group`, `project`, `locales`, `report-missing`, `offline-cache`) instead of legacy **`/api/translations/...`** paths. Point **`baseUrl`** at the API host; override with **`sdkTranslationsPathPrefix`** if you use a custom proxy layout.
  - **`getGroupAsync`** / project parsing now matches **`GetGroupTranslationsResponse`** (wrapped **`entries`**, optional context/version fields) and supports **`format=flat-json`** where applicable.
  - **`ITranslaasClient`** method signatures and options were updated for **`project`**, SDK query passthrough (**`channel`**, **`v`**, **`includeContext`**), **`defaultProjectId`**, **`defaultSdkQuery`**, and new endpoints (**`reportMissingKeysAsync`**, **`getOfflineCacheZipAsync`**, **`validateApiKeyAsync`**).

  ### Migration

  See the README and **`.docs/CONFIGURATION.md`** for **`TranslaasOptions`**, text **`project`** when keys are not project-scoped, and the validate/offline ZIP helpers under **`/api/v1`** vs **`/sdk/v1`**.

### Patch Changes

- b1b69e1: Add comprehensive API documentation and automated documentation generation
  - **JSDoc Comments**: Added complete JSDoc documentation to all public classes, methods, and interfaces
  - **TypeDoc Configuration**: Configured TypeDoc for automated API reference generation from source code
  - **GitHub Pages**: Set up automated documentation deployment to GitHub Pages via GitHub Actions
  - **CI Integration**: Added documentation generation step to CI workflow

  This release adds comprehensive API documentation infrastructure with automated generation and deployment, improving developer experience and API discoverability.

## 0.2.0

### Minor Changes

- Bump all packages to 0.2.0 for coordinated release

  This ensures all packages in the SDK are aligned at version 0.2.0 for the comprehensive caching system release.
