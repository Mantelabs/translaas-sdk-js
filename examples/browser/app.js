/**
 * Browser Example Application
 *
 * Demonstrates Translaas SDK usage in browser environment
 */

import { TranslaasService } from '@translaas/core';
import { BrowserCacheProvider } from '@translaas/caching-file';
import {
  LanguageResolver,
  CultureLanguageProvider,
  DefaultLanguageProvider,
} from '@translaas/extensions';

// Configuration
// Note: In a real application, load these from environment variables or a config file
// For this example, you need to configure your API credentials in .env file or update these values
const TRANSLAAS_API_KEY = import.meta.env?.VITE_TRANSLAAS_API_KEY || 'your-api-key-here';
const TRANSLAAS_BASE_URL_ENV = import.meta.env?.VITE_TRANSLAAS_BASE_URL || 'https://api.translaas.com';
const TRANSLAAS_PROJECT =
  import.meta.env?.VITE_TRANSLAAS_PROJECT || 'translaas-sdk-samples';

// In development, use relative URL to leverage Vite proxy (avoids CORS issues)
// The proxy intercepts /api/* requests and forwards them to the actual API server
// In production, use the full API URL
const isDevelopment = import.meta.env.DEV;
const TRANSLAAS_BASE_URL = isDevelopment
  ? window.location.origin // Use same origin - Vite proxy will intercept /api/* requests
  : TRANSLAAS_BASE_URL_ENV; // Use full URL in production

// Check if API credentials are configured
const isConfigured = TRANSLAAS_API_KEY && TRANSLAAS_API_KEY !== 'your-api-key-here' && TRANSLAAS_BASE_URL_ENV;

// Initialize browser cache provider
const browserCache = new BrowserCacheProvider();

// Initialize language resolver
const languageResolver = new LanguageResolver([
  new CultureLanguageProvider(), // Detects browser language
  new DefaultLanguageProvider('en'), // Fallback to English
]);

// Initialize Translaas service
const translaas = new TranslaasService({
  apiKey: TRANSLAAS_API_KEY,
  baseUrl: TRANSLAAS_BASE_URL,
  defaultProjectId: TRANSLAAS_PROJECT,
  languageResolver,
  defaultLanguage: 'en',
  offlineCache: {
    enabled: true,
    provider: browserCache,
  },
});

// Get detected language
async function updateDetectedLanguage() {
  const lang = await languageResolver.resolveLanguageAsync();
  document.getElementById('detected-lang').textContent = lang || 'en';
}

// Load translations
async function loadTranslations(lang = 'en') {
  const projectId = 'translaas-sdk-samples';
  const appNameEl = document.getElementById('app-name-text');
  const welcomeEl = document.getElementById('welcome-text');
  const greetingEl = document.getElementById('greeting-text');
  const itemsEl = document.getElementById('items-text');

  // Check if credentials are configured
  if (!isConfigured) {
    const configError =
      '⚠️ API credentials not configured. Please set VITE_TRANSLAAS_API_KEY and VITE_TRANSLAAS_BASE_URL in your .env file. See README.md for instructions.';
    if (appNameEl) appNameEl.textContent = configError;
    if (welcomeEl) welcomeEl.textContent = configError;
    if (greetingEl) greetingEl.textContent = configError;
    if (itemsEl) itemsEl.textContent = configError;
    console.warn(configError);
    return;
  }

  try {
    // Update UI
    if (appNameEl) appNameEl.textContent = 'Loading...';
    if (welcomeEl) welcomeEl.textContent = 'Loading...';
    if (greetingEl) greetingEl.textContent = 'Loading...';
    if (itemsEl) itemsEl.textContent = 'Loading...';

    // Fetch translations
    const appName = await translaas.t('common', 'app.name', lang);
    const welcome = await translaas.t('common', 'welcome', lang);
    const greeting = await translaas.t('messages', 'greeting', lang, undefined, {
      userName: 'Browser User',
      itemCount: '1',
    });
    const items = await translaas.t('messages', 'item', lang, 5);

    // Update UI
    if (appNameEl) appNameEl.textContent = appName;
    if (welcomeEl) welcomeEl.textContent = welcome;
    if (greetingEl) greetingEl.textContent = greeting;
    if (itemsEl) itemsEl.textContent = items;

    // Update cache status
    const isCached = await browserCache.isCachedAsync(projectId, lang);
    const cacheStatusEl = document.getElementById('cache-status');
    if (cacheStatusEl) cacheStatusEl.textContent = isCached ? 'Active' : 'Not cached';
  } catch (error) {
    console.error('Translation error:', error);
    
    // Provide more helpful error messages
    let errorMsg = `Error: ${error.message}`;
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('ERR_NAME_NOT_RESOLVED') ||
      error.message.includes('CORS')
    ) {
      if (isDevelopment) {
        errorMsg =
          '⚠️ CORS/Network error: If using a local API, make sure:\n' +
          '1. VITE_TRANSLAAS_BASE_URL is set in .env\n' +
          '2. The Vite proxy is configured correctly\n' +
          '3. Your API server allows requests from the proxy\n\n' +
          `API URL: ${TRANSLAAS_BASE_URL_ENV || 'not configured'}`;
      } else {
        errorMsg =
          '⚠️ Network error: Could not connect to API. Please check:\n' +
          '1. Your API credentials are correct\n' +
          '2. The API base URL is accessible\n' +
          '3. You have an internet connection\n' +
          '4. CORS is properly configured on the API server\n\n' +
          `Attempted URL: ${TRANSLAAS_BASE_URL_ENV}`;
      }
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      errorMsg = '⚠️ Authentication error: Invalid API key. Please check your VITE_TRANSLAAS_API_KEY.';
    } else if (error.message.includes('404')) {
      errorMsg = '⚠️ Not found: The requested translation was not found. Check your project and translation keys.';
    }
    
    if (appNameEl) appNameEl.textContent = errorMsg;
    if (welcomeEl) welcomeEl.textContent = errorMsg;
    if (greetingEl) greetingEl.textContent = errorMsg;
    if (itemsEl) itemsEl.textContent = errorMsg;
  }
}

// Event listeners
document.getElementById('update-btn').addEventListener('click', () => {
  const lang = document.getElementById('lang-select').value;
  loadTranslations(lang);
});

document.getElementById('clear-cache-btn').addEventListener('click', async () => {
  try {
    await browserCache.clearAllAsync();
    document.getElementById('cache-status').textContent = 'Cleared';
    alert('Cache cleared! Translations will be fetched fresh on next load.');
  } catch (error) {
    console.error('Cache clear error:', error);
    alert(`Error clearing cache: ${error.message}`);
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await updateDetectedLanguage();
  const detectedLang = await languageResolver.resolveLanguageAsync();
  const lang = detectedLang || 'en';
  document.getElementById('lang-select').value = lang;
  await loadTranslations(lang);
});
