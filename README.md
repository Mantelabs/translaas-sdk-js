# Translaas SDK

![Tests](https://github.com/acuencadev/translaas-sdk-js/workflows/CI/badge.svg)
![npm version](https://img.shields.io/npm/v/@translaas/core)
![npm downloads](https://img.shields.io/npm/dm/@translaas/core)
![License](https://img.shields.io/npm/l/@translaas/core)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)
![Node.js](https://img.shields.io/node/v/@translaas/core)
![GitHub stars](https://img.shields.io/github/stars/acuencadev/translaas-sdk-js)
![GitHub forks](https://img.shields.io/github/forks/acuencadev/translaas-sdk-js)
![Bundle size](https://img.shields.io/bundlephobia/minzip/@translaas/core)

A strongly-typed, performant, and modular JavaScript/TypeScript SDK for consuming the **Translaas Translation Delivery API**. This SDK provides a clean, easy-to-use way to retrieve translations in your Node.js, browser, and modern JavaScript applications.

## Features

- ✅ **Strongly-typed API** - Full TypeScript support with IntelliSense and type safety
- ✅ **Convenience API** - Simple `t()` method for quick translation lookups via `TranslaasService`
- ✅ **Automatic Language Resolution** - Optional language parameter with configurable providers (HTTP request, browser locale, default)
- ✅ **Framework extensions** - Optional Express.js and Next.js helpers in `@translaas/extensions`
- ✅ **Flexible Caching** - Built-in memory caching with configurable cache modes
- ✅ **Offline bundle download** - `GET …/offline-cache` ZIP download; file-backed offline reads via `@translaas/caching-file` (sync tooling planned for 0.4.0)
- ✅ **Hybrid Caching** - Two-level caching (memory L1 + file L2) for optimal performance
- ✅ **Multi-Environment Support** - Works in Node.js, browsers, and modern JavaScript runtimes
- ✅ **Request timeouts** - Optional per-request timeout configuration
- ✅ **Modular Design** - Use only what you need with separate npm packages
- ✅ **Async/Await** - Fully asynchronous API for optimal performance
- ✅ **ES Modules** - Native ES module support with CommonJS compatibility
- ✅ **SDK v1 HTTP API** - Uses `/sdk/v1/translations` by default (text, group, project, locales, report-missing, offline bundle) plus optional **`GET /api/v1/api-keys/validate`**

## Installation

### npm

```bash
npm install @translaas/core
```

### yarn

```bash
yarn add @translaas/core
```

### pnpm

```bash
pnpm add @translaas/core
```

### Individual Packages

If you prefer to use individual packages:

- `@translaas/models` - Data transfer objects and types
- `@translaas/client` - Core HTTP client
- `@translaas/caching` - In-memory caching layer
- `@translaas/caching-file` - File-based offline caching with hybrid caching support
- `@translaas/extensions` - Framework integrations (Express, Next.js, etc.)
- `@translaas/core` - Main package (re-exports all) - **Recommended**

## Quick Start

### 1. Install Package

```bash
npm install @translaas/core
```

### 2. Create Client

**Option A: Using TranslaasService (Recommended for simple lookups)**

```typescript
import { TranslaasService, TranslaasOptions, CacheMode, LanguageCodes } from '@translaas/core';

const options: TranslaasOptions = {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.translaas.com', // or your custom base URL
  cacheMode: CacheMode.Group, // Optional: configure caching
};

const translaas = new TranslaasService(options);

// Use the convenient t() method
// lang parameter is optional when language providers are configured
const welcome = await translaas.t('common', 'welcome', LanguageCodes.English);

// Automatic language resolution (requires providers configured)
const welcomeAuto = await translaas.t('common', 'welcome'); // lang omitted

// With pluralization
const items = await translaas.t('messages', 'item', LanguageCodes.English, 5);
```

**Option B: Using TranslaasClient (Full API access)**

```typescript
import { TranslaasClient, TranslaasOptions } from '@translaas/core';

const options: TranslaasOptions = {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.translaas.com', // host only — do not append /api or /sdk
  // When your API key is not tied to a single project, the text endpoint requires `project`:
  defaultProjectId: 'my-project-slug',
};

const client = new TranslaasClient(options);

// Single string entry (plain text)
const translation = await client.getEntryAsync('common', 'welcome', 'en');

// Group / project / locales use an explicit project id as the first argument
const group = await client.getGroupAsync('my-project-slug', 'common', 'en');
const project = await client.getProjectAsync('my-project-slug', 'en');
const locales = await client.getProjectLocalesAsync('my-project-slug');
```

## Configuration

### Basic Configuration

```typescript
import { TranslaasService, TranslaasOptions, LanguageCodes } from '@translaas/core';

const options: TranslaasOptions = {
  // Required: API key and base URL
  apiKey: 'your-api-key',
  baseUrl: 'https://api.translaas.com',
};

const translaas = new TranslaasService(options);
```

### Advanced Configuration

```typescript
import { TranslaasService, TranslaasOptions, CacheMode, LanguageCodes } from '@translaas/core';
import { LanguageResolver, DefaultLanguageProvider } from '@translaas/extensions';

const options: TranslaasOptions = {
  // Required: API key and base URL
  apiKey: 'your-api-key',
  baseUrl: 'https://api.translaas.com',

  // Optional: Default language fallback
  defaultLanguage: LanguageCodes.English,

  // Optional: Automatic language (see @translaas/extensions for more providers)
  languageResolver: new LanguageResolver([new DefaultLanguageProvider('en')]),

  // Optional: Caching configuration
  cacheMode: CacheMode.Group,
  cacheAbsoluteExpiration: 3600000, // 1 hour in milliseconds
  cacheSlidingExpiration: 900000, // 15 minutes in milliseconds

  // Optional: HTTP client timeout
  timeout: 30000, // 30 seconds in milliseconds

  // Optional: SDK v1 — default project for GET …/text when the key is not project-scoped
  defaultProjectId: 'my-project-slug',

  // Optional: SDK v1 — default query params merged into translation requests
  defaultSdkQuery: {
    channel: 'production',
    v: '2025-01-01',
    includeContext: false,
  },

  // Optional: only if your gateway still serves legacy paths (migration)
  // sdkTranslationsPathPrefix: '/api/translations',

  // Optional: offline / file-backed client cache (see TypeDoc for OfflineCacheOptions)
  // offlineCache: { enabled: true, cacheDirectory: './.translaas-cache' },
};

const translaas = new TranslaasService(options);
```

**Configuration Options:**

| Option                      | Required        | Description                                                                                                                                |
| --------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `apiKey`                    | ✅ **Required** | Your Translaas API key                                                                                                                     |
| `baseUrl`                   | ✅ **Required** | API host root (e.g. `https://api.translaas.com`) — **no** trailing `/sdk` or `/api`                                                        |
| `sdkTranslationsPathPrefix` | ⚪ Optional     | Prefix for SDK routes (default **`/sdk/v1/translations`**) — override only during legacy or proxy migration                                |
| `defaultProjectId`          | ⚪ Optional     | Default `project` query for **text** when the key is not project-scoped; method-level `project` overrides                                  |
| `defaultSdkQuery`           | ⚪ Optional     | Default **`channel`**, snapshot **`v`**, and **`includeContext`** merged into translation HTTP calls (see also per-method `sdkQuery` args) |
| `defaultLanguage`           | ⚪ Optional     | Fallback language when using `TranslaasService.t()` without an explicit lang                                                               |
| `languageResolver`          | ⚪ Optional     | Resolves language for `t()` when `lang` is omitted (`@translaas/extensions`)                                                               |
| `cacheMode`                 | ⚪ Optional     | Client cache mode (`CacheMode.None`, `Entry`, `Group`, `Project`)                                                                          |
| `cacheAbsoluteExpiration`   | ⚪ Optional     | Absolute cache TTL (ms)                                                                                                                    |
| `cacheSlidingExpiration`    | ⚪ Optional     | Sliding cache TTL (ms)                                                                                                                     |
| `timeout`                   | ⚪ Optional     | HTTP request timeout (ms)                                                                                                                  |
| `offlineCache`              | ⚪ Optional     | File / hybrid offline cache options (`OfflineCacheOptions` in `@translaas/models`)                                                         |

### Project ID and API key scoping

- **Project-scoped keys:** the backend may infer the project from the key; you may omit `defaultProjectId` and explicit `project` on **text** in some setups.
- **Tenant / multi-project keys:** the **text** endpoint expects a **`project`** query param. Set **`defaultProjectId`** or pass **`project`** as the sixth argument to **`getEntryAsync`**, or use the matching overload on **`TranslaasService.t()`**.

Group, project, and locales methods always take **`project`** as the first parameter.

### Channel, version snapshot, and `includeContext`

Use **`defaultSdkQuery`** on `TranslaasOptions` and/or the optional **`sdkQuery`** argument on **`getGroupAsync`**, **`getProjectAsync`**, **`getProjectLocalesAsync`**, and **`getOfflineCacheZipAsync`** to pass:

- **`channel`** — deployment channel (e.g. `production` / `staging`)
- **`v`** — snapshot / content version string
- **`includeContext`** — request entry context maps on **group**, **project**, and **offline-cache** responses when the API supports it

Responses are parsed for both nested JSON and **`format=flat-json`** shapes where applicable.

### Configuration from Environment Variables

```bash
# .env file
TRANSLAAS_API_KEY=your-api-key
TRANSLAAS_BASE_URL=https://api.translaas.com
TRANSLAAS_CACHE_MODE=Group
TRANSLAAS_DEFAULT_LANGUAGE=en
```

```typescript
import { TranslaasService, TranslaasOptions, CacheMode } from '@translaas/core';

const options: TranslaasOptions = {
  apiKey: process.env.TRANSLAAS_API_KEY!,
  baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
  cacheMode: (process.env.TRANSLAAS_CACHE_MODE as CacheMode) || CacheMode.None,
  defaultLanguage: process.env.TRANSLAAS_DEFAULT_LANGUAGE,
};

const translaas = new TranslaasService(options);
```

**Note:** `apiKey` should be stored in environment variables or secure configuration, not in source code.

## Usage Examples

### Get Single Translation Entry

**Using TranslaasService (Convenience API):**

```typescript
import { LanguageCodes } from '@translaas/core';

// Basic usage with explicit language
const translation = await translaas.t('ui', 'button.save', LanguageCodes.English);

// Automatic language resolution (requires providers configured)
const translationAuto = await translaas.t('ui', 'button.save'); // lang omitted

// With pluralization
const message = await translaas.t('messages', 'item.count', LanguageCodes.English, 5);
```

**Using TranslaasClient (Full API):**

```typescript
import { LanguageCodes } from '@translaas/core';

// Basic usage
const translation = await client.getEntryAsync('ui', 'button.save', LanguageCodes.English);

// With pluralization
const message = await client.getEntryAsync(
  'messages',
  'item.count',
  LanguageCodes.English,
  5 // Used for pluralization rules
);
```

## Environment Compatibility

The SDK supports multiple JavaScript environments:

| Environment | Compatible With                |
| ----------- | ------------------------------ |
| Node.js     | Node.js 18+ (native fetch API) |
| Browser     | Modern browsers (ES2020+)      |
| Deno        | Deno 1.0+                      |
| Bun         | Bun 1.0+                       |

The SDK uses native `fetch` API when available (Node.js 18+), or provides polyfills for older environments.

## Error Handling

```typescript
import { TranslaasApiException, LanguageCodes } from '@translaas/core';

try {
  const translation = await client.getEntryAsync('group', 'entry', LanguageCodes.English);
} catch (error) {
  if (error instanceof TranslaasApiException) {
    // Handle Translaas-specific errors
    console.error(`Error: ${error.message}`);
    console.error(`Status Code: ${error.statusCode}`);
  } else if (error instanceof Error) {
    // Handle other errors
    console.error(`Error: ${error.message}`);
  }
}
```

## Development

### Building from Source

```bash
git clone https://github.com/acuencadev/translaas-sdk-js.git
cd translaas-sdk-js
npm install
npm run build
```

### Running Tests

```bash
npm test
```

## API Endpoints

The SDK targets the Translaas **SDK HTTP API** (default path prefix **`/sdk/v1/translations`**). Override with `TranslaasOptions.sdkTranslationsPathPrefix` if your deployment still uses a legacy prefix.

| Endpoint                              | Method | Purpose                                     |
| ------------------------------------- | ------ | ------------------------------------------- |
| `/sdk/v1/translations/text`           | GET    | Get a single translation (`text/plain`)     |
| `/sdk/v1/translations/group`          | GET    | Get all entries in a group (JSON)           |
| `/sdk/v1/translations/project`        | GET    | Get all groups for a project (JSON)         |
| `/sdk/v1/translations/locales`        | GET    | Get available locales for a project (JSON)  |
| `/sdk/v1/translations/report-missing` | POST   | Report missing keys (JSON body, `202`)      |
| `/sdk/v1/translations/offline-cache`  | GET    | Download offline bundle (`application/zip`) |
| `/api/v1/api-keys/validate`           | GET    | Validate API key (not under `/sdk/`)        |

**Note:** Translation GET endpoints use query parameters and the `X-Api-Key` header. The text endpoint returns plain text; other translation endpoints return JSON.

The HTTP client does not yet send conditional headers (`If-None-Match` / `ETag`) or interpret **`304 Not Modified`**; caching is handled in-process via **`TranslaasOptions.cacheMode`** and related TTL fields.

### Validate API key, report missing keys, offline bundle

Use **`TranslaasClient`** (also available when you only import **`@translaas/core`**, which re-exports the client package):

```typescript
// GET /api/v1/api-keys/validate — connectivity / bootstrap
const validation = await client.validateApiKeyAsync();
// validation.tenantId, validation.projectId (if scoped), etc.

// POST /sdk/v1/translations/report-missing — 202 Accepted (requires project-scoped key on the server)
await client.reportMissingKeysAsync({
  keys: [{ groupKey: 'ui', entryKey: 'new.label', languageIsoCode: 'en' }],
});

// GET /sdk/v1/translations/offline-cache — ZIP as ArrayBuffer
const zipBytes = await client.getOfflineCacheZipAsync('my-project-slug', {
  channel: 'production',
  v: '2025-01-01',
});
```

## Authentication

The SDK uses API key authentication via the `X-Api-Key` header. Provide your API key during client creation:

```typescript
const options: TranslaasOptions = {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.translaas.com',
};
```

## Examples

Standalone sample applications (Node.js, Express, Next.js, browser, and similar) live in **[translaas-sdk-examples](https://github.com/acuencadev/translaas-sdk-examples)**.

For minimal usage inside your own project, see **Quick Start** and **Configuration** above. Framework helpers ship in **`@translaas/extensions`** (Express, Next.js, and related tooling).

## API documentation

Generate the HTML API reference locally with [TypeDoc](https://typedoc.org/) (output is written to `docs/api/`, which is gitignored):

```bash
npm install
npm run docs
```

Open `docs/api/index.html` in a browser.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Translaas SDK Contributors

## Support

- **Documentation**: [Link to full documentation]
- **Issues**: [https://github.com/acuencadev/translaas-sdk-js/issues]
- **API Reference**: [Swagger/API Docs URL]

## Contributing

We welcome contributions to the Translaas SDK! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- How to get started
- Development guidelines and code style
- Pull request process
- Commit message conventions
- Reporting issues

For more information, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

**Made with ❤️ for the JavaScript/TypeScript community**
