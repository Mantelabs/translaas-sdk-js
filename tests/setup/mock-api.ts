import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Mock API server for integration tests using MSW (Mock Service Worker).
 *
 * Provides handlers for all Translaas API endpoints:
 * - GET /api/translations/text - Single translation entry
 * - GET /api/translations/group - Translation group
 * - GET /api/translations/project - Translation project
 * - GET /api/translations/locales - Project locales
 */

export interface MockApiConfig {
  baseUrl: string;
  apiKey?: string;
  delay?: number; // Simulate network delay in ms
}

export interface MockTranslationData {
  entries: Record<string, string>;
  groups: Record<string, Record<string, string>>;
  projects: Record<string, Record<string, Record<string, string>>>;
  locales: Record<string, string[]>;
}

/**
 * Default mock translation data
 */
export const defaultMockData: MockTranslationData = {
  entries: {
    'common.welcome.en': 'Welcome',
    'common.welcome.fr': 'Bienvenue',
    'common.welcome.es': 'Bienvenido',
    'common.greeting.en': 'Hello {name}',
    'common.greeting.fr': 'Bonjour {name}',
    'common.greeting.es': 'Hola {name}',
    'messages.items.en': '{count} items',
    'messages.items.fr': '{count} éléments',
    'messages.items.es': '{count} elementos',
  },
  groups: {
    'test-project.common.en': {
      welcome: 'Welcome',
      greeting: 'Hello {name}',
    },
    'test-project.common.fr': {
      welcome: 'Bienvenue',
      greeting: 'Bonjour {name}',
    },
    'test-project.messages.en': {
      items: '{count} items',
      error: 'An error occurred',
    },
    'test-project.messages.fr': {
      items: '{count} éléments',
      error: 'Une erreur est survenue',
    },
  },
  projects: {
    'test-project.en': {
      common: {
        welcome: 'Welcome',
        greeting: 'Hello {name}',
      },
      messages: {
        items: '{count} items',
        error: 'An error occurred',
      },
    },
    'test-project.fr': {
      common: {
        welcome: 'Bienvenue',
        greeting: 'Bonjour {name}',
      },
      messages: {
        items: '{count} éléments',
        error: 'Une erreur est survenue',
      },
    },
    'test-project.es': {
      common: {
        welcome: 'Bienvenido',
        greeting: 'Hola {name}',
      },
      messages: {
        items: '{count} elementos',
        error: 'Ocurrió un error',
      },
    },
  },
  locales: {
    'test-project': ['en', 'fr', 'es'],
  },
};

/**
 * Creates MSW handlers for the Translaas API
 */
