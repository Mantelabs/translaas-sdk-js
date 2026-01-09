# Translaas SDK Examples

This directory contains example applications demonstrating how to use the Translaas SDK in different environments and frameworks.

## Available Examples

### 📦 [Node.js Example](nodejs/)

Basic Node.js application demonstrating:

- Simple translation lookups
- Caching strategies (memory, file, hybrid)
- Error handling patterns
- Configuration best practices

**Quick Start:**

```bash
cd nodejs
npm install
npm start
```

### 🚀 [Express.js Example](express/)

Express.js server demonstrating:

- Middleware integration
- Automatic language resolution from HTTP requests
- API route handlers with translations
- Request-based language detection

**Quick Start:**

```bash
cd express
npm install
npm start
```

### ⚛️ [Next.js Example](nextjs/)

Next.js application demonstrating:

- Server-side rendering (SSR) with translations
- Client-side rendering (CSR) with translations
- React components using translations
- API routes with translations

**Quick Start:**

```bash
cd nextjs
npm install
npm run dev
```

### 🌐 [Browser Example](browser/)

Vanilla JavaScript browser application demonstrating:

- Browser environment integration
- localStorage-based caching
- Browser language detection
- Dynamic translation updates

**Quick Start:**

```bash
cd browser
npm install
npm start
```

## Prerequisites

All examples require:

- Node.js 20.19.0 or higher
- A Translaas API key
- Translaas API base URL

## Configuration

Each example includes instructions for configuration. Generally, you'll need to:

1. Set up environment variables (`.env` file)
2. Provide your Translaas API key
3. Configure the base URL

## Common Use Cases

### Basic Translation

```typescript
import { TranslaasService } from '@translaas/core';

const service = new TranslaasService({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.translaas.com',
  defaultLanguage: 'en',
});

const translation = await service.t('common', 'welcome', 'en');
```

### With Caching

```typescript
import { TranslaasService, CacheMode } from '@translaas/core';

const service = new TranslaasService({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.translaas.com',
  cacheMode: CacheMode.Group,
  cacheAbsoluteExpiration: 3600000, // 1 hour
});
```

### With Language Resolution

```typescript
import { TranslaasService } from '@translaas/core';
import {
  LanguageResolver,
  RequestLanguageProvider,
  DefaultLanguageProvider,
} from '@translaas/extensions';

const service = new TranslaasService({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.translaas.com',
  languageResolver: new LanguageResolver([
    new RequestLanguageProvider(req),
    new DefaultLanguageProvider('en'),
  ]),
});
```

## Learn More

- [SDK Documentation](../README.md)
- [API Reference](../docs/api/)
- [Configuration Guide](../.docs/CONFIGURATION.md)
- [Contributing Guide](../CONTRIBUTING.md)

## Need Help?

- Check the individual example README files for detailed instructions
- Review the [SDK documentation](../README.md)
- Open an [issue](https://github.com/acuencadev/translaas-sdk-js/issues) if you encounter problems
