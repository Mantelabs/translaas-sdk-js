/**
 * Error Handling Example
 *
 * Demonstrates proper error handling with the Translaas SDK
 */

import 'dotenv/config';
import { TranslaasService, TranslaasClient } from '@translaas/core';
import { TranslaasApiException, TranslaasConfigurationException } from '@translaas/models';

async function main() {
  console.log('⚠️  Error Handling Example\n');

  // Example 1: Configuration errors
  console.log('1. Configuration Errors:');
  try {
    new TranslaasService({
      apiKey: '', // Invalid: empty API key
      baseUrl: 'https://api.translaas.com',
    });
  } catch (error) {
    if (error instanceof TranslaasConfigurationException) {
      console.log(`   ✅ Caught configuration error: ${error.message}\n`);
    }
  }

  // Example 2: API errors
  console.log('2. API Errors:');
  const client = new TranslaasClient({
    apiKey: process.env.TRANSLAAS_API_KEY || 'invalid-key',
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
  });

  try {
    // This will fail if the API key is invalid or entry doesn't exist
    await client.getEntryAsync('nonexistent', 'entry', 'en');
  } catch (error) {
    if (error instanceof TranslaasApiException) {
      console.log(`   ✅ Caught API error: ${error.message}`);
      console.log(`   Status code: ${error.statusCode || 'N/A'}\n`);
    } else {
      console.log(`   ⚠️  Unexpected error: ${error.message}\n`);
    }
  }

  // Example 3: Network errors (simulated)
  console.log('3. Network Errors:');
  const invalidClient = new TranslaasClient({
    apiKey: 'test-key',
    baseUrl: 'https://nonexistent-api.example.com',
    timeout: 1000, // 1 second timeout
  });

  try {
    await invalidClient.getEntryAsync('common', 'welcome', 'en');
  } catch (error) {
    if (error instanceof TranslaasApiException) {
      console.log(`   ✅ Caught network error: ${error.message}\n`);
    } else {
      console.log(`   ⚠️  Error: ${error.message}\n`);
    }
  }

  // Example 4: Graceful fallback
  console.log('4. Graceful Fallback:');
  const service = new TranslaasService({
    apiKey: process.env.TRANSLAAS_API_KEY,
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
    defaultLanguage: 'en',
  });

  async function getTranslationWithFallback(group, entry, lang) {
    try {
      return await service.t(group, entry, lang);
    } catch (error) {
      if (error instanceof TranslaasApiException) {
        console.log(`   ⚠️  Translation failed, using fallback`);
        return `[${group}.${entry}]`; // Fallback text
      }
      throw error;
    }
  }

  const result = await getTranslationWithFallback('common', 'welcome', 'en');
  console.log(`   Result: "${result}"`);
  console.log('   ✅ Fallback mechanism working\n');

  // Example 5: Error handling best practices
  console.log('5. Best Practices:');
  console.log('   ✅ Always catch TranslaasApiException for API errors');
  console.log('   ✅ Always catch TranslaasConfigurationException for config errors');
  console.log('   ✅ Provide fallback translations when possible');
  console.log('   ✅ Log errors for debugging');
  console.log('   ✅ Handle timeouts appropriately\n');

  console.log('✅ Error handling examples completed successfully!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
