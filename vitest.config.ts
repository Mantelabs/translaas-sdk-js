import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
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
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: [
      '**/*.test.ts',
      '**/*.test.mjs',
      '**/*.spec.ts',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.mjs',
    ],
    exclude: ['node_modules', 'dist', 'coverage'],
  },
});
