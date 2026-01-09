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
// For this example, we use placeholder values - replace with your actual API credentials
const TRANSLAAS_API_KEY = import.meta.env?.VITE_TRANSLAAS_API_KEY || 'your-api-key-here';
const TRANSLAAS_BASE_URL = import.meta.env?.VITE_TRANSLAAS_BASE_URL || 'https://api.translaas.com';

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
    const items = await translaas.t('messages', 'items', lang, 5, {
      itemCount: '5',
    });

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
    const errorMsg = `Error: ${error.message}`;
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
