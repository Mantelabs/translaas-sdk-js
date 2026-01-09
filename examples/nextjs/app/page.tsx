/**
 * Next.js Home Page (Server-Side Rendered)
 *
 * Demonstrates server-side translation fetching
 */

import { createServerService } from '../lib/translaas';

export default async function HomePage() {
  // Create service for server-side use
  const translaas = createServerService();

  // Fetch translations on the server
  const welcome = await translaas.t('common', 'welcome', 'en');
  const appName = await translaas.t('common', 'app.name', 'en');
  const greeting = await translaas.t('messages', 'greeting', 'en', undefined, {
    userName: 'Next.js User',
    itemCount: '1',
  });

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>🌐 Translaas Next.js Example</h1>
      <p>This page is server-side rendered with translations.</p>

      <div
        style={{ background: '#f5f5f5', padding: '15px', margin: '20px 0', borderRadius: '5px' }}
      >
        <h2>App Name</h2>
        <p>
          <strong>Translation:</strong> {appName}
        </p>
        <code>await translaas.t('common', 'app.name', 'en')</code>
      </div>

      <div
        style={{ background: '#f5f5f5', padding: '15px', margin: '20px 0', borderRadius: '5px' }}
      >
        <h2>Welcome Message</h2>
        <p>
          <strong>Translation:</strong> {welcome}
        </p>
        <code>await translaas.t('common', 'welcome', 'en')</code>
      </div>

      <div
        style={{ background: '#f5f5f5', padding: '15px', margin: '20px 0', borderRadius: '5px' }}
      >
        <h2>Greeting with Parameters</h2>
        <p>
          <strong>Translation:</strong> {greeting}
        </p>
        <code>
          await translaas.t('messages', 'greeting', 'en', undefined, {'{'} userName: 'Next.js User',
          itemCount: '1' {'}'})
        </code>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Try These:</h2>
        <ul>
          <li>
            <a href="/client-page">Client-Side Rendered Page</a>
          </li>
          <li>
            <a href="/api/translate/common/welcome">API Route Example</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
