import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileCacheProvider } from '../FileCacheProvider';
import {
  TranslaasOfflineCacheException,
  TranslationProject,
  TranslationGroup,
} from '@translaas/models';

describe('FileCacheProvider', () => {
  let cacheDir: string;
  let provider: FileCacheProvider;

  beforeEach(async () => {
    // Use a unique temp directory for each test
    cacheDir = join(process.cwd(), '.test-cache', `test-${Date.now()}-${Math.random()}`);
    provider = new FileCacheProvider(cacheDir);
  });

  afterEach(async () => {
    // Clean up test cache directory
    try {
      await fs.rm(cacheDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should create instance with default cache directory', () => {
      const defaultProvider = new FileCacheProvider();
      expect(defaultProvider).toBeInstanceOf(FileCacheProvider);
    });

    it('should create instance with custom cache directory', () => {
      expect(provider).toBeInstanceOf(FileCacheProvider);
    });
  });

  describe('saveProjectAsync', () => {
    it('should save project data to cache', async () => {
      const project = new TranslationProject({
        common: {
          welcome: 'Welcome',
          goodbye: 'Goodbye',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', project);

      // Verify files were created
      const projectPath = join(cacheDir, 'test-project', 'en', 'project.json');
      const manifestPath = join(cacheDir, 'test-project', 'en', 'manifest.json');

      const projectExists = await fs
        .access(projectPath)
        .then(() => true)
        .catch(() => false);
      const manifestExists = await fs
        .access(manifestPath)
        .then(() => true)
        .catch(() => false);

      expect(projectExists).toBe(true);
      expect(manifestExists).toBe(true);
    });

    it('should create directory structure if it does not exist', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('new-project', 'fr', project);

      const dirPath = join(cacheDir, 'new-project', 'fr');
      const dirExists = await fs
        .access(dirPath)
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);
    });

    it('should write valid JSON data', async () => {
      const project = new TranslationProject({
        messages: {
          hello: 'Hello',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', project);

      const projectPath = join(cacheDir, 'test-project', 'en', 'project.json');
      const content = await fs.readFile(projectPath, 'utf-8');
      const data = JSON.parse(content);

      expect(data).toEqual({
        messages: {
          hello: 'Hello',
        },
      });
    });

    it('should write manifest with metadata', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      const manifestPath = join(cacheDir, 'test-project', 'en', 'manifest.json');
      const content = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(content);

      expect(manifest.project).toBe('test-project');
      expect(manifest.lang).toBe('en');
      expect(manifest.cachedAt).toBeTypeOf('number');
      expect(manifest.cachedAt).toBeGreaterThan(0);
    });

    it('should use atomic writes (temp file + rename)', async () => {
      const project = new TranslationProject({ test: { key: 'value' } });
      const projectPath = join(cacheDir, 'test-project', 'en', 'project.json');
      const tempPath = `${projectPath}.tmp`;

      // Start save operation
      const savePromise = provider.saveProjectAsync('test-project', 'en', project);

      await savePromise;

      // After save, temp file should not exist
      const tempExistsAfter = await fs
        .access(tempPath)
        .then(() => true)
        .catch(() => false);
      expect(tempExistsAfter).toBe(false);

      // Final file should exist
      const finalExists = await fs
        .access(projectPath)
        .then(() => true)
        .catch(() => false);
      expect(finalExists).toBe(true);
    });

    it('should handle cancellation token', async () => {
      const project = new TranslationProject({});
      const controller = new AbortController();
      controller.abort();

      await expect(
        provider.saveProjectAsync('test-project', 'en', project, controller.signal)
      ).rejects.toThrow(TranslaasOfflineCacheException);
    });
  });

  describe('getProjectAsync', () => {
    it('should retrieve cached project data', async () => {
      const originalProject = new TranslationProject({
        common: {
          welcome: 'Welcome',
          goodbye: 'Goodbye',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', originalProject);
      const cached = await provider.getProjectAsync('test-project', 'en');

      expect(cached).toBeInstanceOf(TranslationProject);
      expect(cached?.groups).toEqual(originalProject.groups);
    });

    it('should return null for non-existent project', async () => {
      const cached = await provider.getProjectAsync('non-existent', 'en');
      expect(cached).toBeNull();
    });

    it('should return null for non-existent language', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      const cached = await provider.getProjectAsync('test-project', 'fr');
      expect(cached).toBeNull();
    });

    it('should return null for expired cache entry', async () => {
      const project = new TranslationProject({ test: { key: 'value' } });
      await provider.saveProjectAsync('test-project', 'en', project);

      // Manually set expiration in manifest
      const manifestPath = join(cacheDir, 'test-project', 'en', 'manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
      manifest.expiresAt = Date.now() - 1000; // Expired 1 second ago
      await fs.writeFile(manifestPath, JSON.stringify(manifest), 'utf-8');

      const cached = await provider.getProjectAsync('test-project', 'en');
      expect(cached).toBeNull();
    });

    it('should handle cancellation token', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      const controller = new AbortController();
      controller.abort();

      await expect(
        provider.getProjectAsync('test-project', 'en', controller.signal)
      ).rejects.toThrow(TranslaasOfflineCacheException);
    });

    it('should handle corrupted project file gracefully', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      // Corrupt the project file
      const projectPath = join(cacheDir, 'test-project', 'en', 'project.json');
      await fs.writeFile(projectPath, 'invalid json', 'utf-8');

      await expect(provider.getProjectAsync('test-project', 'en')).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });
  });

  describe('getGroupAsync', () => {
    it('should retrieve cached group data', async () => {
      const project = new TranslationProject({
        common: {
          welcome: 'Welcome',
        },
        messages: {
          error: 'Error',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', project);
      const group = await provider.getGroupAsync('test-project', 'common', 'en');

      expect(group).toBeInstanceOf(TranslationGroup);
      expect(group?.entries).toEqual({
        welcome: 'Welcome',
      });
    });

    it('should return null for non-existent group', async () => {
      const project = new TranslationProject({
        common: {
          welcome: 'Welcome',
        },
      });

      await provider.saveProjectAsync('test-project', 'en', project);
      const group = await provider.getGroupAsync('test-project', 'non-existent', 'en');

      expect(group).toBeNull();
    });

    it('should return null if project is not cached', async () => {
      const group = await provider.getGroupAsync('non-existent', 'common', 'en');
      expect(group).toBeNull();
    });

    it('should handle cancellation token', async () => {
      const project = new TranslationProject({ common: { key: 'value' } });
      await provider.saveProjectAsync('test-project', 'en', project);

      const controller = new AbortController();
      controller.abort();

      await expect(
        provider.getGroupAsync('test-project', 'common', 'en', controller.signal)
      ).rejects.toThrow(TranslaasOfflineCacheException);
    });
  });

  describe('isCachedAsync', () => {
    it('should return true for cached project', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      const isCached = await provider.isCachedAsync('test-project', 'en');
      expect(isCached).toBe(true);
    });

    it('should return false for non-existent project', async () => {
      const isCached = await provider.isCachedAsync('non-existent', 'en');
      expect(isCached).toBe(false);
    });

    it('should return false for expired cache entry', async () => {
      const project = new TranslationProject({});
      await provider.saveProjectAsync('test-project', 'en', project);

      // Manually set expiration in manifest
      const manifestPath = join(cacheDir, 'test-project', 'en', 'manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
      manifest.expiresAt = Date.now() - 1000; // Expired 1 second ago
      await fs.writeFile(manifestPath, JSON.stringify(manifest), 'utf-8');

      const isCached = await provider.isCachedAsync('test-project', 'en');
      expect(isCached).toBe(false);
    });

    it('should handle cancellation token', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(provider.isCachedAsync('test-project', 'en', controller.signal)).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });
  });

  describe('clearAllAsync', () => {
    it('should remove all cached data', async () => {
      const project1 = new TranslationProject({ test1: { key: 'value1' } });
      const project2 = new TranslationProject({ test2: { key: 'value2' } });

      await provider.saveProjectAsync('project1', 'en', project1);
      await provider.saveProjectAsync('project2', 'fr', project2);

      await provider.clearAllAsync();

      // Verify cache directory is removed or empty
      const dirExists = await fs
        .access(cacheDir)
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(false);
    });

    it('should handle non-existent cache directory gracefully', async () => {
      const emptyProvider = new FileCacheProvider(join(cacheDir, 'non-existent'));
      await expect(emptyProvider.clearAllAsync()).resolves.not.toThrow();
    });

    it('should handle cancellation token', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(provider.clearAllAsync(controller.signal)).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });
  });

  describe('error handling', () => {
    it('should throw TranslaasOfflineCacheException on file system errors', async () => {
      // Create a provider with a path that will fail (using a file as directory)
      const project = new TranslationProject({});
      const projectPath = join(cacheDir, 'test-project', 'en', 'project.json');

      // Create the file first, then try to use its parent as cache dir
      await fs.mkdir(join(cacheDir, 'test-project', 'en'), { recursive: true });
      await fs.writeFile(projectPath, 'test', 'utf-8');

      // Use the file path as cache directory (should fail)
      const invalidProvider = new FileCacheProvider(projectPath);

      await expect(invalidProvider.saveProjectAsync('test', 'en', project)).rejects.toThrow(
        TranslaasOfflineCacheException
      );
    });

    it('should include project and language in error context', async () => {
      const project = new TranslationProject({});
      const projectPath = join(cacheDir, 'test-project', 'en', 'project.json');

      // Create the file first, then try to use its parent as cache dir
      await fs.mkdir(join(cacheDir, 'test-project', 'en'), { recursive: true });
      await fs.writeFile(projectPath, 'test', 'utf-8');

      const invalidProvider = new FileCacheProvider(projectPath);

      try {
        await invalidProvider.saveProjectAsync('my-project', 'en', project);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasOfflineCacheException);
        const cacheError = error as TranslaasOfflineCacheException;
        expect(cacheError.project).toBe('my-project');
        expect(cacheError.language).toBe('en');
      }
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent saves', async () => {
      const project1 = new TranslationProject({ test1: { key: 'value1' } });
      const project2 = new TranslationProject({ test2: { key: 'value2' } });

      await Promise.all([
        provider.saveProjectAsync('project1', 'en', project1),
        provider.saveProjectAsync('project2', 'fr', project2),
      ]);

      const cached1 = await provider.getProjectAsync('project1', 'en');
      const cached2 = await provider.getProjectAsync('project2', 'fr');

      expect(cached1).toBeInstanceOf(TranslationProject);
      expect(cached2).toBeInstanceOf(TranslationProject);
    });

    it('should handle concurrent reads', async () => {
      const project = new TranslationProject({ test: { key: 'value' } });
      await provider.saveProjectAsync('test-project', 'en', project);

      const results = await Promise.all([
        provider.getProjectAsync('test-project', 'en'),
        provider.getProjectAsync('test-project', 'en'),
        provider.getProjectAsync('test-project', 'en'),
      ]);

      results.forEach(result => {
        expect(result).toBeInstanceOf(TranslationProject);
      });
    });
  });
});
