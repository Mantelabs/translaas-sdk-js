/**
 * Translaas Middleware for Express.js
 *
 * Creates middleware that adds TranslaasService to the request object
 * with automatic language resolution from HTTP request
 */

import { TranslaasService } from '@translaas/core';
import {
  LanguageResolver,
  RequestLanguageProvider,
  DefaultLanguageProvider,
} from '@translaas/extensions';

/**
 * Creates Express middleware that adds TranslaasService to request object
 */
export function createTranslaasMiddleware() {
  return (req, res, next) => {
    // Create a language resolver for this request with the actual request object
    const requestResolver = new LanguageResolver([
      new RequestLanguageProvider(req),
      new DefaultLanguageProvider('en'),
    ]);

    // Create a service instance for this request
    req.translaas = new TranslaasService({
      apiKey: process.env.TRANSLAAS_API_KEY,
      baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
      languageResolver: requestResolver,
      defaultLanguage: 'en',
    });

    next();
  };
}
