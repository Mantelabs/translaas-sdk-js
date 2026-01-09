# Express.js Example

This example demonstrates how to integrate the Translaas SDK with Express.js applications.

## Features Demonstrated

- Express middleware integration
- Language resolution from HTTP requests
- Route handlers with translations
- Error handling middleware

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```env
TRANSLAAS_API_KEY=your-api-key-here
TRANSLAAS_BASE_URL=https://api.translaas.com
PORT=3000
```

3. Start the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

4. Visit `http://localhost:3000` to see the example in action.

## API Endpoints

- `GET /` - Home page with translations
- `GET /api/translate/:group/:entry` - Get translation (language from query/cookie/header)
- `GET /api/translate/:group/:entry/:lang` - Get translation with explicit language
- `GET /api/locales` - Get available locales

## Language Resolution

The example demonstrates automatic language resolution from:

1. Route parameters (`/api/translate/:lang`)
2. Query string (`?lang=en`)
3. Cookies (`lang=en`)
4. Accept-Language header

## Code Structure

```
examples/express/
├── server.js           # Express server with middleware
├── middleware.js       # Translaas middleware
├── routes.js           # API routes
├── package.json
└── README.md
```

## Learn More

- [SDK Documentation](../../README.md)
- [Express.js Documentation](https://expressjs.com/)
- [Language Resolution](../../packages/@translaas/extensions/README.md)
