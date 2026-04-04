# Integration Tests

This directory contains integration tests for the Translaas SDK that test end-to-end functionality with a mocked API server.

## Overview

Integration tests verify that all SDK components work together correctly:

- **Client** - HTTP client making API requests
- **Service** - High-level service with language resolution
- **Cache Providers** - Memory, file, and hybrid caching
- **Language Resolvers** - Language detection and resolution
- **Error Handling** - API failures, network errors, timeouts

## Test Structure

```
tests/
├── integration/           # Integration test files
│   ├── basic-translation.test.ts
│   ├── caching-workflows.test.ts
│   ├── language-resolution.test.ts
│   ├── error-scenarios.test.ts
│   ├── full-stack.test.ts
│   └── offline-cache.test.ts
├── setup/                 # Test setup and utilities
│   ├── mock-api.ts        # MSW mock API server
│   └── test-helpers.ts    # Test helper functions
└── fixtures/              # Test data fixtures
    └── translation-data.ts
```

## Running Tests

### Run all integration tests

```bash
npm run test:integration
```

### Run integration tests in watch mode

```bash
npm run test:integration:watch
```

### Run all tests (unit + integration)

```bash
npm run test:all
```

### Run specific test file

```bash
npx vitest run --config vitest.config.integration.ts tests/integration/basic-translation.test.ts
```

## Mock API Server

The integration tests use [MSW (Mock Service Worker)](https://mswjs.io/) to mock the Translaas API. The mock server is configured in `tests/setup/mock-api.ts` and provides handlers for:

- `GET /sdk/v1/translations/text` - Single translation entry
- `GET /sdk/v1/translations/group` - Translation group
- `GET /sdk/v1/translations/project` - Translation project
- `GET /sdk/v1/translations/locales` - Project locales

### Mock API Configuration

```typescript
import { createMockServer } from '../setup/mock-api';

const server = createMockServer({
  baseUrl: 'https://api.test.translaas.com',
  apiKey: 'test-api-key',
  delay: 10, // Simulate network delay
});
```

## Test Categories

### Basic Translation Flow (`basic-translation.test.ts`)

Tests the core translation functionality:

- Fetching single entries
- Fetching groups and projects
- Parameter substitution
- Pluralization
- Multiple languages

### Caching Workflows (`caching-workflows.test.ts`)

Tests caching integration:

- Memory cache provider
- File cache provider
- Hybrid cache (L1 + L2)
- Cache expiration (absolute and sliding)
- Cache invalidation

### Language Resolution (`language-resolution.test.ts`)

Tests language detection and resolution:

- Language resolver chaining
- Default language fallback
- Provider priority
- Error handling in providers

### Error Scenarios (`error-scenarios.test.ts`)

Tests error handling:

- API errors (404, 500, 401)
- Network errors
- Request timeouts
- Cancellation
- Invalid configuration
- Malformed responses

### Full Stack Integration (`full-stack.test.ts`)

Tests complete component integration:

- Client + Memory Cache integration
- Client + File Cache integration
- Client + Hybrid Cache integration
- Service + Language Resolver + Cache integration
- End-to-end workflows with multiple components

### Offline Cache Workflows (`offline-cache.test.ts`)

Tests offline and cache fallback scenarios:

- Cache-only mode (offline mode)
- API failure with cache fallback
- Cache-first vs API-first strategies
- Offline cache invalidation
- Service integration with offline cache

## Writing New Integration Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { TranslaasClient } from '@translaas/client';
import { createMockServer, type MockApiConfig } from '../setup/mock-api';
import { createTestClientOptions } from '../fixtures/translation-data';

describe('My Feature', () => {
  const mockConfig: MockApiConfig = {
    baseUrl: 'https://api.test.translaas.com',
    apiKey: 'test-api-key',
  };

  const server = createMockServer(mockConfig);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should test something', async () => {
    const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
    const result = await client.getEntryAsync('common', 'welcome', 'en');
    expect(result).toBe('Welcome');
  });
});
```

### Using Test Helpers

```typescript
import { createFileCacheProvider, delay } from '../setup/test-helpers';

it('should use file cache', async () => {
  const { provider: cache, cleanup } = await createFileCacheProvider();
  try {
    // Test cache operations
  } finally {
    await cleanup();
  }
});
```

### Custom Mock Responses

```typescript
import { http, HttpResponse } from 'msw';

server.use(
  http.get(`${mockConfig.baseUrl}/sdk/v1/translations/text`, () => {
    return HttpResponse.text('Custom response');
  })
);
```

### Using Error Handlers

```typescript
import { createErrorHandlers } from '../setup/mock-api';

const errorHandlers = createErrorHandlers(mockConfig);

// Use specific error handlers
server.use(errorHandlers.serverError);
server.use(errorHandlers.rateLimit);
server.use(errorHandlers.networkError);
```

## CI Integration

Integration tests run automatically in CI/CD pipelines via `.github/workflows/integration-tests.yml`. The tests are configured with:

- 30 second timeout per test
- Node.js environment
- Separate coverage reporting
- Automatic test execution on push/PR
- Coverage upload to Codecov (optional)

The CI workflow:

- Runs on push to main and pull requests
- Builds all packages before running tests
- Executes all integration tests
- Uploads coverage reports (if configured)

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up resources (cache directories, mock handlers)
3. **Realistic Data**: Use realistic translation data from fixtures
4. **Error Testing**: Test both success and error scenarios
5. **Performance**: Keep test execution time reasonable (< 30s per test)

## Troubleshooting

### Tests timing out

- Increase timeout in `vitest.config.integration.ts`
- Check for hanging promises or unclosed resources

### Mock API not working

- Ensure MSW server is started in `beforeAll`
- Check that handlers are registered correctly
- Verify base URL matches mock server configuration

### Cache tests failing

- Ensure temp directories are cleaned up
- Check file system permissions
- Verify cache provider implementations

## Related Documentation

- [Unit Tests](../packages/@translaas/*/src/**/*.test.ts) - Component-level tests
- [API Documentation](../../docs/api/) - SDK API reference
- [Contributing Guide](../../CONTRIBUTING.md) - Development guidelines
