/**
 * Basic Usage Example
 *
 * Demonstrates basic translation lookups using TranslaasService
 */

import 'dotenv/config';
import { TranslaasService, CacheMode } from '@translaas/core';

async function main() {
  console.log('📝 Basic Usage Example\n');

  // Initialize the service
  const service = new TranslaasService({
    apiKey: process.env.TRANSLAAS_API_KEY,
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
    defaultLanguage: 'en',
    cacheMode: CacheMode.Entry,
  });

  try {
    // Example 1: Simple translation
    console.log('1. Simple Translation:');
    const welcome = await service.t('common', 'welcome', 'en');
    console.log(`   Result: "${welcome}"\n`);

    // Example 2: Translation with parameters
    console.log('2. Translation with Parameters:');
    const greeting = await service.t('common', 'greeting', 'en', undefined, {
      name: 'Alice',
    });
    console.log(`   Result: "${greeting}"\n`);

    // Example 3: Pluralization
    console.log('3. Pluralization:');
    const items1 = await service.t('messages', 'items', 'en', 1, { count: '1' });
    const items5 = await service.t('messages', 'items', 'en', 5, { count: '5' });
    console.log(`   1 item: "${items1}"`);
    console.log(`   5 items: "${items5}"\n`);

    // Example 4: Multiple languages
    console.log('4. Multiple Languages:');
    const welcomeEn = await service.t('common', 'welcome', 'en');
    const welcomeFr = await service.t('common', 'welcome', 'fr');
    const welcomeEs = await service.t('common', 'welcome', 'es');
    console.log(`   English: "${welcomeEn}"`);
    console.log(`   French: "${welcomeFr}"`);
    console.log(`   Spanish: "${welcomeEs}"\n`);

    // Example 5: Using default language
    console.log('5. Using Default Language:');
    const defaultText = await service.t('common', 'welcome');
    console.log(`   Result (using default 'en'): "${defaultText}"\n`);

    console.log('✅ Basic usage examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
