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

2. **Configure API credentials** (required):

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` with your actual Translaas API credentials. **Note:** Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client:

```env
VITE_TRANSLAAS_API_KEY=your-actual-api-key-here
VITE_TRANSLAAS_BASE_URL=https://your-translaas-api-url.com
VITE_TRANSLAAS_PROJECT=translaas-sdk-samples
VITE_TRANSLAAS_DEFAULT_LANGUAGE=en
```

**Important:** Without valid API credentials, the example will show error messages. Make sure to:

- Replace `your-actual-api-key-here` with your real Translaas API key
- Replace `https://your-translaas-api-url.com` with your actual Translaas API base URL
- Ensure the project `translaas-sdk-samples` exists in your Translaas account with the required translation keys

Alternatively, you can update the values directly in `app.js` (lines 18-19), but using `.env` is recommended for security.

3. Start the development server:

```bash
npm run dev
```

This will start Vite dev server and open `http://localhost:8080` in your browser.

For production builds:

```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

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
├── vite.config.js     # Vite configuration
├── package.json
└── README.md
```

## Troubleshooting

### "API credentials not configured" Error

If you see this error, make sure you've:

1. Created a `.env` file from `.env.example`
2. Set `VITE_TRANSLAAS_API_KEY` with your actual API key
3. Set `VITE_TRANSLAAS_BASE_URL` with your actual API URL
4. Restarted the dev server after changing `.env` (Vite requires a restart to pick up env changes)

### CORS Errors

If you see CORS errors like `Access to fetch ... has been blocked by CORS policy`:

**For Local Development APIs:**

- The example uses a Vite proxy to avoid CORS issues
- Make sure `VITE_TRANSLAAS_BASE_URL` is set in your `.env` file
- The proxy automatically forwards `/api/*` requests to your API server
- The proxy also forwards the `X-Api-Key` header automatically

**For Production APIs:**

- Ensure your API server has CORS configured to allow requests from your domain
- Or use the Vite proxy in production builds as well

**Proxy Configuration:**
The `vite.config.js` includes a proxy that:

- Intercepts requests to `/api/*`
- Forwards them to `VITE_TRANSLAAS_BASE_URL`
- Adds the `X-Api-Key` header automatically
- Handles CORS for you

### Network Errors

If you see network errors like `ERR_NAME_NOT_RESOLVED`:

- Check that your `VITE_TRANSLAAS_BASE_URL` is correct and accessible
- Verify your API key is valid
- Ensure you have an internet connection
- Check browser console for detailed error messages
- If using a local API, verify the proxy is working (check Vite dev server logs)

### Translation Not Found Errors

If translations return 404 errors:

- Verify the project `translaas-sdk-samples` exists in your Translaas account
- Check that translation keys (`common.app.name`, `common.welcome`, `messages.greeting`, `messages.item`, `messages.items`) exist
- Ensure the requested language is available in your project

## Development

This example uses [Vite](https://vitejs.dev/) as the build tool to bundle the SDK packages for browser use. Vite provides:

- Fast HMR (Hot Module Replacement) during development
- Optimized production builds
- Native ES module support
- Environment variable handling

**Note:** After modifying `.env` file, restart the dev server (`npm run dev`) for changes to take effect.

## Learn More

- [SDK Documentation](../../README.md)
- [Browser Cache Provider](../../packages/@translaas/caching-file/README.md)
- [Language Providers](../../packages/@translaas/extensions/README.md)
