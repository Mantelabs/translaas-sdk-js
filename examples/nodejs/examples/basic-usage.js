/**
 * Basic Usage Example
 *
 * Demonstrates basic translation lookups using TranslaasService
 * Matches the C# console sample flow
 */

import 'dotenv/config';
import { TranslaasService, TranslaasClient, CacheMode } from '@translaas/core';

async function main() {
  console.log('=== Translaas SDK Node.js Sample ===\n');

  const projectId = process.env.TRANSLAAS_PROJECT || 'translaas-sdk-samples';
  const defaultLanguage = process.env.TRANSLAAS_DEFAULT_LANGUAGE || 'en';

  // Initialize the service
  const service = new TranslaasService({
    apiKey: process.env.TRANSLAAS_API_KEY,
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
    defaultProjectId: projectId,
    defaultLanguage,
    cacheMode: CacheMode.Group,
    cacheAbsoluteExpiration: 3600000, // 1 hour
    cacheSlidingExpiration: 1800000, // 30 minutes
    timeout: 30000, // 30 seconds
  });

  // Also get client for bulk operations
  const client = new TranslaasClient({
    apiKey: process.env.TRANSLAAS_API_KEY,
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
    defaultProjectId: projectId,
  });

  console.log(`Default Language (from .env): ${defaultLanguage}\n`);

  try {
    // Example 1: Using TranslaasService with default language
    console.log('Example 1: Using TranslaasService.t() with default language');
    const translation1 = await service.t('common', 'welcome'); // Uses default language
    console.log(`Translation (default language '${defaultLanguage}'): ${translation1}\n`);

    // Example 1b: Override with explicit language
    console.log('Example 1b: Override with explicit language');
    const translation1b = await service.t('common', 'welcome', 'en'); // Explicit override
    console.log(`Translation (explicit override to 'en'): ${translation1b}\n`);

    // Example 2: Pluralization with default language
    console.log('Example 2: Pluralization with default language');
    const translation2a = await service.t('messages', 'item', undefined, 1); // Uses default language
    const translation2b = await service.t('messages', 'item', undefined, 5); // Uses default language
    console.log(`1 item (default language '${defaultLanguage}'): ${translation2a}`);
    console.log(`5 items (default language '${defaultLanguage}'): ${translation2b}\n`);

    // Example 2b: Pluralization with override
    console.log('Example 2b: Pluralization with language override');
    const translation2c = await service.t('messages', 'item', 'en', 1); // Explicit override
    const translation2d = await service.t('messages', 'item', 'en', 5); // Explicit override
    console.log(`1 item (override to 'en'): ${translation2c}`);
    console.log(`5 items (override to 'en'): ${translation2d}\n`);

    // Example 3: Named Parameters with default language
    console.log('Example 3: Named Parameters with default language');
    const parameters = {
      userName: 'John',
      itemCount: '5',
    };
    const translation3 = await service.t('messages', 'greeting', undefined, undefined, parameters); // Uses default language
    console.log(
      `Translation with parameters (default language '${defaultLanguage}'): ${translation3}\n`
    );

    // Example 3b: Named Parameters with override
    console.log('Example 3b: Named Parameters with language override');
    const translation3b = await service.t('messages', 'greeting', 'en', undefined, parameters); // Explicit override
    console.log(`Translation with parameters (override to 'en'): ${translation3b}\n`);

    // Example 4: Combining Number and Named Parameters with default language
    console.log('Example 4: Combining Number and Named Parameters with default language');
    const translation4 = await service.t('messages', 'items', undefined, 5, parameters); // Uses default language
    console.log(
      `Translation with number and parameters (default language '${defaultLanguage}'): ${translation4}\n`
    );

    // Example 4b: Combining Number and Named Parameters with override
    console.log('Example 4b: Combining Number and Named Parameters with language override');
    const translation4b = await service.t('messages', 'items', 'en', 5, parameters); // Explicit override
    console.log(`Translation with number and parameters (override to 'en'): ${translation4b}\n`);

    // Example 5: Get multiple entries using .t() helper with default language
    console.log('Example 5: Get multiple entries using .t() helper with default language');
    const appName = await service.t('common', 'app.name'); // Uses default language
    const welcome = await service.t('common', 'welcome'); // Uses default language
    const welcomeMessage = await service.t('common', 'welcome.message'); // Uses default language
    console.log(`App Name (default language '${defaultLanguage}'): ${appName}`);
    console.log(`Welcome (default language '${defaultLanguage}'): ${welcome}`);
    console.log(`Message (default language '${defaultLanguage}'): ${welcomeMessage}\n`);

    // Example 5b: Get multiple entries with override
    console.log('Example 5b: Get multiple entries with language override');
    const appNameOverride = await service.t('common', 'app.name', 'en'); // Explicit override
    const welcomeOverride = await service.t('common', 'welcome', 'en'); // Explicit override
    console.log(`App Name (override to 'en'): ${appNameOverride}`);
    console.log(`Welcome (override to 'en'): ${welcomeOverride}\n`);

    // Example 6: Get entire translation group (bulk operation) with default language
    console.log('Example 6: Get entire translation group (bulk operation) with default language');
    console.log('Note: GetGroupAsync() retrieves all entries in a group at once.');
    console.log('Use this when you need multiple entries, or use .t() for individual entries.\n');
    const groupName = 'common';
    const group = await client.getGroupAsync(projectId, groupName, defaultLanguage); // Uses default language

    console.log(
      `Group '${groupName}' contains ${Object.keys(group.entries).length} translation entries:`
    );
    for (const [key, value] of Object.entries(group.entries)) {
      console.log(`  ${key}: ${value}`);
    }
    console.log();

    // Example 7: Get project locales
    console.log('Example 7: Get available locales');
    const locales = await client.getProjectLocalesAsync(projectId);
    console.log(`Available locales: ${locales.locales.join(', ')}\n`);

    // Example 8: Caching demonstration with default language
    console.log('Example 8: Caching demonstration with default language');
    console.log('First call (cache miss):');
    const start1 = Date.now();
    await service.t('common', 'welcome'); // Uses default language
    const duration1 = Date.now() - start1;
    console.log(`Duration: ${duration1}ms`);

    console.log('Second call (cache hit):');
    const start2 = Date.now();
    await service.t('common', 'welcome'); // Uses default language
    const duration2 = Date.now() - start2;
    console.log(`Duration: ${duration2}ms`);
    const speedup = duration1 / duration2;
    console.log(`Cache speedup: ${speedup.toFixed(2)}x faster\n`);

    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
}

main();
