import { describe, it, expect } from 'vitest';
import {
  TranslaasException,
  TranslaasApiException,
  TranslaasConfigurationException,
  TranslaasOfflineCacheException,
  TranslaasOfflineCacheMissException,
} from './errors';

describe('TranslaasException', () => {
  it('should create exception with message', () => {
    const error = new TranslaasException('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('TranslaasException');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TranslaasException);
  });

  it('should create exception with inner error', () => {
    const innerError = new Error('Inner error');
    const error = new TranslaasException('Outer error', innerError);
    expect(error.message).toBe('Outer error');
    expect(error.innerError).toBe(innerError);
  });

  it('should have stack trace', () => {
    const error = new TranslaasException('Test error');
    expect(error.stack).toBeDefined();
  });
});

describe('TranslaasApiException', () => {
  it('should create exception with message and status code', () => {
    const error = new TranslaasApiException('API error', 404);
    expect(error.message).toBe('API error');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('TranslaasApiException');
    expect(error).toBeInstanceOf(TranslaasException);
  });

  it('should create exception without status code', () => {
    const error = new TranslaasApiException('API error');
    expect(error.message).toBe('API error');
    expect(error.statusCode).toBeUndefined();
  });

  it('should create exception with inner error', () => {
    const innerError = new Error('Network error');
    const error = new TranslaasApiException('API error', 500, innerError);
    expect(error.statusCode).toBe(500);
    expect(error.innerError).toBe(innerError);
  });

  it('should handle various HTTP status codes', () => {
    expect(new TranslaasApiException('Not found', 404).statusCode).toBe(404);
    expect(new TranslaasApiException('Unauthorized', 401).statusCode).toBe(401);
    expect(new TranslaasApiException('Server error', 500).statusCode).toBe(500);
  });
});

describe('TranslaasConfigurationException', () => {
  it('should create exception with message', () => {
    const error = new TranslaasConfigurationException('Configuration error');
    expect(error.message).toBe('Configuration error');
    expect(error.name).toBe('TranslaasConfigurationException');
    expect(error).toBeInstanceOf(TranslaasException);
  });

  it('should create exception with inner error', () => {
    const innerError = new Error('Validation error');
    const error = new TranslaasConfigurationException('Configuration error', innerError);
    expect(error.innerError).toBe(innerError);
  });
});

describe('TranslaasOfflineCacheException', () => {
  it('should create exception with message', () => {
    const error = new TranslaasOfflineCacheException('Cache error');
    expect(error.message).toBe('Cache error');
    expect(error.name).toBe('TranslaasOfflineCacheException');
    expect(error).toBeInstanceOf(TranslaasException);
  });

  it('should create exception with cache directory', () => {
    const error = new TranslaasOfflineCacheException('Cache error', '/path/to/cache');
    expect(error.cacheDirectory).toBe('/path/to/cache');
  });

  it('should create exception with project and language', () => {
    const error = new TranslaasOfflineCacheException(
      'Cache error',
      '/path/to/cache',
      'project1',
      'en'
    );
    expect(error.cacheDirectory).toBe('/path/to/cache');
    expect(error.project).toBe('project1');
    expect(error.language).toBe('en');
  });

  it('should create exception with inner error', () => {
    const innerError = new Error('File system error');
    const error = new TranslaasOfflineCacheException(
      'Cache error',
      '/path/to/cache',
      'project1',
      'en',
      innerError
    );
    expect(error.innerError).toBe(innerError);
  });
});

describe('TranslaasOfflineCacheMissException', () => {
  it('should create exception with message', () => {
    const error = new TranslaasOfflineCacheMissException('Cache miss');
    expect(error.message).toBe('Cache miss');
    expect(error.name).toBe('TranslaasOfflineCacheMissException');
    expect(error).toBeInstanceOf(TranslaasOfflineCacheException);
    expect(error).toBeInstanceOf(TranslaasException);
  });

  it('should create exception with cache directory, project, and language', () => {
    const error = new TranslaasOfflineCacheMissException(
      'Cache miss',
      '/path/to/cache',
      'project1',
      'en'
    );
    expect(error.cacheDirectory).toBe('/path/to/cache');
    expect(error.project).toBe('project1');
    expect(error.language).toBe('en');
  });

  it('should create exception with inner error', () => {
    const innerError = new Error('File not found');
    const error = new TranslaasOfflineCacheMissException(
      'Cache miss',
      '/path/to/cache',
      'project1',
      'en',
      innerError
    );
    expect(error.innerError).toBe(innerError);
  });
});
