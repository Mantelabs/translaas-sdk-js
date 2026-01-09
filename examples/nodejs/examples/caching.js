/**
 * Caching Example
 *
 * Demonstrates different caching strategies:
 * - Memory caching
 * - File-based caching
 * - Hybrid caching (L1 + L2)
 */

import 'dotenv/config';
import { TranslaasClient, CacheMode } from '@translaas/core';
import { FileCacheProvider, HybridCacheProvider } from '@translaas/caching-file';
import { MemoryCacheProvider } from '@translaas/caching';
import { join } from 'path';
import { mkdir } from 'fs/promises';

async function main() {
  console.log('💾 Caching Example\n');

  const baseOptions = {
    apiKey: process.env.TRANSLAAS_API_KEY,
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
  };

  try {
    // Example 1: Memory Cache
    console.log('1. Memory Cache:');
    const memoryCache = new MemoryCacheProvider();
    memoryCache.set('test-key', 'test-value', 5000); // 5 second expiration
    const cached = memoryCache.get('test-key');
    console.log(`   Cached value: "${cached}"`);
    console.log('   ✅ Memory cache working\n');

    // Example 2: File Cache
    console.log('2. File Cache:');
    const cacheDir = join(process.cwd(), '.translaas-cache');
    await mkdir(cacheDir, { recursive: true });
    const fileCache = new FileCacheProvider(cacheDir);
    console.log(`   Cache directory: ${cacheDir}`);
    console.log('   ✅ File cache provider created\n');

    // Example 3: Hybrid Cache (L1 Memory + L2 File)
    console.log('3. Hybrid Cache:');
    const hybridCache = new HybridCacheProvider(fileCache, {
      enabled: true,
      maxMemoryCacheEntries: 100,
      memoryCacheExpiration: 300000, // 5 minutes
    });
    console.log('   ✅ Hybrid cache provider created');
    console.log('   - L1: Memory cache (fast, limited size)');
    console.log('   - L2: File cache (persistent, larger capacity)\n');

    // Example 4: Client with caching
    console.log('4. Client with Caching:');
    const client = new TranslaasClient({
      ...baseOptions,
      cacheMode: CacheMode.Group,
      cacheAbsoluteExpiration: 3600000, // 1 hour
    });
    console.log('   ✅ Client configured with group-level caching');
    console.log('   - Cache mode: Group');
    console.log('   - Expiration: 1 hour\n');

    // Example 5: Cache expiration demonstration
    console.log('5. Cache Expiration:');
    const expiringCache = new MemoryCacheProvider();
    expiringCache.set('temp', 'value', 1000); // 1 second expiration
    console.log('   Setting value with 1 second expiration...');
    const immediate = expiringCache.get('temp');
    console.log(`   Immediate read: "${immediate}"`);
    await new Promise(resolve => setTimeout(resolve, 1100));
    const expired = expiringCache.get('temp');
    console.log(`   After expiration: ${expired === null ? 'null (expired)' : expired}`);
    console.log('   ✅ Cache expiration working\n');

    console.log('✅ Caching examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
