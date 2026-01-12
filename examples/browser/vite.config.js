import { defineConfig } from 'vite';

// Get API base URL from environment, default to common development URL
const API_BASE_URL = process.env.VITE_TRANSLAAS_BASE_URL || 'https://sdk-api.translaas.local';

export default defineConfig({
  server: {
    port: 8080,
    open: true,
    // Proxy API requests to avoid CORS issues in development
    // This intercepts requests to /api/* and forwards them to the actual API server
    proxy: {
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false, // Set to false if using self-signed certificates (e.g., local development)
        rewrite: (path) => path, // Keep the /api prefix
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward the API key header from environment variable
            const apiKey = process.env.VITE_TRANSLAAS_API_KEY;
            if (apiKey && apiKey !== 'your-api-key-here') {
              proxyReq.setHeader('X-Api-Key', apiKey);
            }
            console.log(`[Vite Proxy] ${req.method} ${req.url} -> ${API_BASE_URL}${proxyReq.path}`);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
