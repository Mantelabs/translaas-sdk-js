import { describe, it, expect } from 'vitest';
import { TranslationProject, TranslationGroup, PluralCategory } from './types';

describe('TranslationProject', () => {
  describe('constructor', () => {
    it('should create an empty project when no groups provided', () => {
      const project = new TranslationProject();
      expect(project.groups).toEqual({});
    });

    it('should create a project with provided groups', () => {
      const groups = {
        common: {
          welcome: 'Welcome',
          goodbye: 'Goodbye',
        },
        messages: {
          error: 'Error occurred',
        },
      };
      const project = new TranslationProject(groups);
      expect(project.groups).toEqual(groups);
    });

    it('should handle groups with plural forms', () => {
      const groups = {
        common: {
          item: {
            [PluralCategory.One]: 'one item',
            [PluralCategory.Other]: '{count} items',
          },
        },
      };
      const project = new TranslationProject(groups);
      expect(project.groups).toEqual(groups);
    });
  });

  describe('getGroup', () => {
    it('should return TranslationGroup instance for existing group', () => {
      const groups = {
        common: {
          welcome: 'Welcome',
          goodbye: 'Goodbye',
        },
      };
      const project = new TranslationProject(groups);
      const group = project.getGroup('common');

      expect(group).toBeInstanceOf(TranslationGroup);
      expect(group).not.toBeNull();
      expect(group?.entries).toEqual(groups.common);
      expect(group?.getValue('welcome')).toBe('Welcome');
      expect(group?.getValue('goodbye')).toBe('Goodbye');
    });

    it('should return null for non-existent group', () => {
      const project = new TranslationProject({
        common: {
          welcome: 'Welcome',
        },
      });
      expect(project.getGroup('nonexistent')).toBeNull();
    });

    it('should return null for empty project', () => {
      const project = new TranslationProject();
      expect(project.getGroup('any')).toBeNull();
    });

    it('should return independent TranslationGroup instances', () => {
      const groups = {
        common: {
          welcome: 'Welcome',
        },
        messages: {
          error: 'Error',
        },
      };
      const project = new TranslationProject(groups);
      const group1 = project.getGroup('common');
      const group2 = project.getGroup('common');

      expect(group1).not.toBe(group2); // Different instances
      expect(group1?.entries).toEqual(group2?.entries); // But same content
    });

    it('should handle groups with plural forms', () => {
      const groups = {
        common: {
          item: {
            [PluralCategory.One]: 'one item',
            [PluralCategory.Other]: '{count} items',
          },
        },
      };
      const project = new TranslationProject(groups);
      const group = project.getGroup('common');

      expect(group).not.toBeNull();
      expect(group?.hasPluralForms('item')).toBe(true);
      expect(group?.getPluralForm('item', PluralCategory.One)).toBe('one item');
    });
  });

  describe('edge cases', () => {
    it('should handle multiple groups', () => {
      const groups = {
        common: {
          welcome: 'Welcome',
        },
        messages: {
          error: 'Error',
        },
        ui: {
          button: 'Click me',
        },
      };
      const project = new TranslationProject(groups);

      expect(project.getGroup('common')?.getValue('welcome')).toBe('Welcome');
      expect(project.getGroup('messages')?.getValue('error')).toBe('Error');
      expect(project.getGroup('ui')?.getValue('button')).toBe('Click me');
    });

    it('should handle empty groups', () => {
      const groups = {
        empty: {},
        common: {
          welcome: 'Welcome',
        },
      };
      const project = new TranslationProject(groups);
      const emptyGroup = project.getGroup('empty');
      const commonGroup = project.getGroup('common');

      expect(emptyGroup).not.toBeNull();
      expect(emptyGroup?.entries).toEqual({});
      expect(commonGroup?.getValue('welcome')).toBe('Welcome');
    });

    it('should handle groups with same entry names', () => {
      const groups = {
        common: {
          message: 'Common message',
        },
        messages: {
          message: 'Messages message',
        },
      };
      const project = new TranslationProject(groups);

      expect(project.getGroup('common')?.getValue('message')).toBe('Common message');
      expect(project.getGroup('messages')?.getValue('message')).toBe('Messages message');
    });
  });
});
