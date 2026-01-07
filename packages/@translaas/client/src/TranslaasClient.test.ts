import { describe, it, expect } from 'vitest';
import { TranslaasClient } from './TranslaasClient';
import { CacheMode } from '@translaas/models';

describe('TranslaasClient', () => {
  describe('constructor', () => {
    it('should create client with valid options', () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });
      expect(client).toBeInstanceOf(TranslaasClient);
    });

    it('should accept options with cacheMode', () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
        cacheMode: CacheMode.Group,
      });
      expect(client).toBeInstanceOf(TranslaasClient);
    });

    it('should accept options with timeout', () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
        timeout: 5000,
      });
      expect(client).toBeInstanceOf(TranslaasClient);
    });

    it('should accept options with offlineCache', () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
        offlineCache: {
          enabled: true,
        },
      });
      expect(client).toBeInstanceOf(TranslaasClient);
    });
  });

  describe('getEntryAsync', () => {
    it('should throw not implemented error', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });

      await expect(client.getEntryAsync('group', 'entry', 'en')).rejects.toThrow('Not implemented');
    });

    it('should accept all parameters', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });
      const controller = new AbortController();

      await expect(
        client.getEntryAsync('group', 'entry', 'en', 5, { name: 'John' }, controller.signal)
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('getGroupAsync', () => {
    it('should throw not implemented error', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });

      await expect(client.getGroupAsync('project', 'group', 'en')).rejects.toThrow(
        'Not implemented'
      );
    });

    it('should accept optional format parameter', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });

      await expect(client.getGroupAsync('project', 'group', 'en', 'json')).rejects.toThrow(
        'Not implemented'
      );
    });

    it('should accept optional cancellationToken', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });
      const controller = new AbortController();

      await expect(
        client.getGroupAsync('project', 'group', 'en', undefined, controller.signal)
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('getProjectAsync', () => {
    it('should throw not implemented error', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });

      await expect(client.getProjectAsync('project', 'en')).rejects.toThrow('Not implemented');
    });

    it('should accept optional format parameter', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });

      await expect(client.getProjectAsync('project', 'en', 'json')).rejects.toThrow(
        'Not implemented'
      );
    });

    it('should accept optional cancellationToken', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });
      const controller = new AbortController();

      await expect(
        client.getProjectAsync('project', 'en', undefined, controller.signal)
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('getProjectLocalesAsync', () => {
    it('should throw not implemented error', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });

      await expect(client.getProjectLocalesAsync('project')).rejects.toThrow('Not implemented');
    });

    it('should accept optional cancellationToken', async () => {
      const client = new TranslaasClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.example.com',
      });
      const controller = new AbortController();

      await expect(client.getProjectLocalesAsync('project', controller.signal)).rejects.toThrow(
        'Not implemented'
      );
    });
  });
});
