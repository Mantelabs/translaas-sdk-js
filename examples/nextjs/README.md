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
TRANSLAAS_API_KEY=your-api-key-here
TRANSLAAS_BASE_URL=https://api.translaas.com
NEXT_PUBLIC_TRANSLAAS_PROJECT=your-project-name
```

3. Run the development server:

```bash
npm run dev
```

4. Visit `http://localhost:3000` to see the example.

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
