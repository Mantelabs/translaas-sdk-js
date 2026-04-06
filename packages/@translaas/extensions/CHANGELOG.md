# @translaas/extensions

## 0.3.0

### Minor Changes

- 4903afb: Implement comprehensive caching system with memory, file, and hybrid providers
  - **Memory Cache Provider**: In-memory caching with absolute and sliding expiration support
  - **File Cache Providers**: Node.js (`FileCacheProvider`) and browser (`BrowserCacheProvider`) variants for offline caching
  - **Hybrid Cache Provider**: Combines L1 (memory) and L2 (file) caching for optimal performance
  - **Cache Key Builder**: Utility class for consistent, URL-safe cache key generation

  This release adds complete caching infrastructure to the SDK, enabling offline translation access and improved performance through multi-level caching strategies.

  All packages are versioned to 0.2.0 for coordinated release.

### Patch Changes

- b1b69e1: Add comprehensive API documentation and automated documentation generation
  - **JSDoc Comments**: Added complete JSDoc documentation to all public classes, methods, and interfaces
  - **TypeDoc Configuration**: Configured TypeDoc for automated API reference generation from source code
  - **GitHub Pages**: Set up automated documentation deployment to GitHub Pages via GitHub Actions
  - **CI Integration**: Added documentation generation step to CI workflow

  This release adds comprehensive API documentation infrastructure with automated generation and deployment, improving developer experience and API discoverability.

- Updated dependencies [4903afb]
- Updated dependencies [b1b69e1]
- Updated dependencies [51605b1]
  - @translaas/models@0.3.0
  - @translaas/client@0.3.0

## 0.2.0

### Minor Changes

- Bump all packages to 0.2.0 for coordinated release

  This ensures all packages in the SDK are aligned at version 0.2.0 for the comprehensive caching system release.

### Patch Changes

- Updated dependencies
  - @translaas/models@0.2.0
  - @translaas/client@0.2.0