export function createMockHandlers(
  config: MockApiConfig,
  data: MockTranslationData = defaultMockData
) {
  const { baseUrl, apiKey, delay = 0 } = config;

  return [
    // GET /api/translations/text - Single translation entry
    http.get(`${baseUrl}/api/translations/text`, async ({ request }) => {
      // Check API key
      if (apiKey && request.headers.get('X-Api-Key') !== apiKey) {
        return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      const url = new URL(request.url);
      const group = url.searchParams.get('group');
      const entry = url.searchParams.get('entry');
      const lang = url.searchParams.get('lang');
      const _number = url.searchParams.get('n');
      const parameters: Record<string, string> = {};

      // Extract custom parameters
      url.searchParams.forEach((value, key) => {
        if (!['group', 'entry', 'lang', 'n'].includes(key)) {
          parameters[key] = value;
        }
      });

      if (!group || !entry || !lang) {
        return HttpResponse.json(
          { error: 'Missing required parameters: group, entry, lang' },
          { status: 400 }
        );
      }

      const key = `${group}.${entry}.${lang}`;
      let translation = data.entries[key];

      if (!translation) {
        return HttpResponse.text('Translation not found', { status: 404 });
      }

      // Apply parameter substitution
      if (parameters) {
        Object.entries(parameters).forEach(([paramKey, paramValue]) => {
          translation = translation.replace(`{${paramKey}}`, paramValue);
        });
      }

      // Simulate network delay
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return HttpResponse.text(translation);
    }),

    // GET /api/translations/group - Translation group
    http.get(`${baseUrl}/api/translations/group`, async ({ request }) => {
      if (apiKey && request.headers.get('X-Api-Key') !== apiKey) {
        return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      const url = new URL(request.url);
      const project = url.searchParams.get('project');
      const group = url.searchParams.get('group');
      const lang = url.searchParams.get('lang');

      if (!project || !group || !lang) {
        return HttpResponse.json(
          { error: 'Missing required parameters: project, group, lang' },
          { status: 400 }
        );
      }

      const key = `${project}.${group}.${lang}`;
      const groupData = data.groups[key];

      if (!groupData) {
        return HttpResponse.json({ error: 'Group not found' }, { status: 404 });
      }

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return HttpResponse.json(groupData);
    }),

    // GET /api/translations/project - Translation project
    http.get(`${baseUrl}/api/translations/project`, async ({ request }) => {
      if (apiKey && request.headers.get('X-Api-Key') !== apiKey) {
        return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      const url = new URL(request.url);
      const project = url.searchParams.get('project');
      const lang = url.searchParams.get('lang');

      if (!project || !lang) {
        return HttpResponse.json(
          { error: 'Missing required parameters: project, lang' },
          { status: 400 }
        );
      }

      const key = `${project}.${lang}`;
      const projectData = data.projects[key];

      if (!projectData) {
        return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return HttpResponse.json(projectData);
    }),

    // GET /api/translations/locales - Project locales
    http.get(`${baseUrl}/api/translations/locales`, async ({ request }) => {
      if (apiKey && request.headers.get('X-Api-Key') !== apiKey) {
        return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      const url = new URL(request.url);
      const project = url.searchParams.get('project');

      if (!project) {
        return HttpResponse.json({ error: 'Missing required parameter: project' }, { status: 400 });
      }

      const locales = data.locales[project];

      if (!locales) {
        return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return HttpResponse.json({ locales });
    }),
  ];
}

/**
 * Creates and configures the mock API server
 */
export function createMockServer(config: MockApiConfig, data?: MockTranslationData) {
  const handlers = createMockHandlers(config, data);
  return setupServer(...handlers);
}

/**
 * Helper to create error responses for testing error scenarios
 */
export function createErrorHandlers(config: MockApiConfig) {
  const { baseUrl } = config;

  return {
    // 500 Internal Server Error
    serverError: http.get(`${baseUrl}/api/translations/text`, () => {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }),

    // Network timeout (simulated by long delay)
    timeout: http.get(`${baseUrl}/api/translations/text`, async () => {
      await new Promise(resolve => setTimeout(resolve, 60000)); // 60 second delay
      return HttpResponse.text('Should timeout');
    }),

    // 404 Not Found
    notFound: http.get(`${baseUrl}/api/translations/text`, () => {
      return HttpResponse.text('Not found', { status: 404 });
    }),

    // 401 Unauthorized
    unauthorized: http.get(`${baseUrl}/api/translations/text`, () => {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }),

    // 503 Service Unavailable
    serviceUnavailable: http.get(`${baseUrl}/api/translations/*`, () => {
      return HttpResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }),

    // 429 Too Many Requests (rate limiting)
    rateLimit: http.get(`${baseUrl}/api/translations/text`, () => {
      return HttpResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }),

    // Network error simulation
    networkError: http.get(`${baseUrl}/api/translations/*`, () => {
      throw new Error('Network error');
    }),

    // Malformed JSON response
    malformedJson: http.get(`${baseUrl}/api/translations/group`, () => {
      return HttpResponse.text('Invalid JSON {', {
        headers: { 'Content-Type': 'application/json' },
      });
    }),

    // Empty response
    emptyResponse: http.get(`${baseUrl}/api/translations/text`, () => {
      return HttpResponse.text('');
    }),
  };
}

/**
 * Helper to create handlers with custom delays for testing timeout scenarios
 */
export function createDelayedHandlers(config: MockApiConfig, delayMs: number) {
  const { baseUrl, apiKey } = config;

  return [
    http.get(`${baseUrl}/api/translations/text`, async ({ request }) => {
      if (apiKey && request.headers.get('X-Api-Key') !== apiKey) {
        return HttpResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
      return HttpResponse.text('Delayed response');
    }),
  ];
}
