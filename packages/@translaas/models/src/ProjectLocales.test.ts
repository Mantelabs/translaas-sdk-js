import { describe, it, expect } from 'vitest';
import { ProjectLocales } from './types';

describe('ProjectLocales', () => {
  describe('constructor', () => {
    it('should create an empty locales list when no locales provided', () => {
      const locales = new ProjectLocales();
      expect(locales.locales).toEqual([]);
    });

    it('should create locales with provided array', () => {
      const localeArray = ['en', 'fr', 'es'];
      const locales = new ProjectLocales(localeArray);
      expect(locales.locales).toEqual(localeArray);
    });

    it('should handle single locale', () => {
      const locales = new ProjectLocales(['en']);
      expect(locales.locales).toEqual(['en']);
    });

    it('should handle many locales', () => {
      const localeArray = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko'];
      const locales = new ProjectLocales(localeArray);
      expect(locales.locales).toEqual(localeArray);
      expect(locales.locales.length).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string locales', () => {
      const locales = new ProjectLocales(['', 'en']);
      expect(locales.locales).toEqual(['', 'en']);
    });

    it('should handle locale codes with region', () => {
      const localeArray = ['en-US', 'en-GB', 'fr-CA', 'es-MX'];
      const locales = new ProjectLocales(localeArray);
      expect(locales.locales).toEqual(localeArray);
    });

    it('should handle duplicate locales', () => {
      const localeArray = ['en', 'fr', 'en', 'es'];
      const locales = new ProjectLocales(localeArray);
      expect(locales.locales).toEqual(localeArray);
      expect(locales.locales.length).toBe(4);
    });

    it('should preserve order of locales', () => {
      const localeArray = ['z', 'a', 'm', 'b'];
      const locales = new ProjectLocales(localeArray);
      expect(locales.locales).toEqual(localeArray);
    });
  });
});
