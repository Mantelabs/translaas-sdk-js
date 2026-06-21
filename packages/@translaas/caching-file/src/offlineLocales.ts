import { access, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { ProjectLocales } from '@translaas/models';

interface CachedLocalesFile {
  data?: {
    locales?: unknown;
  };
}

interface OfflineCacheManifest {
  projects?: Record<string, { languages?: unknown }>;
}

function normalizeLocaleList(values: unknown): string[] | null {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const locales = values.filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );
  return locales.length > 0 ? locales : null;
}

export function parseLocalesFromCacheFile(content: unknown): string[] | null {
  if (!content || typeof content !== 'object') {
    return null;
  }

  return normalizeLocaleList((content as CachedLocalesFile).data?.locales);
}

export function parseLocalesFromManifest(content: unknown, project: string): string[] | null {
  if (!content || typeof content !== 'object') {
    return null;
  }

  const projects = (content as OfflineCacheManifest).projects;
  if (!projects) {
    return null;
  }

  const direct = projects[project];
  if (!direct) {
    return null;
  }

  return normalizeLocaleList(direct.languages);
}

async function readJsonFile(path: string): Promise<unknown | null> {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

async function scanCachedLocaleDirectories(projectDir: string): Promise<string[] | null> {
  try {
    const entries = await readdir(projectDir, { withFileTypes: true });
    const locales: string[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      try {
        await access(join(projectDir, entry.name, 'project.json'));
        locales.push(entry.name);
      } catch {
        // Ignore directories without cached project data.
      }
    }

    return locales.length > 0 ? locales : null;
  } catch {
    return null;
  }
}

/**
 * Reads supported locales from an on-disk offline cache export or runtime FileCacheProvider tree.
 */
export async function readProjectLocalesFromDisk(
  cacheDir: string,
  project: string
): Promise<ProjectLocales | null> {
  const projectDir = join(cacheDir, project);

  const localesFile = await readJsonFile(join(projectDir, 'locales.json'));
  const fromLocalesFile = parseLocalesFromCacheFile(localesFile);
  if (fromLocalesFile) {
    return new ProjectLocales(fromLocalesFile, { project });
  }

  const manifestFile = await readJsonFile(join(cacheDir, 'manifest.json'));
  const fromManifest = parseLocalesFromManifest(manifestFile, project);
  if (fromManifest) {
    return new ProjectLocales(fromManifest, { project });
  }

  const fromDirectories = await scanCachedLocaleDirectories(projectDir);
  if (fromDirectories) {
    return new ProjectLocales(fromDirectories, { project });
  }

  return null;
}
