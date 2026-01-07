import { describe, it, expect } from 'vitest';
import { TranslationGroup, PluralCategory } from './types';

describe('TranslationGroup', () => {
  describe('constructor', () => {
    it('should create an empty group when no entries provided', () => {
      const group = new TranslationGroup();
      expect(group.entries).toEqual({});
    });

    it('should create a group with provided entries', () => {
      const entries = {
        welcome: 'Welcome',
        goodbye: 'Goodbye',
      };
      const group = new TranslationGroup(entries);
      expect(group.entries).toEqual(entries);
    });

    it('should handle entries with plural forms', () => {
      const entries = {
        item: {
          [PluralCategory.Zero]: 'no items',
          [PluralCategory.One]: 'one item',
          [PluralCategory.Other]: '{count} items',
        },
      };
      const group = new TranslationGroup(entries);
      expect(group.entries).toEqual(entries);
    });
  });

  describe('getValue', () => {
    it('should return string value for simple entry', () => {
      const group = new TranslationGroup({
        welcome: 'Welcome',
      });
      expect(group.getValue('welcome')).toBe('Welcome');
    });

    it('should return null for entry with plural forms', () => {
      const group = new TranslationGroup({
        item: {
          [PluralCategory.One]: 'one item',
          [PluralCategory.Other]: '{count} items',
        },
      });
      expect(group.getValue('item')).toBeNull();
    });

    it('should return null for non-existent entry', () => {
      const group = new TranslationGroup({
        welcome: 'Welcome',
      });
      // When key doesn't exist, entry is undefined, which is not a string, so returns null
      expect(group.getValue('nonexistent')).toBeNull();
    });
  });

  describe('getPluralForms', () => {
    it('should return plural forms dictionary for entry with plural forms', () => {
      const pluralForms = {
        [PluralCategory.Zero]: 'no items',
        [PluralCategory.One]: 'one item',
        [PluralCategory.Two]: 'two items',
        [PluralCategory.Few]: 'few items',
        [PluralCategory.Many]: 'many items',
        [PluralCategory.Other]: '{count} items',
      };
      const group = new TranslationGroup({
        item: pluralForms,
      });
      expect(group.getPluralForms('item')).toEqual(pluralForms);
    });

    it('should return null for simple string entry', () => {
      const group = new TranslationGroup({
        welcome: 'Welcome',
      });
      expect(group.getPluralForms('welcome')).toBeNull();
    });

    it('should return null for non-existent entry', () => {
      const group = new TranslationGroup();
      expect(group.getPluralForms('nonexistent')).toBeNull();
    });
  });

  describe('hasPluralForms', () => {
    it('should return true for entry with plural forms', () => {
      const group = new TranslationGroup({
        item: {
          [PluralCategory.One]: 'one item',
          [PluralCategory.Other]: '{count} items',
        },
      });
      expect(group.hasPluralForms('item')).toBe(true);
    });

    it('should return false for simple string entry', () => {
      const group = new TranslationGroup({
        welcome: 'Welcome',
      });
      expect(group.hasPluralForms('welcome')).toBe(false);
    });

    it('should return false for non-existent entry', () => {
      const group = new TranslationGroup();
      expect(group.hasPluralForms('nonexistent')).toBe(false);
    });
  });

  describe('getPluralForm', () => {
    it('should return specific plural form for category', () => {
      const group = new TranslationGroup({
        item: {
          [PluralCategory.One]: 'one item',
          [PluralCategory.Other]: '{count} items',
        },
      });
      expect(group.getPluralForm('item', PluralCategory.One)).toBe('one item');
      expect(group.getPluralForm('item', PluralCategory.Other)).toBe('{count} items');
    });

    it('should return null for non-existent category', () => {
      const group = new TranslationGroup({
        item: {
          [PluralCategory.One]: 'one item',
          [PluralCategory.Other]: '{count} items',
        },
      });
      expect(group.getPluralForm('item', PluralCategory.Zero)).toBeNull();
    });

    it('should return null for simple string entry', () => {
      const group = new TranslationGroup({
        welcome: 'Welcome',
      });
      expect(group.getPluralForm('welcome', PluralCategory.One)).toBeNull();
    });

    it('should return null for non-existent entry', () => {
      const group = new TranslationGroup();
      expect(group.getPluralForm('nonexistent', PluralCategory.One)).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle mixed entries (strings and plural forms)', () => {
      const group = new TranslationGroup({
        welcome: 'Welcome',
        item: {
          [PluralCategory.One]: 'one item',
          [PluralCategory.Other]: '{count} items',
        },
        goodbye: 'Goodbye',
      });
      expect(group.getValue('welcome')).toBe('Welcome');
      expect(group.hasPluralForms('welcome')).toBe(false);
      expect(group.getValue('item')).toBeNull();
      expect(group.hasPluralForms('item')).toBe(true);
      expect(group.getValue('goodbye')).toBe('Goodbye');
    });

    it('should handle empty string entries', () => {
      const group = new TranslationGroup({
        empty: '',
      });
      expect(group.getValue('empty')).toBe('');
      expect(group.hasPluralForms('empty')).toBe(false);
    });

    it('should handle all plural categories', () => {
      const allCategories = {
        [PluralCategory.Zero]: 'zero',
        [PluralCategory.One]: 'one',
        [PluralCategory.Two]: 'two',
        [PluralCategory.Few]: 'few',
        [PluralCategory.Many]: 'many',
        [PluralCategory.Other]: 'other',
      };
      const group = new TranslationGroup({ test: allCategories });
      expect(group.getPluralForms('test')).toEqual(allCategories);
      expect(group.getPluralForm('test', PluralCategory.Zero)).toBe('zero');
      expect(group.getPluralForm('test', PluralCategory.One)).toBe('one');
      expect(group.getPluralForm('test', PluralCategory.Two)).toBe('two');
      expect(group.getPluralForm('test', PluralCategory.Few)).toBe('few');
      expect(group.getPluralForm('test', PluralCategory.Many)).toBe('many');
      expect(group.getPluralForm('test', PluralCategory.Other)).toBe('other');
    });
  });
});
