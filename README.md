# Translaas SDK

![Tests](https://github.com/acuencadev/translaas-sdk-js/workflows/CI/badge.svg)

A strongly-typed, performant, and modular JavaScript/TypeScript SDK for consuming the **Translaas Translation Delivery API**. This SDK provides a clean, easy-to-use way to retrieve translations in your Node.js, browser, and modern JavaScript applications.

## Features

- ✅ **Strongly-typed API** - Full TypeScript support with IntelliSense and type safety
- ✅ **Convenience API** - Simple `t()` method for quick translation lookups via `TranslaasService`
- ✅ **Automatic Language Resolution** - Optional language parameter with configurable providers (HTTP request, browser locale, default)
- ✅ **Framework Integrations** - Express.js, Next.js, and other framework integrations
- ✅ **Flexible Caching** - Built-in memory caching with configurable cache modes
- ✅ **Offline Caching** - File-based caching for offline mode with automatic sync (Node.js) or browser storage (browser)
- ✅ **Hybrid Caching** - Two-level caching (memory L1 + file L2) for optimal performance
- ✅ **Multi-Environment Support** - Works in Node.js, browsers, and modern JavaScript runtimes
- ✅ **Retry & Resilience** - Configurable retry policies and timeouts
- ✅ **Modular Design** - Use only what you need with separate npm packages
- ✅ **Async/Await** - Fully asynchronous API for optimal performance
- ✅ **ES Modules** - Native ES module support with CommonJS compatibility

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
  baseUrl: 'https://api.translaas.com',
};

const client = new TranslaasClient(options);

// Get a single translation entry
const translation = await client.getEntryAsync('common', 'welcome', 'en');
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

const options: TranslaasOptions = {
  // Required: API key and base URL
  apiKey: 'your-api-key',
  baseUrl: 'https://api.translaas.com',

  // Optional: Default language fallback
  defaultLanguage: LanguageCodes.English,

  // Optional: Caching configuration
  cacheMode: CacheMode.Group,
  cacheAbsoluteExpiration: 3600000, // 1 hour in milliseconds
  cacheSlidingExpiration: 900000, // 15 minutes in milliseconds

  // Optional: HTTP Client timeout
  timeout: 30000, // 30 seconds in milliseconds
};

const translaas = new TranslaasService(options);
```

**Configuration Options:**

| Option                    | Required        | Description                                                                                |
| ------------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `apiKey`                  | ✅ **Required** | Your Translaas API key                                                                     |
| `baseUrl`                 | ✅ **Required** | Base URL for the Translaas API (do NOT include `/api`)                                     |
| `defaultLanguage`         | ⚪ Optional     | Default language code fallback (e.g., `LanguageCodes.English`)                             |
| `cacheMode`               | ⚪ Optional     | Caching mode (`CacheMode.None`, `CacheMode.Entry`, `CacheMode.Group`, `CacheMode.Project`) |
| `cacheAbsoluteExpiration` | ⚪ Optional     | Absolute cache expiration time (milliseconds)                                              |
| `cacheSlidingExpiration`  | ⚪ Optional     | Sliding cache expiration time (milliseconds)                                               |
| `timeout`                 | ⚪ Optional     | HTTP client timeout (milliseconds)                                                         |

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
const translation = await translaas.t('ui', 'button.save'); // lang omitted

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

The SDK communicates with the following Translaas API endpoints:

| Endpoint                    | Method | Purpose                             |
| --------------------------- | ------ | ----------------------------------- |
| `/api/translations/text`    | GET    | Get single translation entry        |
| `/api/translations/group`   | GET    | Get all translations for a group    |
| `/api/translations/project` | GET    | Get all translations for a project  |
| `/api/translations/locales` | GET    | Get available locales for a project |

**Note:** All endpoints use GET requests with JSON request bodies.

## Authentication

The SDK uses API key authentication via the `X-Api-Key` header. Provide your API key during client creation:

```typescript
const options: TranslaasOptions = {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.translaas.com',
};
```

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
