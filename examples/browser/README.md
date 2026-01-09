# Browser Example

This example demonstrates how to use the Translaas SDK in a browser environment.

## Features Demonstrated

- Vanilla JavaScript integration
- Browser cache provider (localStorage)
- Language detection from browser locale
- Dynamic translation updates

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update with your credentials (optional - you can also configure directly in `app.js`):

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials, or update the values directly in `app.js`:

```javascript
const TRANSLAAS_API_KEY = 'your-api-key-here';
const TRANSLAAS_BASE_URL = 'https://api.translaas.com';
```

3. Start a local server:

```bash
npm start
```

This will open `http://localhost:8080` in your browser.

## Features

### Browser Cache

Uses `BrowserCacheProvider` which stores translations in `localStorage` for offline access.

### Language Detection

Automatically detects language from browser's `navigator.language`.

### Dynamic Updates

Translations can be updated dynamically without page reload.

## Code Structure

```
examples/browser/
├── index.html          # Main HTML page
├── app.js             # JavaScript application
├── styles.css         # Styling
├── package.json
└── README.md
```

## Learn More

- [SDK Documentation](../../README.md)
- [Browser Cache Provider](../../packages/@translaas/caching-file/README.md)
- [Language Providers](../../packages/@translaas/extensions/README.md)
