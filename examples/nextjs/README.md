# Next.js Example

This example demonstrates how to integrate the Translaas SDK with Next.js applications.

## Features Demonstrated

- Server-side rendering (SSR) with translations
- Client-side rendering (CSR) with translations
- React components using translations
- API routes with translations
- Language resolution from requests

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and update with your credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual credentials:

```env
# Server-side variables (used in API routes and server components)
TRANSLAAS_API_KEY=your-api-key-here
TRANSLAAS_BASE_URL=https://api.translaas.com
```

**Security Note:** This example uses a Next.js API proxy route (`/api/proxy/[...path]`) that handles authentication server-side. The API key is **never exposed to the browser** - all client-side requests go through the proxy, which adds the API key server-side. This is the recommended approach for security.

**Important:** Do NOT set `NEXT_PUBLIC_TRANSLAAS_API_KEY` in your `.env.local` file. Any variable prefixed with `NEXT_PUBLIC_` is embedded into the browser bundle and visible to all users, which would expose your API key. The proxy route handles authentication securely on the server.

3. Run the development server:

```bash
npm run dev
```

4. Visit `http://localhost:3000` to see the example.

## SSL Certificate Handling

If you're using a local API server with self-signed certificates (e.g., `https://sdk-api.translaas.local`), Next.js will automatically disable SSL certificate verification for local development. This is only enabled when the `TRANSLAAS_BASE_URL` contains `.local`, `localhost`, or `127.0.0.1`.

**⚠️ Warning:** This should only be used for local development. Never disable SSL verification in production.

## Project Structure

```
examples/nextjs/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page (SSR)
│   ├── client-page.tsx    # Client component example
│   └── api/               # API routes
│       └── translate/     # Translation API endpoint
├── components/            # React components
│   └── TranslatedText.tsx # Translation component
├── lib/                   # Utilities
│   └── translaas.ts      # Translaas service setup
├── package.json
└── README.md
```

## Features

### Server-Side Rendering

Translations are fetched on the server and included in the initial HTML.

### Client-Side Rendering

Translations are fetched on the client for dynamic content.

### API Routes

Next.js API routes use Translaas SDK for server-side translation lookups.

## Learn More

- [SDK Documentation](../../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
