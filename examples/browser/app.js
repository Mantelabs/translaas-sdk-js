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
  try {
    // Update UI
    document.getElementById('welcome-text').textContent = 'Loading...';
    document.getElementById('greeting-text').textContent = 'Loading...';
    document.getElementById('items-text').textContent = 'Loading...';

    // Fetch translations
    const welcome = await translaas.t('common', 'welcome', lang);
    const greeting = await translaas.t('common', 'greeting', lang, undefined, {
      name: 'Browser User',
    });
    const items = await translaas.t('messages', 'items', lang, 5, {
      count: '5',
    });

    // Update UI
    document.getElementById('welcome-text').textContent = welcome;
    document.getElementById('greeting-text').textContent = greeting;
    document.getElementById('items-text').textContent = items;

    // Update cache status
    const isCached = await browserCache.isCachedAsync('default-project', lang);
    document.getElementById('cache-status').textContent = isCached ? 'Active' : 'Not cached';
  } catch (error) {
    console.error('Translation error:', error);
    document.getElementById('welcome-text').textContent = `Error: ${error.message}`;
    document.getElementById('greeting-text').textContent = `Error: ${error.message}`;
    document.getElementById('items-text').textContent = `Error: ${error.message}`;
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
