/**
 * Translaas Service Setup for Next.js
 *
 * Creates and configures TranslaasService instances for server and client use.
 * SDK HTTP routes default to `/sdk/v1/translations/...` on the upstream API; the browser
 * uses `baseUrl` `${origin}/api/proxy`, so requests hit `/api/proxy/sdk/v1/translations/...`
 * and the proxy forwards them unchanged to `TRANSLAAS_BASE_URL`.
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

  const defaultProjectId =
    process.env.TRANSLAAS_PROJECT || process.env.NEXT_PUBLIC_TRANSLAAS_PROJECT;

  return new TranslaasService({
    apiKey,
    baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
    ...(defaultProjectId ? { defaultProjectId } : {}),
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
 * SECURITY: This function uses a Next.js API proxy route (/api/proxy/[...path]) that handles
 * authentication server-side. The API key is NEVER exposed to the browser.
 *
 * In development (localhost), the proxy automatically adds the API key from server-side env vars.
 * In production, you should continue using the proxy or ensure your API supports CORS and
 * consider the security implications of exposing API keys to the browser.
 */
export function createClientService() {
  // In browser/client-side, use relative URL to leverage Next.js API proxy
  // This avoids CORS issues and keeps API keys server-side (secure)
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const baseUrl = isDevelopment
    ? window.location.origin // Use same origin - Next.js proxy will intercept /api/proxy/* requests
    : process.env.NEXT_PUBLIC_TRANSLAAS_BASE_URL || 'https://api.translaas.com';

  // Always use the proxy route - it handles authentication server-side
  // This ensures API keys are never exposed to the browser
  const serviceBaseUrl = `${baseUrl}/api/proxy`;
  const defaultProjectId = process.env.NEXT_PUBLIC_TRANSLAAS_PROJECT;

  return new TranslaasService({
    // API key is handled by the proxy route server-side
    // Using a placeholder since the proxy adds the real key
    apiKey: 'proxy-handled',
    baseUrl: serviceBaseUrl,
    ...(defaultProjectId ? { defaultProjectId } : {}),
    defaultLanguage: 'en',
    // Don't use file-based caching on client side - webpack will exclude Node.js modules
    cacheMode: CacheMode.None, // Use in-memory cache only for client-side
  });
}
