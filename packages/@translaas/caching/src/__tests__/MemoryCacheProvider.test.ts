import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryCacheProvider } from '../MemoryCacheProvider';

describe('MemoryCacheProvider', () => {
  let cache: MemoryCacheProvider;

  beforeEach(() => {
    cache = new MemoryCacheProvider();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create an instance of MemoryCacheProvider', () => {
      expect(cache).toBeInstanceOf(MemoryCacheProvider);
    });

    it('should initialize with empty cache', () => {
      expect(cache.get('non-existent')).toBeNull();
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    it('should return cached value for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return cached value with correct type', () => {
      cache.set('number', 42);
      cache.set('string', 'hello');
      cache.set('object', { foo: 'bar' });
      cache.set('array', [1, 2, 3]);

      expect(cache.get<number>('number')).toBe(42);
      expect(cache.get<string>('string')).toBe('hello');
      expect(cache.get<{ foo: string }>('object')).toEqual({ foo: 'bar' });
      expect(cache.get<number[]>('array')).toEqual([1, 2, 3]);
    });

    it('should return null for expired entry with absolute expiration', () => {
      cache.set('key1', 'value1', 1000); // Expires after 1 second
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1001); // Advance time by 1 second + 1ms
      expect(cache.get('key1')).toBeNull();
    });

    it('should return null for expired entry with sliding expiration', () => {
      cache.set('key1', 'value1', undefined, 1000); // Sliding expiration: 1 second
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1001); // Advance time by 1 second + 1ms
      expect(cache.get('key1')).toBeNull();
    });

    it('should update lastAccessed timestamp on get for sliding expiration', () => {
      cache.set('key1', 'value1', undefined, 2000); // Sliding expiration: 2 seconds

      // First access at time 0
      expect(cache.get('key1')).toBe('value1');
      vi.advanceTimersByTime(1000); // Advance to time 1000

      // Second access at time 1000 - resets sliding expiration timer
      expect(cache.get('key1')).toBe('value1');
      vi.advanceTimersByTime(1000); // Advance to time 2000

      // Third access at time 2000 - still valid (1 second since last access)
      expect(cache.get('key1')).toBe('value1');
      vi.advanceTimersByTime(2000); // Advance to time 4000

      // Fourth access at time 4000 - should expire (2 seconds since last access at 2000)
      expect(cache.get('key1')).toBeNull();
    });

    it('should return null when both expiration types are expired', () => {
      cache.set('key1', 'value1', 500, 1000); // Absolute: 500ms, Sliding: 1000ms
      expect(cache.get('key1')).toBe('value1');

      // Expire absolute expiration first
      vi.advanceTimersByTime(501);
      expect(cache.get('key1')).toBeNull();
    });

    it('should remove expired entry from cache', () => {
      cache.set('key1', 'value1', 1000);
      vi.advanceTimersByTime(1001);
      cache.get('key1'); // This should remove the expired entry

      // Entry should be removed, not just expired
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value without expiration', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should overwrite existing value', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    it('should store value with absolute expiration', () => {
      cache.set('key1', 'value1', 1000);
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(999);
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(2);
      expect(cache.get('key1')).toBeNull();
    });

    it('should store value with sliding expiration', () => {
      cache.set('key1', 'value1', undefined, 1000);
      expect(cache.get('key1')).toBe('value1'); // Access at time 0, lastAccessed = 0

      vi.advanceTimersByTime(999); // Advance to time 999
      expect(cache.get('key1')).toBe('value1'); // Access resets timer, lastAccessed = 999

      // Advance 2ms more to time 1001 (2ms from last access at 999)
      vi.advanceTimersByTime(2);
      expect(cache.get('key1')).toBe('value1'); // Access resets timer again, lastAccessed = 1001

      // Advance to time 2001 (1000ms from last access at 1001, exactly at expiration)
      vi.advanceTimersByTime(1000);
      expect(cache.get('key1')).toBeNull(); // Expired (1000ms >= 1000ms)
    });

    it('should store value with both absolute and sliding expiration', () => {
      cache.set('key1', 'value1', 2000, 1000); // Absolute: 2s, Sliding: 1s

      // Should be valid initially at time 0
      expect(cache.get('key1')).toBe('value1');

      // Advance 500ms and access - should still be valid, resets sliding timer
      vi.advanceTimersByTime(500); // Time = 500
      expect(cache.get('key1')).toBe('value1'); // lastAccessed = 500

      // Advance another 600ms (total 600ms from last access) - still valid
      vi.advanceTimersByTime(600); // Time = 1100
      expect(cache.get('key1')).toBe('value1'); // lastAccessed = 1100

      // Advance another 500ms (total 500ms from last access) - still valid
      vi.advanceTimersByTime(500); // Time = 1600
      expect(cache.get('key1')).toBe('value1'); // lastAccessed = 1600

      // Advance another 500ms to time 2100 - absolute expiration expires (set at 0 + 2000 = 2000)
      vi.advanceTimersByTime(500);
      expect(cache.get('key1')).toBeNull(); // Absolute expiration expired at time 2000
    });

    it('should handle zero expiration values', () => {
      cache.set('key1', 'value1', 0);
      expect(cache.get('key1')).toBeNull(); // Should expire immediately
    });

    it('should handle multiple keys independently', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 2000);
      cache.set('key3', 'value3');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');

      vi.advanceTimersByTime(1001);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('remove', () => {
    it('should remove existing entry', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      cache.remove('key1');
      expect(cache.get('key1')).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => cache.remove('non-existent')).not.toThrow();
    });

    it('should remove entry with expiration', () => {
      cache.set('key1', 'value1', 1000);
      cache.remove('key1');
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });

    it('should work on empty cache', () => {
      expect(() => cache.clear()).not.toThrow();
    });

    it('should clear entries with different expiration types', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', undefined, 2000);
      cache.set('key3', 'value3', 3000, 4000);
      cache.set('key4', 'value4');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
      expect(cache.get('key4')).toBeNull();
    });
  });

  describe('expiration edge cases', () => {
    it('should handle absolute expiration exactly at expiration time', () => {
      cache.set('key1', 'value1', 1000);
      vi.advanceTimersByTime(1000);
      expect(cache.get('key1')).toBeNull();
    });

    it('should handle sliding expiration exactly at expiration time', () => {
      cache.set('key1', 'value1', undefined, 1000);
      vi.advanceTimersByTime(1000);
      expect(cache.get('key1')).toBeNull();
    });

    it('should handle very large expiration values', () => {
      cache.set('key1', 'value1', Number.MAX_SAFE_INTEGER);
      expect(cache.get('key1')).toBe('value1');
    });

    it('should handle sliding expiration reset on multiple accesses', () => {
      cache.set('key1', 'value1', undefined, 1000);

      // Access multiple times within expiration window
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(500);
        expect(cache.get('key1')).toBe('value1');
      }

      // Now expire
      vi.advanceTimersByTime(1001);
      expect(cache.get('key1')).toBeNull();
    });

    it('should expire when absolute expiration is shorter than sliding', () => {
      cache.set('key1', 'value1', 1000, 2000); // Absolute: 1s, Sliding: 2s
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(500);
      expect(cache.get('key1')).toBe('value1'); // Still valid

      vi.advanceTimersByTime(501); // Total 1001ms - absolute expired
      expect(cache.get('key1')).toBeNull();
    });

    it('should expire when sliding expiration is shorter than absolute', () => {
      cache.set('key1', 'value1', 2000, 1000); // Absolute: 2s, Sliding: 1s
      expect(cache.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1001); // Sliding expired
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('concurrent operations', () => {
    it('should handle rapid get/set operations', () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`);
        expect(cache.get(`key${i}`)).toBe(`value${i}`);
      }
    });

    it('should handle interleaved operations', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.get('key1')).toBe('value1');
      cache.remove('key1');
      expect(cache.get('key2')).toBe('value2');
      cache.clear();
      expect(cache.get('key2')).toBeNull();
    });
  });
});
