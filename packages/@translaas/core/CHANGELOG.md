# @translaas/core

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
  - @translaas/client@0.3.0-beta
  - @translaas/caching@0.3.0-beta
  - @translaas/caching-file@0.3.0-beta
  - @translaas/extensions@0.3.0-beta

## 0.2.0

### Minor Changes

- Bump version to align with caching packages release

  `@translaas/core` re-exports the new caching functionality, so it should be versioned alongside the caching packages.

### Patch Changes

- Updated dependencies
  - @translaas/models@0.2.0
  - @translaas/client@0.2.0
  - @translaas/extensions@0.2.0

### Minor Changes

- Bump version to align with caching packages release

  `@translaas/core` re-exports the new caching functionality, so it should be versioned alongside the caching packages.
