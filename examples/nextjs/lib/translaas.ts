/**
 * Translaas Service Setup for Next.js
 *
 * Creates and configures TranslaasService instances for server and client use
 */

// Handle SSL certificate verification for local development
// Only disable SSL verification if using a local API (e.g., *.local domain)
if (typeof process !== 'undefined') {
  const baseUrl = process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com';
  if (
    baseUrl.includes('.local') ||
    baseUrl.includes('localhost') ||
    baseUrl.includes('127.0.0.1')
  ) {
    // Disable SSL certificate verification for local development only
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

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
 * Note: Webpack config excludes Node.js modules (fs, path, crypto) from client bundle
 *
 * In development, uses a Next.js API proxy to avoid CORS issues.
 * The proxy route at /api/proxy/[...path] forwards requests to the actual API server.
 */
export function createClientService() {
  // In browser/client-side, use relative URL to leverage Next.js API proxy
  // This avoids CORS issues when calling the API from the browser
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const baseUrl = isDevelopment
    ? window.location.origin // Use same origin - Next.js proxy will intercept /api/proxy/* requests
    : process.env.NEXT_PUBLIC_TRANSLAAS_BASE_URL || 'https://api.translaas.com';

  // For development, we don't need the API key in the client since the proxy adds it
  // But we still validate that it's configured for production use
  const apiKey = process.env.NEXT_PUBLIC_TRANSLAAS_API_KEY || '';

  if (!isDevelopment && (!apiKey || apiKey.trim() === '')) {
    throw new Error(
      'NEXT_PUBLIC_TRANSLAAS_API_KEY environment variable is required for client-side components. ' +
        'Please set it in your .env.local file. ' +
        'Note: Client-side variables must be prefixed with NEXT_PUBLIC_ to be accessible in the browser.'
    );
  }

  // In development, use proxy path; in production, use direct API URL
  const serviceBaseUrl = isDevelopment
    ? `${baseUrl}/api/proxy` // Proxy route
    : baseUrl;

  return new TranslaasService({
    apiKey: apiKey || 'proxy-handled', // Proxy will add the real API key
    baseUrl: serviceBaseUrl,
    defaultLanguage: 'en',
    // Don't use file-based caching on client side - webpack will exclude Node.js modules
    cacheMode: CacheMode.None, // Use in-memory cache only for client-side
  });
}
