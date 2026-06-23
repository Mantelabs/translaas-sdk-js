import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  findSiblingDependencyViolations,
  syncSiblingDependencies,
  validateSiblingDependencies,
} from '../sync-sibling-dependencies.mjs';

const tempDirs = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

function createTempPackages(packages) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'translaas-sync-deps-'));
  tempDirs.push(root);

  for (const [dirName, pkg] of Object.entries(packages)) {
    const packageDir = path.join(root, dirName);
    mkdirSync(packageDir, { recursive: true });
    writeFileSync(path.join(packageDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  }

  return root;
}

describe('syncSiblingDependencies', () => {
  it('replaces wildcard sibling dependencies with exact versions', () => {
    const packagesDir = createTempPackages({
      models: {
        name: '@translaas/models',
        version: '1.2.3',
      },
      core: {
        name: '@translaas/core',
        version: '1.2.3',
        dependencies: {
          '@translaas/models': '*',
        },
      },
    });

    const { updated } = syncSiblingDependencies(packagesDir);
    const core = JSON.parse(readFileSync(path.join(packagesDir, 'core/package.json'), 'utf8'));

    expect(updated).toEqual(['@translaas/core']);
    expect(core.dependencies['@translaas/models']).toBe('1.2.3');
  });

  it('updates stale pinned versions during coordinated releases', () => {
    const packagesDir = createTempPackages({
      models: {
        name: '@translaas/models',
        version: '2.0.0',
      },
      client: {
        name: '@translaas/client',
        version: '2.0.0',
        dependencies: {
          '@translaas/models': '1.9.0',
        },
      },
    });

    syncSiblingDependencies(packagesDir);
    const client = JSON.parse(readFileSync(path.join(packagesDir, 'client/package.json'), 'utf8'));

    expect(client.dependencies['@translaas/models']).toBe('2.0.0');
  });

  it('does not write files in dry-run mode', () => {
    const packagesDir = createTempPackages({
      models: {
        name: '@translaas/models',
        version: '1.0.0',
      },
      core: {
        name: '@translaas/core',
        version: '1.0.0',
        dependencies: {
          '@translaas/models': '*',
        },
      },
    });

    const original = readFileSync(path.join(packagesDir, 'core/package.json'), 'utf8');
    syncSiblingDependencies(packagesDir, { dryRun: true });
    const afterDryRun = readFileSync(path.join(packagesDir, 'core/package.json'), 'utf8');

    expect(afterDryRun).toBe(original);
  });
});

describe('validateSiblingDependencies', () => {
  it('reports wildcard and stale sibling dependency ranges', () => {
    const packagesDir = createTempPackages({
      models: {
        name: '@translaas/models',
        version: '3.1.0',
      },
      core: {
        name: '@translaas/core',
        version: '3.1.0',
        dependencies: {
          '@translaas/models': '*',
        },
      },
      client: {
        name: '@translaas/client',
        version: '3.1.0',
        dependencies: {
          '@translaas/models': '3.0.0',
        },
      },
    });

    const violations = validateSiblingDependencies(packagesDir);

    expect(violations).toHaveLength(2);
    expect(violations.map((v) => v.packageName).sort()).toEqual([
      '@translaas/client',
      '@translaas/core',
    ]);
  });
});

describe('findSiblingDependencyViolations', () => {
  it('ignores non-sibling dependencies', () => {
    const violations = findSiblingDependencyViolations(
      {
        name: '@translaas/client',
        dependencies: {
          zod: '^3.0.0',
        },
      },
      new Map([['@translaas/models', '1.0.0']]),
    );

    expect(violations).toEqual([]);
  });
});
