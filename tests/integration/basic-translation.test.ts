import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { TranslaasClient } from '@translaas/client';
import { TranslaasService } from '@translaas/client';
import { createMockServer, defaultMockData, type MockApiConfig } from '../setup/mock-api';
import { createTestClientOptions } from '../fixtures/translation-data';

/**
 * Integration tests for basic translation flow
 *
 * Tests the end-to-end flow of:
 * - Client making API requests
 * - Service wrapping client with language resolution
 * - Error handling
 */

describe('Basic Translation Flow', () => {
  const mockConfig: MockApiConfig = {
    baseUrl: 'https://api.test.translaas.com',
    apiKey: 'test-api-key',
    delay: 10, // Small delay to simulate network
  };

  const server = createMockServer(mockConfig, defaultMockData);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('TranslaasClient - getEntryAsync', () => {
    it('should fetch a single translation entry', async () => {
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const result = await client.getEntryAsync('common', 'welcome', 'en');

      expect(result).toBe('Welcome');
    });

    it('should fetch translation with parameters', async () => {
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const result = await client.getEntryAsync('common', 'greeting', 'en', undefined, {
        name: 'John',
      });

      expect(result).toBe('Hello John');
    });

    it('should fetch translation with pluralization', async () => {
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const result = await client.getEntryAsync('messages', 'items', 'en', 5, {
        count: '5',
      });

      expect(result).toBe('5 items');
    });

    it('should fetch translations in different languages', async () => {
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));

      const en = await client.getEntryAsync('common', 'welcome', 'en');
      const fr = await client.getEntryAsync('common', 'welcome', 'fr');
      const es = await client.getEntryAsync('common', 'welcome', 'es');

      expect(en).toBe('Welcome');
      expect(fr).toBe('Bienvenue');
      expect(es).toBe('Bienvenido');
    });
  });

  describe('TranslaasClient - getGroupAsync', () => {
    it('should fetch a translation group', async () => {
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const group = await client.getGroupAsync('test-project', 'common', 'en');

      expect(group).toBeDefined();
      expect(group.entries).toBeDefined();
      expect(group.entries.welcome).toBe('Welcome');
      expect(group.entries.greeting).toBe('Hello {name}');
    });
  });

  describe('TranslaasClient - getProjectAsync', () => {
    it('should fetch a translation project', async () => {
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const project = await client.getProjectAsync('test-project', 'en');

      expect(project).toBeDefined();
      expect(project.groups).toBeDefined();
      expect(project.groups.common).toBeDefined();
      expect(project.groups.messages).toBeDefined();
    });
  });

  describe('TranslaasClient - getProjectLocalesAsync', () => {
    it('should fetch project locales', async () => {
      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const locales = await client.getProjectLocalesAsync('test-project');

      expect(locales).toBeDefined();
      expect(locales.locales).toContain('en');
      expect(locales.locales).toContain('fr');
      expect(locales.locales).toContain('es');
    });
  });

  describe('TranslaasService - basic translation', () => {
    it('should translate with explicit language', async () => {
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        defaultLanguage: 'en',
      });

      const result = await service.t('common', 'welcome', 'en');
      expect(result).toBe('Welcome');
    });

    it('should translate with default language', async () => {
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        defaultLanguage: 'fr',
      });

      const result = await service.t('common', 'welcome');
      expect(result).toBe('Bienvenue');
    });

    it('should translate with parameters', async () => {
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        defaultLanguage: 'en',
      });

      const result = await service.t('common', 'greeting', 'en', undefined, {
        name: 'Alice',
      });
      expect(result).toBe('Hello Alice');
    });

    it('should translate with pluralization', async () => {
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        defaultLanguage: 'en',
      });

      const result = await service.t('messages', 'items', 'en', 3, {
        count: '3',
      });
      expect(result).toBe('3 items');
    });
  });
});
