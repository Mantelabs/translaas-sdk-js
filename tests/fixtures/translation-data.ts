import type { TranslationGroup, TranslationProject, ProjectLocales } from '@translaas/models';
import {
  TranslationGroup as TranslationGroupClass,
  TranslationProject as TranslationProjectClass,
  ProjectLocales as ProjectLocalesClass,
} from '@translaas/models';

/**
 * Test fixtures for translation data
 */

export const testProject = 'test-project';
export const testGroup = 'common';
export const testEntry = 'welcome';
export const testLanguages = ['en', 'fr', 'es'] as const;

/**
 * Translation entries for testing
 */
export const translationEntries = {
  en: {
    welcome: 'Welcome',
    greeting: 'Hello {name}',
    goodbye: 'Goodbye',
    items: '{count} items',
    error: 'An error occurred',
  },
  fr: {
    welcome: 'Bienvenue',
    greeting: 'Bonjour {name}',
    goodbye: 'Au revoir',
    items: '{count} éléments',
    error: 'Une erreur est survenue',
  },
  es: {
    welcome: 'Bienvenido',
    greeting: 'Hola {name}',
    goodbye: 'Adiós',
    items: '{count} elementos',
    error: 'Ocurrió un error',
  },
} as const;

/**
 * Translation groups for testing
 */
export function createTranslationGroup(
  _project: string,
  group: string,
  lang: string
): TranslationGroup {
  const entries =
    translationEntries[lang as keyof typeof translationEntries] || translationEntries.en;
  return new TranslationGroupClass(entries);
}

/**
 * Translation projects for testing
 */
export function createTranslationProject(project: string, lang: string): TranslationProject {
  const entries =
    translationEntries[lang as keyof typeof translationEntries] || translationEntries.en;

  return new TranslationProjectClass({
    common: {
      welcome: entries.welcome,
      greeting: entries.greeting,
      goodbye: entries.goodbye,
    },
    messages: {
      items: entries.items,
      error: entries.error,
    },
  });
}

/**
 * Project locales for testing
 */
export function createProjectLocales(_project: string): ProjectLocales {
  return new ProjectLocalesClass(['en', 'fr', 'es']);
}

/**
 * Cache test data
 */
export const cacheTestData = {
  project: testProject,
  group: testGroup,
  entry: testEntry,
  languages: testLanguages,
  entries: translationEntries,
};

/**
 * Helper to create test client options
 */
export function createTestClientOptions(baseUrl: string = 'https://api.test.translaas.com') {
  return {
    apiKey: 'test-api-key',
    baseUrl,
  };
}
