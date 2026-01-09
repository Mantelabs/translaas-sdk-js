import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranslaasClient } from './TranslaasClient';
import {
  TranslaasApiException,
  TranslaasConfigurationException,
  TranslationGroup,
  TranslationProject,
  ProjectLocales,
} from '@translaas/models';
import { CacheMode } from '@translaas/models';

describe('TranslaasClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const defaultOptions = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.example.com',
  };

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with valid options', () => {
      const client = new TranslaasClient(defaultOptions);
      expect(client).toBeInstanceOf(TranslaasClient);
    });

    it('should accept options with cacheMode', () => {
      const client = new TranslaasClient({
        ...defaultOptions,
        cacheMode: CacheMode.Group,
      });
      expect(client).toBeInstanceOf(TranslaasClient);
    });

    it('should accept options with timeout', () => {
      const client = new TranslaasClient({
        ...defaultOptions,
        timeout: 5000,
      });
      expect(client).toBeInstanceOf(TranslaasClient);
    });

    it('should accept options with offlineCache', () => {
      const client = new TranslaasClient({
        ...defaultOptions,
        offlineCache: {
          enabled: true,
        },
      });
      expect(client).toBeInstanceOf(TranslaasClient);
    });

    it('should throw TranslaasConfigurationException when apiKey is missing', () => {
      expect(() => {
        new TranslaasClient({
          apiKey: '',
          baseUrl: 'https://api.example.com',
        });
      }).toThrow(TranslaasConfigurationException);
    });

    it('should throw TranslaasConfigurationException when apiKey is whitespace only', () => {
      expect(() => {
        new TranslaasClient({
          apiKey: '   ',
          baseUrl: 'https://api.example.com',
        });
      }).toThrow(TranslaasConfigurationException);
    });

    it('should throw TranslaasConfigurationException when baseUrl is missing', () => {
      expect(() => {
        new TranslaasClient({
          apiKey: 'test-key',
          baseUrl: '',
        });
      }).toThrow(TranslaasConfigurationException);
    });

    it('should normalize baseUrl by removing trailing slashes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client = new TranslaasClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com///',
      });

      await client.getEntryAsync('group', 'entry', 'en');

      const call = mockFetch.mock.calls[0];
      expect(call[0]).toBe(
        'https://api.example.com/api/translations/text?group=group&entry=entry&lang=en'
      );
    });
  });

  describe('getEntryAsync', () => {
    it('should make GET request to /api/translations/text with query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Welcome',
      });

      const client = new TranslaasClient(defaultOptions);
      const result = await client.getEntryAsync('group', 'entry', 'en');

      expect(result).toBe('Welcome');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/api/translations/text');
      expect(call[0]).toContain('group=group');
      expect(call[0]).toContain('entry=entry');
      expect(call[0]).toContain('lang=en');
      expect(call[1]).toMatchObject({
        method: 'GET',
        headers: {
          'X-Api-Key': 'test-api-key',
          Accept: 'text/plain',
        },
      });
    });

    it('should include number parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '5 items',
      });

      const client = new TranslaasClient(defaultOptions);
      await client.getEntryAsync('group', 'entry', 'en', 5);

      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('n=5');
    });

    it('should include custom parameters when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Hello John',
      });

      const client = new TranslaasClient(defaultOptions);
      await client.getEntryAsync('group', 'entry', 'en', undefined, { userName: 'John' });

      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('userName=John');
    });

    it('should include all parameters together', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client = new TranslaasClient(defaultOptions);
      await client.getEntryAsync('group', 'entry', 'en', 5, { userName: 'John', age: '30' });

      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('group=group');
      expect(call[0]).toContain('entry=entry');
      expect(call[0]).toContain('lang=en');
      expect(call[0]).toContain('n=5');
      expect(call[0]).toContain('userName=John');
      expect(call[0]).toContain('age=30');
    });

    it('should throw TranslaasApiException on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Translation not found',
      });

      const client = new TranslaasClient(defaultOptions);
      await expect(client.getEntryAsync('group', 'entry', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });

    it('should include status code in exception', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      const client = new TranslaasClient(defaultOptions);
      try {
        await client.getEntryAsync('group', 'entry', 'en');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasApiException);
        expect((error as TranslaasApiException).statusCode).toBe(500);
      }
    });

    it('should handle cancellation token', async () => {
      const abortController = new AbortController();
      abortController.abort();

      const client = new TranslaasClient(defaultOptions);
      await expect(
        client.getEntryAsync('group', 'entry', 'en', undefined, undefined, abortController.signal)
      ).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const client = new TranslaasClient(defaultOptions);
      await expect(client.getEntryAsync('group', 'entry', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });

    it('should accept timeout configuration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client = new TranslaasClient({
        ...defaultOptions,
        timeout: 5000,
      });

      // Verify that timeout option doesn't break normal operation
      const result = await client.getEntryAsync('group', 'entry', 'en');
      expect(result).toBe('Result');
    });
  });

  describe('getGroupAsync', () => {
    it('should make GET request to /api/translations/group and return TranslationGroup', async () => {
      const mockData = {
        welcome: 'Welcome',
        goodbye: 'Goodbye',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const client = new TranslaasClient(defaultOptions);
      const result = await client.getGroupAsync('project', 'group', 'en');

      expect(result).toBeInstanceOf(TranslationGroup);
      expect(result.entries).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/api/translations/group');
      expect(call[0]).toContain('project=project');
      expect(call[0]).toContain('group=group');
      expect(call[0]).toContain('lang=en');
      expect(call[1]).toMatchObject({
        method: 'GET',
        headers: {
          'X-Api-Key': 'test-api-key',
          Accept: 'application/json',
        },
      });
    });

    it('should include format parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const client = new TranslaasClient(defaultOptions);
      await client.getGroupAsync('project', 'group', 'en', 'json');

      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('format=json');
    });

    it('should throw TranslaasApiException on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Group not found',
      });

      const client = new TranslaasClient(defaultOptions);
      await expect(client.getGroupAsync('project', 'group', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });

    it('should handle cancellation token', async () => {
      const abortController = new AbortController();
      abortController.abort();

      const client = new TranslaasClient(defaultOptions);
      await expect(
        client.getGroupAsync('project', 'group', 'en', undefined, abortController.signal)
      ).rejects.toThrow();
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const client = new TranslaasClient(defaultOptions);
      await expect(client.getGroupAsync('project', 'group', 'en')).rejects.toThrow();
    });
  });

  describe('getProjectAsync', () => {
    it('should make GET request to /api/translations/project and return TranslationProject', async () => {
      const mockData = {
        common: {
          welcome: 'Welcome',
        },
        messages: {
          error: 'Error',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const client = new TranslaasClient(defaultOptions);
      const result = await client.getProjectAsync('project', 'en');

      expect(result).toBeInstanceOf(TranslationProject);
      expect(result.groups).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/api/translations/project');
      expect(call[0]).toContain('project=project');
      expect(call[0]).toContain('lang=en');
      expect(call[1]).toMatchObject({
        method: 'GET',
        headers: {
          'X-Api-Key': 'test-api-key',
          Accept: 'application/json',
        },
      });
    });

    it('should include format parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const client = new TranslaasClient(defaultOptions);
      await client.getProjectAsync('project', 'en', 'json');

      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('format=json');
    });

    it('should throw TranslaasApiException on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Project not found',
      });

      const client = new TranslaasClient(defaultOptions);
      await expect(client.getProjectAsync('project', 'en')).rejects.toThrow(TranslaasApiException);
    });

    it('should handle cancellation token', async () => {
      const abortController = new AbortController();
      abortController.abort();

      const client = new TranslaasClient(defaultOptions);
      await expect(
        client.getProjectAsync('project', 'en', undefined, abortController.signal)
      ).rejects.toThrow();
    });
  });

  describe('getProjectLocalesAsync', () => {
    it('should make GET request to /api/translations/locales and return ProjectLocales', async () => {
      const mockData = {
        locales: ['en', 'fr', 'es'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const client = new TranslaasClient(defaultOptions);
      const result = await client.getProjectLocalesAsync('project');

      expect(result).toBeInstanceOf(ProjectLocales);
      expect(result.locales).toEqual(['en', 'fr', 'es']);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/api/translations/locales');
      expect(call[0]).toContain('project=project');
      expect(call[1]).toMatchObject({
        method: 'GET',
        headers: {
          'X-Api-Key': 'test-api-key',
          Accept: 'application/json',
        },
      });
    });

    it('should handle response with locales array directly', async () => {
      const mockData = ['en', 'fr', 'es'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const client = new TranslaasClient(defaultOptions);
      const result = await client.getProjectLocalesAsync('project');

      expect(result.locales).toEqual(['en', 'fr', 'es']);
    });

    it('should throw TranslaasApiException on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Project not found',
      });

      const client = new TranslaasClient(defaultOptions);
      await expect(client.getProjectLocalesAsync('project')).rejects.toThrow(TranslaasApiException);
    });

    it('should handle cancellation token', async () => {
      const abortController = new AbortController();
      abortController.abort();

      const client = new TranslaasClient(defaultOptions);
      await expect(
        client.getProjectLocalesAsync('project', abortController.signal)
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should parse JSON error messages when available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => JSON.stringify({ message: 'Invalid parameters' }),
      });

      const client = new TranslaasClient(defaultOptions);
      try {
        await client.getEntryAsync('group', 'entry', 'en');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasApiException);
        expect((error as TranslaasApiException).message).toContain('Invalid parameters');
      }
    });

    it('should handle empty error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => '',
      });

      const client = new TranslaasClient(defaultOptions);
      await expect(client.getEntryAsync('group', 'entry', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });

    it('should handle very long error responses', async () => {
      const longMessage = 'x'.repeat(300);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => longMessage,
      });

      const client = new TranslaasClient(defaultOptions);
      try {
        await client.getEntryAsync('group', 'entry', 'en');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasApiException);
        // Should truncate very long messages
        expect((error as TranslaasApiException).message.length).toBeLessThan(300);
      }
    });
  });

  describe('query parameter building', () => {
    it('should not include undefined parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client = new TranslaasClient(defaultOptions);
      await client.getEntryAsync('group', 'entry', 'en');

      const call = mockFetch.mock.calls[0];
      expect(call[0]).not.toContain('n=');
    });

    it('should not include null parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const client = new TranslaasClient(defaultOptions);
      await client.getGroupAsync('project', 'group', 'en', undefined);

      const call = mockFetch.mock.calls[0];
      expect(call[0]).not.toContain('format=');
    });

    it('should URL encode parameter values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Result',
      });

      const client = new TranslaasClient(defaultOptions);
      await client.getEntryAsync('group', 'entry', 'en', undefined, { name: 'John Doe' });

      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('name=John+Doe');
    });
  });

  describe('error handling edge cases', () => {
    it('should handle AbortError from fetch', async () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const client = new TranslaasClient(defaultOptions);
      try {
        await client.getEntryAsync('group', 'entry', 'en');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasApiException);
        expect((error as TranslaasApiException).message).toContain('cancelled or timed out');
      }
    });

    it('should handle unknown error types', async () => {
      // Simulate a non-Error object being thrown
      mockFetch.mockRejectedValueOnce('String error');

      const client = new TranslaasClient(defaultOptions);
      try {
        await client.getEntryAsync('group', 'entry', 'en');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasApiException);
        expect((error as TranslaasApiException).message).toContain('Unknown error');
      }
    });

    it('should handle error response with JSON error field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => JSON.stringify({ error: 'Invalid request parameters' }),
      });

      const client = new TranslaasClient(defaultOptions);
      try {
        await client.getEntryAsync('group', 'entry', 'en');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasApiException);
        expect((error as TranslaasApiException).message).toContain('Invalid request parameters');
      }
    });

    it('should handle error response with non-JSON text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Plain text error message',
      });

      const client = new TranslaasClient(defaultOptions);
      try {
        await client.getEntryAsync('group', 'entry', 'en');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TranslaasApiException);
        expect((error as TranslaasApiException).message).toContain('Plain text error message');
      }
    });

    it('should handle error when reading response body fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => {
          throw new Error('Failed to read body');
        },
      });

      const client = new TranslaasClient(defaultOptions);
      await expect(client.getEntryAsync('group', 'entry', 'en')).rejects.toThrow(
        TranslaasApiException
      );
    });

    it('should handle cancellation token with timeout - event listener path', async () => {
      const abortController = new AbortController();
      const client = new TranslaasClient({
        ...defaultOptions,
        timeout: 5000,
      });

      // Mock fetch to check if signal was aborted
      let capturedSignal: AbortSignal | undefined;
      mockFetch.mockImplementationOnce((url, options) => {
        capturedSignal = options?.signal as AbortSignal;
        // Return a promise that will be aborted
        return new Promise((resolve, reject) => {
          if (capturedSignal?.aborted) {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          } else {
            // Set up listener to reject when aborted
            capturedSignal?.addEventListener('abort', () => {
              const error = new Error('Aborted');
              error.name = 'AbortError';
              reject(error);
            });
          }
        });
      });

      // Start the request
      const requestPromise = client.getEntryAsync(
        'group',
        'entry',
        'en',
        undefined,
        undefined,
        abortController.signal
      );

      // Abort after a short delay to trigger the event listener
      setTimeout(() => {
        abortController.abort();
      }, 10);

      await expect(requestPromise).rejects.toThrow();
    });
  });
});
