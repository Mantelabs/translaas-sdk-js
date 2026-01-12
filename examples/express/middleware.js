/**
 * Translaas Middleware for Express.js
 *
 * Creates middleware that adds TranslaasService to the request object
 * with automatic language resolution from HTTP request
 */

import { TranslaasService, CacheMode } from '@translaas/core';
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
    try {
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
        defaultLanguage: process.env.TRANSLAAS_DEFAULT_LANGUAGE || 'en',
        cacheMode: CacheMode.Group,
        cacheAbsoluteExpiration: 3600000, // 1 hour
        cacheSlidingExpiration: 1800000, // 30 minutes
        timeout: 30000, // 30 seconds
      });

      next();
    } catch (error) {
      console.error('Translaas middleware error:', error);
      next(error);
    }
  };
}
