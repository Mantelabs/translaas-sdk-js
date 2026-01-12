import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import type { FileCacheProvider } from '@translaas/caching-file';
import type { MemoryCacheProvider } from '@translaas/caching';
import type { HybridCacheProvider } from '@translaas/caching-file';

/**
 * Test helpers for integration tests
 */

/**
 * Creates a temporary directory for file cache tests
 */
export async function createTempCacheDir(): Promise<string> {
  const tempDir = join(tmpdir(), 'translaas-test-cache', randomUUID());
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Cleans up a temporary cache directory
 */
export async function cleanupTempCacheDir(cacheDir: string): Promise<void> {
  try {
    await fs.rm(cacheDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
    console.warn(`Failed to cleanup temp cache dir: ${cacheDir}`, error);
  }
}

/**
 * Waits for a specified amount of time
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a test cache provider with cleanup
 */
export interface CacheProviderTestHelper<T> {
  provider: T;
  cleanup: () => Promise<void>;
}

/**
 * Helper to create and cleanup file cache providers
 */
export async function createFileCacheProvider(): Promise<
  CacheProviderTestHelper<FileCacheProvider>
> {
  const { FileCacheProvider } = await import('@translaas/caching-file');
  const cacheDir = await createTempCacheDir();
  const provider = new FileCacheProvider(cacheDir);

  return {
    provider,
    cleanup: () => cleanupTempCacheDir(cacheDir),
  };
}

/**
 * Helper to create memory cache providers
 */
export async function createMemoryCacheProvider(): Promise<
  CacheProviderTestHelper<MemoryCacheProvider>
> {
  const { MemoryCacheProvider } = await import('@translaas/caching');
  const provider = new MemoryCacheProvider();

  return {
    provider,
    cleanup: async () => {
      provider.clear();
    },
  };
}

/**
 * Helper to create hybrid cache providers
 */
export async function createHybridCacheProvider(): Promise<
  CacheProviderTestHelper<HybridCacheProvider>
> {
  const { HybridCacheProvider } = await import('@translaas/caching-file');
  const fileCacheHelper = await createFileCacheProvider();

  const provider = new HybridCacheProvider(fileCacheHelper.provider, {
    enabled: true,
    maxMemoryCacheEntries: 100,
  });

  return {
    provider,
    cleanup: fileCacheHelper.cleanup,
  };
}

/**
 * Asserts that a promise rejects with a specific error type
 */
export async function expectRejection<T extends Error>(
  promise: Promise<unknown>,
  errorClass: new (...args: unknown[]) => T
): Promise<T> {
  try {
    await promise;
    throw new Error(`Expected promise to reject with ${errorClass.name}, but it resolved`);
  } catch (error) {
    if (error instanceof errorClass) {
      return error;
    }
    throw error;
  }
}
