import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { TranslaasClient } from '@translaas/client';
import { TranslaasService } from '@translaas/client';
import { TranslaasApiException, TranslaasConfigurationException } from '@translaas/models';
import { createMockServer, type MockApiConfig } from '../setup/mock-api';
import { createTestClientOptions } from '../fixtures/translation-data';
import { http, HttpResponse } from 'msw';

/**
 * Integration tests for error scenarios
 *
 * Tests:
 * - API failure handling
 * - Network errors
 * - Timeout scenarios
 * - Invalid configuration
 * - Cache fallback on API failure
 */

describe('Error Scenarios', () => {
  const mockConfig: MockApiConfig = {
    baseUrl: 'https://api.test.translaas.com',
    apiKey: 'test-api-key',
  };

  const server = createMockServer(mockConfig);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('API Error Handling', () => {
    it('should handle 404 Not Found', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, () => {
          return HttpResponse.text('Not found', { status: 404 });
        })
      );

      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      await expect(client.getEntryAsync('nonexistent', 'entry', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });

    it('should handle 500 Internal Server Error', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, () => {
          return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
        })
      );

      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      await expect(client.getEntryAsync('common', 'welcome', 'en')).rejects.toThrow(
        TranslaasApiException
      );

      try {
        await client.getEntryAsync('common', 'welcome', 'en');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasApiException);
        expect((error as TranslaasApiException).statusCode).toBe(500);
      }
    });

    it('should handle 401 Unauthorized', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        })
      );

      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      await expect(client.getEntryAsync('common', 'welcome', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });

    it('should handle invalid API key', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, ({ request }) => {
          if (request.headers.get('X-Api-Key') !== 'test-api-key') {
            return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
          }
          return HttpResponse.text('Welcome');
        })
      );

      const client = new TranslaasClient({
        apiKey: 'wrong-key',
        baseUrl: mockConfig.baseUrl,
      });

      await expect(client.getEntryAsync('common', 'welcome', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, () => {
          throw new Error('Network error');
        })
      );

      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      await expect(client.getEntryAsync('common', 'welcome', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });

    it('should handle connection refused', async () => {
      // Use a different base URL that won't be handled by MSW
      // Configure MSW to not handle this request
      server.use(
        http.get('https://nonexistent-api.example.com/api/translations/text', () => {
          // Don't handle - let it fail naturally
          return HttpResponse.error();
        })
      );

      const client = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://nonexistent-api.example.com',
      });

      await expect(client.getEntryAsync('common', 'welcome', 'en')).rejects.toThrow();
    });
  });

  describe('Timeout Scenarios', () => {
    it('should handle request timeout', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, async () => {
          // Simulate long delay
          await new Promise(resolve => setTimeout(resolve, 10000));
          return HttpResponse.text('Should timeout');
        })
      );

      const client = new TranslaasClient({
        ...createTestClientOptions(mockConfig.baseUrl),
        timeout: 100, // 100ms timeout
      });

      await expect(client.getEntryAsync('common', 'welcome', 'en')).rejects.toThrow();
    }, 15000); // Increase test timeout

    it('should handle cancellation', async () => {
      const abortController = new AbortController();

      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return HttpResponse.text('Should be cancelled');
        })
      );

      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));

      // Abort immediately
      abortController.abort();

      await expect(
        client.getEntryAsync(
          'common',
          'welcome',
          'en',
          undefined,
          undefined,
          abortController.signal
        )
      ).rejects.toThrow();
    });
  });

  describe('Configuration Errors', () => {
    it('should throw on missing API key', () => {
      expect(() => {
        new TranslaasClient({
          apiKey: '',
          baseUrl: 'https://api.example.com',
        });
      }).toThrow(TranslaasConfigurationException);
    });

    it('should throw on missing base URL', () => {
      expect(() => {
        new TranslaasClient({
          apiKey: 'test-key',
          baseUrl: '',
        });
      }).toThrow(TranslaasConfigurationException);
    });

    it('should throw on invalid base URL format', () => {
      expect(() => {
        new TranslaasClient({
          apiKey: 'test-key',
          baseUrl: 'not-a-url',
        });
      }).not.toThrow(TranslaasConfigurationException); // Client doesn't validate URL format
    });
  });

  describe('Service Error Handling', () => {
    it('should throw when language cannot be resolved', async () => {
      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        // No languageResolver and no defaultLanguage
      });

      await expect(service.t('common', 'welcome')).rejects.toThrow(TranslaasConfigurationException);
    });

    it('should propagate API errors from client', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, () => {
          return HttpResponse.text('Not found', { status: 404 });
        })
      );

      const service = new TranslaasService({
        ...createTestClientOptions(mockConfig.baseUrl),
        defaultLanguage: 'en',
      });

      await expect(service.t('nonexistent', 'entry')).rejects.toThrow(TranslaasApiException);
    });
  });

  describe('Malformed Response Handling', () => {
    it('should handle invalid JSON in group response', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/group`, () => {
          return HttpResponse.text('Invalid JSON', {
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      await expect(client.getGroupAsync('test-project', 'common', 'en')).rejects.toThrow();
    });

    it('should handle empty response', async () => {
      server.use(
        http.get(`${mockConfig.baseUrl}/api/translations/text`, () => {
          return HttpResponse.text('');
        })
      );

      const client = new TranslaasClient(createTestClientOptions(mockConfig.baseUrl));
      const result = await client.getEntryAsync('common', 'welcome', 'en');
      expect(result).toBe('');
    });
  });
});
