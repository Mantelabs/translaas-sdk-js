#!/usr/bin/env node

/**
 * Node.js Example - Translaas SDK
 *
 * This script runs all example demonstrations:
 * - Basic usage
 * - Caching
 * - Error handling
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Translaas SDK - Node.js Examples\n');
console.log('='.repeat(50));

// Run examples sequentially
const examples = [
  { name: 'Basic Usage', file: 'examples/basic-usage.js' },
  { name: 'Caching', file: 'examples/caching.js' },
  { name: 'Error Handling', file: 'examples/error-handling.js' },
];

for (const example of examples) {
  console.log(`\n📖 Running: ${example.name}`);
  console.log('-'.repeat(50));
  try {
    const examplePath = join(__dirname, example.file);
    readFileSync(examplePath, 'utf-8');
    // Note: In a real scenario, you'd import and run the module
    // For this example, we'll just indicate what would run
    console.log(`✅ ${example.name} example loaded`);
  } catch (error) {
    console.error(`❌ Error loading ${example.name}:`, error.message);
  }
}

console.log('\n' + '='.repeat(50));
console.log('💡 Tip: Run individual examples with:');
console.log('   npm run basic');
console.log('   npm run caching');
console.log('   npm run error-handling');
console.log('\n');
