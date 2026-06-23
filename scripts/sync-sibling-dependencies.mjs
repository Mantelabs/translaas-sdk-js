import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCOPE = '@translaas/';
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

export function listPackageJsonPaths(packagesDir) {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesDir, entry.name, 'package.json'));
}

export function readPackageVersions(packageJsonPaths) {
  const versions = new Map();

  for (const packageJsonPath of packageJsonPaths) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    versions.set(pkg.name, pkg.version);
  }

  return versions;
}

export function findSiblingDependencyViolations(pkg, versions) {
  const violations = [];

  for (const field of DEPENDENCY_FIELDS) {
    const deps = pkg[field];
    if (!deps) {
      continue;
    }

    for (const [name, range] of Object.entries(deps)) {
      if (!name.startsWith(SCOPE)) {
        continue;
      }

      const targetVersion = versions.get(name);
      if (!targetVersion) {
        violations.push({
          packageName: pkg.name,
          dependencyName: name,
          currentRange: range,
          expectedVersion: null,
          reason: 'missing sibling package version',
        });
        continue;
      }

      if (range === '*' || range !== targetVersion) {
        violations.push({
          packageName: pkg.name,
          dependencyName: name,
          currentRange: range,
          expectedVersion: targetVersion,
          reason: range === '*' ? 'wildcard sibling dependency' : 'stale sibling dependency',
        });
      }
    }
  }

  return violations;
}

export function syncSiblingDependencies(packagesDir, { dryRun = false } = {}) {
  const packageJsonPaths = listPackageJsonPaths(packagesDir);
  const versions = readPackageVersions(packageJsonPaths);
  const updated = [];

  for (const packageJsonPath of packageJsonPaths) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    let changed = false;

    for (const field of DEPENDENCY_FIELDS) {
      const deps = pkg[field];
      if (!deps) {
        continue;
      }

      for (const [name, range] of Object.entries(deps)) {
        if (!name.startsWith(SCOPE)) {
          continue;
        }

        const targetVersion = versions.get(name);
        if (!targetVersion) {
          throw new Error(
            `Unknown sibling package ${name} referenced from ${pkg.name} (${packageJsonPath})`,
          );
        }

        if (range !== targetVersion) {
          deps[name] = targetVersion;
          changed = true;
        }
      }
    }

    if (changed) {
      updated.push(pkg.name);
      if (!dryRun) {
        writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
      }
    }
  }

  return { updated, versions };
}

export function validateSiblingDependencies(packagesDir) {
  const packageJsonPaths = listPackageJsonPaths(packagesDir);
  const versions = readPackageVersions(packageJsonPaths);
  const violations = [];

  for (const packageJsonPath of packageJsonPaths) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    violations.push(...findSiblingDependencyViolations(pkg, versions));
  }

  return violations;
}

function resolvePackagesDir(customPath) {
  if (customPath) {
    return path.resolve(customPath);
  }

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  return path.join(root, 'packages/@translaas');
}

function printViolations(violations) {
  for (const violation of violations) {
    const expected =
      violation.expectedVersion === null ? 'unknown' : violation.expectedVersion;
    console.error(
      `${violation.packageName}: ${violation.dependencyName} is "${violation.currentRange}" (expected "${expected}")`,
    );
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? 'sync';
  const packagesDir = resolvePackagesDir(args[1]);

  if (command === 'validate') {
    const violations = validateSiblingDependencies(packagesDir);
    if (violations.length > 0) {
      console.error('Sibling dependency validation failed:');
      printViolations(violations);
      process.exit(1);
    }

    console.log('All @translaas/* dependencies are pinned to sibling package versions.');
    return;
  }

  if (command === 'sync') {
    const dryRun = args.includes('--dry-run');
    const { updated } = syncSiblingDependencies(packagesDir, { dryRun });

    if (updated.length === 0) {
      console.log('Sibling dependencies already pinned.');
      return;
    }

    const prefix = dryRun ? '[dry-run] Would update' : 'Updated';
    console.log(`${prefix}: ${updated.join(', ')}`);
    return;
  }

  console.error('Usage: node scripts/sync-sibling-dependencies.mjs [sync|validate] [packagesDir]');
  process.exit(1);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
