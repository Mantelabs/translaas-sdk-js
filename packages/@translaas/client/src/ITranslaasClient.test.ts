import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ITranslaasClient } from './types';
import { TranslaasClient } from './TranslaasClient';
import { TranslationGroup, TranslationProject, ProjectLocales } from '@translaas/models';

describe('ITranslaasClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('interface contract', () => {
    it('should be implemented by TranslaasClient', () => {
      const client = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });
      expect(client).toBeInstanceOf(TranslaasClient);
    });

    it('should have getEntryAsync method', () => {
      const client = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });
      expect(typeof client.getEntryAsync).toBe('function');
    });

    it('should have getGroupAsync method', () => {
      const client = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });
      expect(typeof client.getGroupAsync).toBe('function');
    });

    it('should have getProjectAsync method', () => {
      const client = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });
      expect(typeof client.getProjectAsync).toBe('function');
    });

    it('should have getProjectLocalesAsync method', () => {
      const client = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });
      expect(typeof client.getProjectLocalesAsync).toBe('function');
    });
  });

  describe('method signatures', () => {
    it('should accept getEntryAsync with required parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = await client.getEntryAsync('group', 'entry', 'en');
      expect(result).toBe('Result');
    });

    it('should accept getEntryAsync with optional number parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = await client.getEntryAsync('group', 'entry', 'en', 5);
      expect(result).toBe('Result');
    });

    it('should accept getEntryAsync with optional parameters object', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = await client.getEntryAsync('group', 'entry', 'en', undefined, {
        name: 'John',
      });
      expect(result).toBe('Result');
    });

    it('should accept getEntryAsync with optional cancellationToken', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });
      const controller = new AbortController();

      const result = await client.getEntryAsync(
        'group',
        'entry',
        'en',
        undefined,
        undefined,
        controller.signal
      );
      expect(result).toBe('Result');
    });

    it('should accept getGroupAsync with required parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ welcome: 'Welcome' }),
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = await client.getGroupAsync('project', 'group', 'en');
      expect(result).toBeInstanceOf(TranslationGroup);
    });

    it('should accept getGroupAsync with optional format parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ welcome: 'Welcome' }),
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = await client.getGroupAsync('project', 'group', 'en', 'json');
      expect(result).toBeInstanceOf(TranslationGroup);
    });

    it('should accept getProjectAsync with required parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ common: { welcome: 'Welcome' } }),
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = await client.getProjectAsync('project', 'en');
      expect(result).toBeInstanceOf(TranslationProject);
    });

    it('should accept getProjectLocalesAsync with required project parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ locales: ['en', 'fr'] }),
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = await client.getProjectLocalesAsync('project');
      expect(result).toBeInstanceOf(ProjectLocales);
    });
  });

  describe('return types', () => {
    it('should return Promise<string> from getEntryAsync', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = client.getEntryAsync('group', 'entry', 'en');
      expect(result).toBeInstanceOf(Promise);
      const value = await result;
      expect(typeof value).toBe('string');
    });

    it('should return Promise<TranslationGroup> from getGroupAsync', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ welcome: 'Welcome' }),
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = client.getGroupAsync('project', 'group', 'en');
      expect(result).toBeInstanceOf(Promise);
      const value = await result;
      expect(value).toBeInstanceOf(TranslationGroup);
    });

    it('should return Promise<TranslationProject> from getProjectAsync', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ common: { welcome: 'Welcome' } }),
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = client.getProjectAsync('project', 'en');
      expect(result).toBeInstanceOf(Promise);
      const value = await result;
      expect(value).toBeInstanceOf(TranslationProject);
    });

    it('should return Promise<ProjectLocales> from getProjectLocalesAsync', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ locales: ['en', 'fr'] }),
      });

      const client: ITranslaasClient = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
      });

      const result = client.getProjectLocalesAsync('project');
      expect(result).toBeInstanceOf(Promise);
      const value = await result;
      expect(value).toBeInstanceOf(ProjectLocales);
    });
  });
});
