import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest configuration for optional live API integration tests.
 *
 * Requires TRANSLAAS_API_KEY. Tests skip (exit 0) when unset.
 * Not run in default PR CI — use npm run test:integration:live locally
 * or the Integration Tests GitHub Actions workflow.
 */
export default defineConfig({
  test: {
    name: 'integration-live',
    globals: true,
    environment: 'node',
    include: ['tests/integration/live/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    teardownTimeout: 15_000,
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
