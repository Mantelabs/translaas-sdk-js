/**
 * Translaas Service Setup for Next.js
 *
 * Creates and configures TranslaasService instances for server and client use
 */

import { TranslaasService } from '@translaas/core';
import {
  LanguageResolver,
  RequestLanguageProvider,
  DefaultLanguageProvider,
} from '@translaas/extensions';

/**
 * Creates a TranslaasService instance for server-side use
 */
export function createServerService(request?: any) {
  const resolver = request
    ? new LanguageResolver([
        new RequestLanguageProvider(request),
        new DefaultLanguageProvider('en'),
      ])
    : undefined;

  return new TranslaasService({
    apiKey: process.env.TRANSLAAS_API_KEY!,
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
    languageResolver: resolver,
    defaultLanguage: 'en',
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
