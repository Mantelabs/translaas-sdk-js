import { promises as fs } from 'fs';
import { join } from 'path';
import type { IOfflineCacheProvider } from './types';
import {
  TranslaasOfflineCacheException,
  TranslationProject,
  TranslationGroup,
  TranslationEntryValue,
} from '@translaas/models';

/**
 * Cache entry metadata stored in manifest files
 */
interface CacheManifest {
  project: string;
  lang: string;
  cachedAt: number; // Timestamp when cached
  expiresAt?: number; // Optional expiration timestamp
}

/**
 * File-based cache provider for Node.js environments.
 * Persists translation data to local JSON files with atomic writes.
 *
 * Cache directory structure:
 * ```
 * {cacheDir}/
 *   {project}/
 *     {lang}/
 *       project.json      # Project translation data
 *       manifest.json     # Cache metadata
 * ```
 *
 * @example
 * ```typescript
 * const provider = new FileCacheProvider('/path/to/cache');
 * await provider.saveProjectAsync('my-project', 'en', projectData);
 * const cached = await provider.getProjectAsync('my-project', 'en');
 * ```
 */
export class FileCacheProvider implements IOfflineCacheProvider {
  private readonly cacheDir: string;

  /**
   * Creates a new FileCacheProvider instance.
   *
   * @param cacheDir - Base directory for cache files (default: './.translaas-cache')
   */
  constructor(cacheDir: string = './.translaas-cache') {
    this.cacheDir = cacheDir;
  }

  /**
   * Gets the cache directory path for a specific project and language.
   */
  private getProjectCacheDir(project: string, lang: string): string {
    return join(this.cacheDir, project, lang);
  }

  /**
   * Gets the project cache file path.
   */
  private getProjectCacheFile(project: string, lang: string): string {
    return join(this.getProjectCacheDir(project, lang), 'project.json');
  }

  /**
   * Gets the manifest file path.
   */
  private getManifestFile(project: string, lang: string): string {
    return join(this.getProjectCacheDir(project, lang), 'manifest.json');
  }

  /**
   * Ensures the cache directory exists, creating it if necessary.
   */
  private async ensureCacheDir(project: string, lang: string): Promise<void> {
    const dir = this.getProjectCacheDir(project, lang);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      throw new TranslaasOfflineCacheException(
        `Failed to create cache directory: ${dir}`,
        this.cacheDir,
        project,
        lang,
        error as Error
      );
    }
  }

  /**
   * Reads and parses a JSON file.
   */
  private async readJsonFile<T>(filePath: string): Promise<T | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw new TranslaasOfflineCacheException(
        `Failed to read cache file: ${filePath}`,
        this.cacheDir,
        undefined,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Checks if a cache entry is expired based on manifest data.
   */
  private isExpired(manifest: CacheManifest | null): boolean {
    if (!manifest) {
      return true;
    }

    if (manifest.expiresAt && Date.now() >= manifest.expiresAt) {
      return true;
    }

    return false;
  }

  /**
   * Retrieves cached project data.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to TranslationProject or null if not cached/expired
   * @throws TranslaasOfflineCacheException on file system errors
   */
  async getProjectAsync(
    project: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject | null> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', this.cacheDir, project, lang);
    }

    const manifestPath = this.getManifestFile(project, lang);
    const projectPath = this.getProjectCacheFile(project, lang);

    // Check manifest first
    const manifest = await this.readJsonFile<CacheManifest>(manifestPath);
    if (!manifest || this.isExpired(manifest)) {
      return null;
    }

    // Read project data
    const projectData =
      await this.readJsonFile<Record<string, Record<string, TranslationEntryValue>>>(projectPath);
    if (!projectData) {
      return null;
    }

    return new TranslationProject(projectData);
  }

  /**
   * Retrieves cached group data by extracting it from the cached project.
   *
   * @param project - Project identifier
   * @param group - Group name
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to TranslationGroup or null if not cached/expired
   * @throws TranslaasOfflineCacheException on file system errors
   */
  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup | null> {
    const projectData = await this.getProjectAsync(project, lang, cancellationToken);
    if (!projectData) {
      return null;
    }

    return projectData.getGroup(group);
  }

  /**
   * Saves project data to cache with atomic write (temp file + rename).
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param data - TranslationProject data to cache
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @throws TranslaasOfflineCacheException on file system errors
   */
  async saveProjectAsync(
    project: string,
    lang: string,
    data: TranslationProject,
    cancellationToken?: AbortSignal
  ): Promise<void> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', this.cacheDir, project, lang);
    }

    await this.ensureCacheDir(project, lang);

    const projectPath = this.getProjectCacheFile(project, lang);
    const manifestPath = this.getManifestFile(project, lang);
    const tempProjectPath = `${projectPath}.tmp`;
    const tempManifestPath = `${manifestPath}.tmp`;

    try {
      // Write project data to temp file
      const projectJson = JSON.stringify(data.groups, null, 2);
      await fs.writeFile(tempProjectPath, projectJson, 'utf-8');

      // Write manifest to temp file
      const manifest: CacheManifest = {
        project,
        lang,
        cachedAt: Date.now(),
      };
      const manifestJson = JSON.stringify(manifest, null, 2);
      await fs.writeFile(tempManifestPath, manifestJson, 'utf-8');

      // Atomic rename: temp files -> actual files
      await fs.rename(tempProjectPath, projectPath);
      await fs.rename(tempManifestPath, manifestPath);
    } catch (error) {
      // Clean up temp files on error
      try {
        await fs.unlink(tempProjectPath).catch(() => {
          // Ignore errors during cleanup
        });
        await fs.unlink(tempManifestPath).catch(() => {
          // Ignore errors during cleanup
        });
      } catch {
        // Ignore cleanup errors
      }

      throw new TranslaasOfflineCacheException(
        `Failed to save cache file: ${projectPath}`,
        this.cacheDir,
        project,
        lang,
        error as Error
      );
    }
  }

  /**
   * Checks if a project/language combination is cached and not expired.
   *
   * @param project - Project identifier
   * @param lang - Language code
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @returns Promise resolving to true if cached and valid, false otherwise
   * @throws TranslaasOfflineCacheException on file system errors
   */
  async isCachedAsync(
    project: string,
    lang: string,
    cancellationToken?: AbortSignal
  ): Promise<boolean> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', this.cacheDir, project, lang);
    }

    const manifestPath = this.getManifestFile(project, lang);
    const projectPath = this.getProjectCacheFile(project, lang);

    try {
      // Check if both files exist
      await fs.access(manifestPath);
      await fs.access(projectPath);

      // Check if expired
      const manifest = await this.readJsonFile<CacheManifest>(manifestPath);
      return !this.isExpired(manifest);
    } catch {
      return false;
    }
  }

  /**
   * Removes all cached data by deleting the cache directory.
   *
   * @param cancellationToken - Optional AbortSignal to cancel the operation
   * @throws TranslaasOfflineCacheException on file system errors
   */
  async clearAllAsync(cancellationToken?: AbortSignal): Promise<void> {
    if (cancellationToken?.aborted) {
      throw new TranslaasOfflineCacheException('Operation cancelled', this.cacheDir);
    }

    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        // Only throw if directory exists and deletion failed
        throw new TranslaasOfflineCacheException(
          `Failed to clear cache directory: ${this.cacheDir}`,
          this.cacheDir,
          undefined,
          undefined,
          error as Error
        );
      }
      // ENOENT means directory doesn't exist, which is fine
    }
  }
}
