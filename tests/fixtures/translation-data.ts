import type { TranslationGroup, TranslationProject, ProjectLocales } from '@translaas/models';
import {
  TranslationGroup as TranslationGroupClass,
  TranslationProject as TranslationProjectClass,
  ProjectLocales as ProjectLocalesClass,
} from '@translaas/models';

/**
 * Test fixtures aligned with translaas-sdk-examples (translaas_sdk_samples_strings.csv).
 */

export const testProject = 'translaas-sdk-samples';
export const testGroup = 'common';
export const testEntry = 'welcome.message';
export const testPluralGroup = 'messages';
export const testPluralEntry = 'item';
export const testLanguages = ['en', 'fr', 'es'] as const;

/**
 * Translation entries for testing
 */
export const translationEntries = {
  en: {
    welcome: 'Welcome',
    'welcome.message':
      'This is a sample application demonstrating the Translaas SDK across different .NET platforms.',
    greeting: 'Hello {name}',
    goodbye: 'Goodbye',
    item: '{N} items',
    error: 'An error occurred',
  },
  fr: {
    welcome: 'Bienvenue',
    'welcome.message':
      "Ceci est une application d'exemple démontrant le SDK Translaas sur différentes plateformes .NET.",
    greeting: 'Bonjour {name}',
    goodbye: 'Au revoir',
    item: '{N} articles',
    error: "Une erreur s'est produite",
  },
  es: {
    welcome: 'Bienvenido',
    'welcome.message':
      'Esta es una aplicación de ejemplo que demuestra el SDK Translaas en diferentes plataformas .NET.',
    greeting: 'Hola {name}',
    goodbye: 'Adiós',
    item: '{N} artículos',
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
      'welcome.message': entries['welcome.message'],
      greeting: entries.greeting,
      goodbye: entries.goodbye,
    },
    messages: {
      item: entries.item,
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
