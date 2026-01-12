#!/usr/bin/env node
/**
 * Adds .js extensions to relative imports in ES module files
 * Node.js ES modules require explicit file extensions for relative imports
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively process all .js files in a directory and add .js extensions to relative imports
 */
function fixImports(dir, relativePath = '') {
  const dirPath = path.join(dir, relativePath);
  
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    const relativeEntryPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      fixImports(dir, relativeEntryPath);
    } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.cjs')) {
      // Only process .js files, not .cjs files
      let content = fs.readFileSync(entryPath, 'utf-8');
      let modified = false;

      // Fix export * from './module' -> export * from './module.js'
      content = content.replace(
        /export\s+\*\s+from\s+['"](\.\/[^'"]+)['"]/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
            modified = true;
            const quote = match.includes("'") ? "'" : '"';
            return `export * from ${quote}${importPath}.js${quote}`;
          }
          return match;
        }
      );

      // Fix export { ... } from './module' -> export { ... } from './module.js'
      content = content.replace(
        /export\s+(\{[^}]*\})\s+from\s+['"](\.\/[^'"]+)['"]/g,
        (match, exports, importPath) => {
          if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
            modified = true;
            const quote = match.includes("'") ? "'" : '"';
            return `export ${exports} from ${quote}${importPath}.js${quote}`;
          }
          return match;
        }
      );

      // Fix import ... from './module' -> import ... from './module.js'
      content = content.replace(
        /import\s+(.+?)\s+from\s+['"](\.\/[^'"]+)['"]/g,
        (match, imports, importPath) => {
          if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
            modified = true;
            const quote = match.includes("'") ? "'" : '"';
            return `import ${imports} from ${quote}${importPath}.js${quote}`;
          }
          return match;
        }
      );

      if (modified) {
        fs.writeFileSync(entryPath, content, 'utf-8');
        console.log(`Fixed imports in: ${relativeEntryPath}`);
      }
    }
  }
}

// Get target directory from command line argument or use default
const targetDir = process.argv[2] || path.join(process.cwd(), 'dist');

if (!fs.existsSync(targetDir)) {
  console.error(`Error: Directory not found at ${targetDir}`);
  process.exit(1);
}

try {
  fixImports(targetDir);
  console.log(`✓ Successfully fixed ES module imports in ${targetDir}`);
} catch (error) {
  console.error('Error fixing ES module imports:', error);
  process.exit(1);
}
