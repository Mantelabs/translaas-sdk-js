import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest configuration for integration tests
 *
 * Integration tests require:
 * - Node environment (for file system operations)
 * - Longer timeout (for API calls and cache operations)
 * - Separate test files pattern
 */
export default defineConfig({
  test: {
    name: 'integration',
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 30000,
    teardownTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/*.test.{ts,js}',
        '**/*.spec.{ts,js}',
        'tests/**',
      ],
      include: ['packages/**/src/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@translaas/client': resolve(__dirname, 'packages/@translaas/client/src'),
      '@translaas/models': resolve(__dirname, 'packages/@translaas/models/src'),
      '@translaas/caching': resolve(__dirname, 'packages/@translaas/caching/src'),
      '@translaas/caching-file': resolve(__dirname, 'packages/@translaas/caching-file/src'),
      '@translaas/extensions': resolve(__dirname, 'packages/@translaas/extensions/src'),
    },
  },
});
