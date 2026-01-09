/**
 * Express Routes
 *
 * Demonstrates using Translaas SDK in route handlers
 */

import express from 'express';

export function createRoutes() {
  const router = express.Router();

  // Home page
  router.get('/', async (req, res) => {
    try {
      const projectId = process.env.TRANSLAAS_PROJECT || 'translaas-sdk-samples';
      const welcome = await req.translaas.t('common', 'welcome');
      const greeting = await req.translaas.t('messages', 'greeting', undefined, undefined, {
        userName: 'Visitor',
        itemCount: '1',
      });

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Translaas Express Example</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              h1 { color: #333; }
              .example { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
              code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>🌐 Translaas Express.js Example</h1>
            <div class="example">
              <h2>Welcome Message</h2>
              <p><strong>Translation:</strong> ${welcome}</p>
              <p><strong>Code:</strong> <code>await req.translaas.t('common', 'welcome')</code></p>
            </div>
            <div class="example">
              <h2>Greeting with Parameters</h2>
              <p><strong>Translation:</strong> ${greeting}</p>
              <p><strong>Code:</strong> <code>await req.translaas.t('common', 'greeting', undefined, undefined, { name: 'Visitor' })</code></p>
            </div>
            <h2>Try These Endpoints:</h2>
            <ul>
              <li><a href="/api/translate/common/welcome">GET /api/translate/common/welcome</a></li>
              <li><a href="/api/translate/common/welcome?lang=fr">GET /api/translate/common/welcome?lang=fr</a></li>
              <li><a href="/api/translate/common/welcome/es">GET /api/translate/common/welcome/es</a></li>
              <li><a href="/api/locales">GET /api/locales</a></li>
            </ul>
            <h2>Language Resolution:</h2>
            <p>Language is automatically resolved from (in order):</p>
            <ol>
              <li>Route parameter (<code>:lang</code>)</li>
              <li>Query string (<code>?lang=en</code>)</li>
              <li>Cookie (<code>lang=en</code>)</li>
              <li>Accept-Language header</li>
              <li>Default language (en)</li>
            </ol>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get translation (language from request)
  router.get('/api/translate/:group/:entry', async (req, res) => {
    try {
      const { group, entry } = req.params;
      const translation = await req.translaas.t(group, entry);
      res.json({
        group,
        entry,
        translation,
        language: 'auto-resolved',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get translation with explicit language
  router.get('/api/translate/:group/:entry/:lang', async (req, res) => {
    try {
      const { group, entry, lang } = req.params;
      const translation = await req.translaas.t(group, entry, lang);
      res.json({
        group,
        entry,
        language: lang,
        translation,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get available locales
  router.get('/api/locales', async (req, res) => {
    try {
      const { TranslaasClient } = await import('@translaas/core');
      const projectId = process.env.TRANSLAAS_PROJECT || 'translaas-sdk-samples';
      const client = new TranslaasClient({
        apiKey: process.env.TRANSLAAS_API_KEY,
        baseUrl: process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com',
      });
      const locales = await client.getProjectLocalesAsync(projectId);
      res.json({
        project: projectId,
        locales: locales.locales,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
