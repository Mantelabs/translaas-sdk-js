/**
 * Next.js Client-Side Page
 *
 * Demonstrates client-side translation fetching
 */

'use client';

import { useEffect, useState } from 'react';
import { createClientService } from '../lib/translaas';

export default function ClientPage() {
  const [welcome, setWelcome] = useState<string>('Loading...');
  const [greeting, setGreeting] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTranslations() {
      const translaas = createClientService();
      try {
        const appNameText = await translaas.t('common', 'app.name', 'en');
        const welcomeText = await translaas.t('common', 'welcome', 'en');
        const greetingText = await translaas.t('messages', 'greeting', 'en', undefined, {
          userName: 'Client User',
          itemCount: '1',
        });
        setWelcome(`${appNameText} - ${welcomeText}`);
        setGreeting(greetingText);
      } catch (error) {
        console.error('Translation error:', error);
        setWelcome('Error loading translation');
        setGreeting('Error loading translation');
      } finally {
        setLoading(false);
      }
    }

    fetchTranslations();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
        <p>Loading translations...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>🌐 Translaas Next.js Client-Side Example</h1>
      <p>This page fetches translations on the client side.</p>

      <div
        style={{ background: '#f5f5f5', padding: '15px', margin: '20px 0', borderRadius: '5px' }}
      >
        <h2>App Name and Welcome</h2>
        <p>
          <strong>Translation:</strong> {welcome}
        </p>
        <code>
          await translaas.t('common', 'app.name', 'en') + ' - ' + await translaas.t('common',
          'welcome', 'en')
        </code>
      </div>

      <div
        style={{ background: '#f5f5f5', padding: '15px', margin: '20px 0', borderRadius: '5px' }}
      >
        <h2>Greeting with Parameters</h2>
        <p>
          <strong>Translation:</strong> {greeting}
        </p>
        <code>
          await translaas.t('messages', 'greeting', 'en', undefined, {'{'} userName: 'Client User',
          itemCount: '1' {'}'})
        </code>
      </div>

      <div style={{ marginTop: '30px' }}>
        <a href="/">← Back to Home</a>
      </div>
    </div>
  );
}
