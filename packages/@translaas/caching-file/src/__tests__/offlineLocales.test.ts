import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  parseLocalesFromCacheFile,
  parseLocalesFromManifest,
  readProjectLocalesFromDisk,
} from '../offlineLocales';

describe('parseLocalesFromCacheFile', () => {
  it('reads locales from the offline-cache export wrapper', () => {
    const result = parseLocalesFromCacheFile({
      cachedAt: '2026-01-01T00:00:00.000Z',
      expiresAt: null,
      data: { locales: ['en', 'fr'] },
    });

    expect(result).toEqual(['en', 'fr']);
  });
});

describe('parseLocalesFromManifest', () => {
  it('reads languages for the configured project', () => {
    const result = parseLocalesFromManifest(
      {
        projects: {
          'translaas-frontend': { languages: ['en', 'de'] },
        },
      },
      'translaas-frontend'
    );

    expect(result).toEqual(['en', 'de']);
  });
});

describe('readProjectLocalesFromDisk', () => {
  it('prefers locales.json over directory scan', async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), 'translaas-locales-'));
    const project = 'translaas-frontend';
    const projectDir = join(cacheDir, project);

    try {
      await mkdir(join(projectDir, 'en'), { recursive: true });
      await writeFile(join(projectDir, 'en', 'project.json'), '{}');
      await writeFile(
        join(projectDir, 'locales.json'),
        JSON.stringify({ data: { locales: ['en', 'fr'] } })
      );

      const result = await readProjectLocalesFromDisk(cacheDir, project);

      expect(result?.locales).toEqual(['en', 'fr']);
    } finally {
      await rm(cacheDir, { recursive: true, force: true });
    }
  });
});
