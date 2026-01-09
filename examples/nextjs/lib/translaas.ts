/**
 * Translaas Service Setup for Next.js
 *
 * Creates and configures TranslaasService instances for server and client use
 */

import { TranslaasService, CacheMode } from '@translaas/core';
import {
  LanguageResolver,
  RequestLanguageProvider,
  DefaultLanguageProvider,
} from '@translaas/extensions';

/**
 * Request object type compatible with RequestLanguageProvider
 * (Express.js and Next.js request objects)
 */
type RequestLike = {
  params?: Record<string, string>;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
};

/**
 * Creates a TranslaasService instance for server-side use
 */
export function createServerService(request?: RequestLike) {
  const defaultLanguage = process.env.TRANSLAAS_DEFAULT_LANGUAGE || 'en';
  const apiKey = process.env.TRANSLAAS_API_KEY;

  if (!apiKey) {
    throw new Error(
      'TRANSLAAS_API_KEY environment variable is required. ' +
        'Please set it in your .env.local file.'
    );
  }

  const resolver = request
    ? new LanguageResolver([
        new RequestLanguageProvider(request),
        new DefaultLanguageProvider(defaultLanguage),
      ])
    : undefined;

  return new TranslaasService({
    apiKey,
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
    languageResolver: resolver,
    defaultLanguage,
    cacheMode: CacheMode.Group,
    cacheAbsoluteExpiration: 3600000, // 1 hour
    cacheSlidingExpiration: 1800000, // 30 minutes
    timeout: 30000, // 30 seconds
  });
}

/**
 * Creates a TranslaasService instance for client-side use
 */
export function createClientService() {
  return new TranslaasService({
    apiKey: process.env.NEXT_PUBLIC_TRANSLAAS_API_KEY || '',
    baseUrl: process.env.NEXT_PUBLIC_TRANSLAAS_BASE_URL || 'https://api.translaas.com',
    defaultLanguage: 'en',
  });
}
