#!/usr/bin/env node
/**
 * Copies CommonJS build files from dist-cjs to dist, renaming .js to .cjs
 * This script is used to create dual package exports (ESM/CJS)
 */

const fs = require('fs');
const path = require('path');

const distCjsDir = path.join(process.cwd(), 'dist-cjs');
const distDir = path.join(process.cwd(), 'dist');

if (!fs.existsSync(distCjsDir)) {
  console.error(`Error: dist-cjs directory not found at ${distCjsDir}`);
  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

/**
 * Recursively copy files from srcDir to destDir, renaming .js to .cjs
 */
function copyAndRename(srcDir, destDir, relativePath = '') {
  const srcPath = path.join(srcDir, relativePath);
  const destPath = path.join(destDir, relativePath);

  const entries = fs.readdirSync(srcPath, { withFileTypes: true });

  for (const entry of entries) {
    const srcEntryPath = path.join(srcPath, entry.name);
    const relativeEntryPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      const destEntryPath = path.join(destDir, relativeEntryPath);
      if (!fs.existsSync(destEntryPath)) {
        fs.mkdirSync(destEntryPath, { recursive: true });
      }
      copyAndRename(srcDir, destDir, relativeEntryPath);
    } else if (entry.isFile()) {
      // Only process .js files (skip .d.ts, .map, etc.)
      if (entry.name.endsWith('.js')) {
        const cjsName = entry.name.replace(/\.js$/, '.cjs');
        const destEntryPath = path.join(destDir, relativePath, cjsName);
        fs.copyFileSync(srcEntryPath, destEntryPath);
        console.log(`Copied: ${relativeEntryPath} -> ${path.join(relativePath, cjsName)}`);
      }
    }
  }
}

try {
  copyAndRename(distCjsDir, distDir);
  console.log('✓ Successfully copied CommonJS files');
} catch (error) {
  console.error('Error copying CommonJS files:', error);
  process.exit(1);
}
