import { describe, it, expect } from 'vitest';
import { CacheKeyBuilder } from '../CacheKeyBuilder';

describe('CacheKeyBuilder', () => {
  describe('buildEntryKey', () => {
    it('should build entry key with correct format', () => {
      const key = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      expect(key).toBe('entry:common:welcome:en');
    });

    it('should handle different group names', () => {
      const key1 = CacheKeyBuilder.buildEntryKey('messages', 'error', 'en');
      const key2 = CacheKeyBuilder.buildEntryKey('ui', 'button', 'en');

      expect(key1).toBe('entry:messages:error:en');
      expect(key2).toBe('entry:ui:button:en');
    });

    it('should handle different entry names', () => {
      const key1 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      const key2 = CacheKeyBuilder.buildEntryKey('common', 'goodbye', 'en');

      expect(key1).toBe('entry:common:welcome:en');
      expect(key2).toBe('entry:common:goodbye:en');
    });

    it('should handle different language codes', () => {
      const key1 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      const key2 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'fr');
      const key3 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'es');

      expect(key1).toBe('entry:common:welcome:en');
      expect(key2).toBe('entry:common:welcome:fr');
      expect(key3).toBe('entry:common:welcome:es');
    });

    it('should throw error for empty group', () => {
      expect(() => {
        CacheKeyBuilder.buildEntryKey('', 'welcome', 'en');
      }).toThrow('group must be a non-empty string');
    });

    it('should throw error for empty entry', () => {
      expect(() => {
        CacheKeyBuilder.buildEntryKey('common', '', 'en');
      }).toThrow('entry must be a non-empty string');
    });

    it('should throw error for empty lang', () => {
      expect(() => {
        CacheKeyBuilder.buildEntryKey('common', 'welcome', '');
      }).toThrow('lang must be a non-empty string');
    });

    it('should throw error for whitespace-only group', () => {
      expect(() => {
        CacheKeyBuilder.buildEntryKey('   ', 'welcome', 'en');
      }).toThrow('group must be a non-empty string');
    });

    it('should produce deterministic keys', () => {
      const key1 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      const key2 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      expect(key1).toBe(key2);
    });
  });

  describe('buildGroupKey', () => {
    it('should build group key with correct format', () => {
      const key = CacheKeyBuilder.buildGroupKey('my-project', 'common', 'en');
      expect(key).toBe('group:my-project:common:en');
    });

    it('should handle different project names', () => {
      const key1 = CacheKeyBuilder.buildGroupKey('project1', 'common', 'en');
      const key2 = CacheKeyBuilder.buildGroupKey('project2', 'common', 'en');

      expect(key1).toBe('group:project1:common:en');
      expect(key2).toBe('group:project2:common:en');
    });

    it('should handle different group names', () => {
      const key1 = CacheKeyBuilder.buildGroupKey('my-project', 'common', 'en');
      const key2 = CacheKeyBuilder.buildGroupKey('my-project', 'messages', 'en');

      expect(key1).toBe('group:my-project:common:en');
      expect(key2).toBe('group:my-project:messages:en');
    });

    it('should handle different language codes', () => {
      const key1 = CacheKeyBuilder.buildGroupKey('my-project', 'common', 'en');
      const key2 = CacheKeyBuilder.buildGroupKey('my-project', 'common', 'fr');

      expect(key1).toBe('group:my-project:common:en');
      expect(key2).toBe('group:my-project:common:fr');
    });

    it('should throw error for empty project', () => {
      expect(() => {
        CacheKeyBuilder.buildGroupKey('', 'common', 'en');
      }).toThrow('project must be a non-empty string');
    });

    it('should throw error for empty group', () => {
      expect(() => {
        CacheKeyBuilder.buildGroupKey('my-project', '', 'en');
      }).toThrow('group must be a non-empty string');
    });

    it('should throw error for empty lang', () => {
      expect(() => {
        CacheKeyBuilder.buildGroupKey('my-project', 'common', '');
      }).toThrow('lang must be a non-empty string');
    });

    it('should produce deterministic keys', () => {
      const key1 = CacheKeyBuilder.buildGroupKey('my-project', 'common', 'en');
      const key2 = CacheKeyBuilder.buildGroupKey('my-project', 'common', 'en');
      expect(key1).toBe(key2);
    });
  });

  describe('buildProjectKey', () => {
    it('should build project key with correct format', () => {
      const key = CacheKeyBuilder.buildProjectKey('my-project', 'en');
      expect(key).toBe('project:my-project:en');
    });

    it('should handle different project names', () => {
      const key1 = CacheKeyBuilder.buildProjectKey('project1', 'en');
      const key2 = CacheKeyBuilder.buildProjectKey('project2', 'en');

      expect(key1).toBe('project:project1:en');
      expect(key2).toBe('project:project2:en');
    });

    it('should handle different language codes', () => {
      const key1 = CacheKeyBuilder.buildProjectKey('my-project', 'en');
      const key2 = CacheKeyBuilder.buildProjectKey('my-project', 'fr');
      const key3 = CacheKeyBuilder.buildProjectKey('my-project', 'es');

      expect(key1).toBe('project:my-project:en');
      expect(key2).toBe('project:my-project:fr');
      expect(key3).toBe('project:my-project:es');
    });

    it('should throw error for empty project', () => {
      expect(() => {
        CacheKeyBuilder.buildProjectKey('', 'en');
      }).toThrow('project must be a non-empty string');
    });

    it('should throw error for empty lang', () => {
      expect(() => {
        CacheKeyBuilder.buildProjectKey('my-project', '');
      }).toThrow('lang must be a non-empty string');
    });

    it('should produce deterministic keys', () => {
      const key1 = CacheKeyBuilder.buildProjectKey('my-project', 'en');
      const key2 = CacheKeyBuilder.buildProjectKey('my-project', 'en');
      expect(key1).toBe(key2);
    });
  });

  describe('buildGroupLocalesKey', () => {
    it('should build group locales key with correct format', () => {
      const key = CacheKeyBuilder.buildGroupLocalesKey('my-project', 'common');
      expect(key).toBe('group-locales:my-project:common');
    });

    it('should handle different project names', () => {
      const key1 = CacheKeyBuilder.buildGroupLocalesKey('project1', 'common');
      const key2 = CacheKeyBuilder.buildGroupLocalesKey('project2', 'common');

      expect(key1).toBe('group-locales:project1:common');
      expect(key2).toBe('group-locales:project2:common');
    });

    it('should handle different group names', () => {
      const key1 = CacheKeyBuilder.buildGroupLocalesKey('my-project', 'common');
      const key2 = CacheKeyBuilder.buildGroupLocalesKey('my-project', 'messages');

      expect(key1).toBe('group-locales:my-project:common');
      expect(key2).toBe('group-locales:my-project:messages');
    });

    it('should throw error for empty project', () => {
      expect(() => {
        CacheKeyBuilder.buildGroupLocalesKey('', 'common');
      }).toThrow('project must be a non-empty string');
    });

    it('should throw error for empty group', () => {
      expect(() => {
        CacheKeyBuilder.buildGroupLocalesKey('my-project', '');
      }).toThrow('group must be a non-empty string');
    });

    it('should produce deterministic keys', () => {
      const key1 = CacheKeyBuilder.buildGroupLocalesKey('my-project', 'common');
      const key2 = CacheKeyBuilder.buildGroupLocalesKey('my-project', 'common');
      expect(key1).toBe(key2);
    });
  });

  describe('buildProjectLocalesKey', () => {
    it('should build project locales key with correct format', () => {
      const key = CacheKeyBuilder.buildProjectLocalesKey('my-project');
      expect(key).toBe('project-locales:my-project');
    });

    it('should handle different project names', () => {
      const key1 = CacheKeyBuilder.buildProjectLocalesKey('project1');
      const key2 = CacheKeyBuilder.buildProjectLocalesKey('project2');

      expect(key1).toBe('project-locales:project1');
      expect(key2).toBe('project-locales:project2');
    });

    it('should throw error for empty project', () => {
      expect(() => {
        CacheKeyBuilder.buildProjectLocalesKey('');
      }).toThrow('project must be a non-empty string');
    });

    it('should throw error for whitespace-only project', () => {
      expect(() => {
        CacheKeyBuilder.buildProjectLocalesKey('   ');
      }).toThrow('project must be a non-empty string');
    });

    it('should produce deterministic keys', () => {
      const key1 = CacheKeyBuilder.buildProjectLocalesKey('my-project');
      const key2 = CacheKeyBuilder.buildProjectLocalesKey('my-project');
      expect(key1).toBe(key2);
    });
  });

  describe('URL safety', () => {
    it('should produce keys with alphanumeric characters', () => {
      const key = CacheKeyBuilder.buildEntryKey('group123', 'entry456', 'en');
      expect(key).toBe('entry:group123:entry456:en');
      // Keys use colons as separators, which are safe for storage systems
      expect(key).toMatch(/^entry:group123:entry456:en$/);
    });

    it('should produce keys with hyphens and underscores', () => {
      const key = CacheKeyBuilder.buildGroupKey('my-project', 'common_group', 'en');
      expect(key).toBe('group:my-project:common_group:en');
      // Hyphens and underscores are safe characters
      expect(key).toMatch(/^group:my-project:common_group:en$/);
    });

    it('should handle keys with numbers', () => {
      const key = CacheKeyBuilder.buildProjectKey('project-123', 'en');
      expect(key).toBe('project:project-123:en');
      expect(key).toMatch(/^project:project-123:en$/);
    });

    it('should use colons as separators consistently', () => {
      const entryKey = CacheKeyBuilder.buildEntryKey('group', 'entry', 'en');
      const groupKey = CacheKeyBuilder.buildGroupKey('project', 'group', 'en');
      const projectKey = CacheKeyBuilder.buildProjectKey('project', 'en');

      // All keys should use colons as separators
      expect(entryKey.split(':')).toHaveLength(4);
      expect(groupKey.split(':')).toHaveLength(4);
      expect(projectKey.split(':')).toHaveLength(3);
    });

    it('should not contain spaces or other problematic characters', () => {
      const key = CacheKeyBuilder.buildProjectKey('my-project', 'en');
      // Should not contain spaces
      expect(key).not.toContain(' ');
      // Should not contain other problematic characters
      expect(key).not.toMatch(/[<>"|?*]/);
    });
  });

  describe('key uniqueness', () => {
    it('should produce unique keys for different entries', () => {
      const key1 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      const key2 = CacheKeyBuilder.buildEntryKey('common', 'goodbye', 'en');
      expect(key1).not.toBe(key2);
    });

    it('should produce unique keys for different groups', () => {
      const key1 = CacheKeyBuilder.buildGroupKey('project', 'common', 'en');
      const key2 = CacheKeyBuilder.buildGroupKey('project', 'messages', 'en');
      expect(key1).not.toBe(key2);
    });

    it('should produce unique keys for different projects', () => {
      const key1 = CacheKeyBuilder.buildProjectKey('project1', 'en');
      const key2 = CacheKeyBuilder.buildProjectKey('project2', 'en');
      expect(key1).not.toBe(key2);
    });

    it('should produce unique keys for different languages', () => {
      const key1 = CacheKeyBuilder.buildProjectKey('project', 'en');
      const key2 = CacheKeyBuilder.buildProjectKey('project', 'fr');
      expect(key1).not.toBe(key2);
    });

    it('should produce unique keys for different key types', () => {
      const entryKey = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      const groupKey = CacheKeyBuilder.buildGroupKey('project', 'common', 'en');
      const projectKey = CacheKeyBuilder.buildProjectKey('project', 'en');
      const groupLocalesKey = CacheKeyBuilder.buildGroupLocalesKey('project', 'common');
      const projectLocalesKey = CacheKeyBuilder.buildProjectLocalesKey('project');

      expect(entryKey).not.toBe(groupKey);
      expect(groupKey).not.toBe(projectKey);
      expect(projectKey).not.toBe(groupLocalesKey);
      expect(groupLocalesKey).not.toBe(projectLocalesKey);
    });
  });

  describe('key consistency', () => {
    it('should produce same key for same inputs multiple times', () => {
      const key1 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      const key2 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');
      const key3 = CacheKeyBuilder.buildEntryKey('common', 'welcome', 'en');

      expect(key1).toBe(key2);
      expect(key2).toBe(key3);
    });

    it('should produce consistent keys across different key types', () => {
      const project = 'my-project';
      const group = 'common';
      const lang = 'en';

      const groupKey = CacheKeyBuilder.buildGroupKey(project, group, lang);
      const projectKey = CacheKeyBuilder.buildProjectKey(project, lang);
      const groupLocalesKey = CacheKeyBuilder.buildGroupLocalesKey(project, group);
      const projectLocalesKey = CacheKeyBuilder.buildProjectLocalesKey(project);

      // All should contain the project name
      expect(groupKey).toContain(project);
      expect(projectKey).toContain(project);
      expect(groupLocalesKey).toContain(project);
      expect(projectLocalesKey).toContain(project);
    });
  });

  describe('edge cases', () => {
    it('should handle long project names', () => {
      const longProject = 'a'.repeat(100);
      const key = CacheKeyBuilder.buildProjectKey(longProject, 'en');
      expect(key).toBe(`project:${longProject}:en`);
    });

    it('should handle long group names', () => {
      const longGroup = 'a'.repeat(100);
      const key = CacheKeyBuilder.buildGroupKey('project', longGroup, 'en');
      expect(key).toBe(`group:project:${longGroup}:en`);
    });

    it('should handle special characters in names (if URL-safe)', () => {
      // Hyphens and underscores are URL-safe
      const key = CacheKeyBuilder.buildProjectKey('my-project_name', 'en');
      expect(key).toBe('project:my-project_name:en');
    });

    it('should throw error for null values', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        CacheKeyBuilder.buildProjectKey(null as any, 'en');
      }).toThrow();
    });

    it('should throw error for undefined values', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        CacheKeyBuilder.buildProjectKey(undefined as any, 'en');
      }).toThrow();
    });
  });
});
