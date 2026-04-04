import { defineConfig } from 'vite';

// Get API base URL from environment, default to common development URL
const API_BASE_URL = process.env.VITE_TRANSLAAS_BASE_URL || 'https://sdk-api.translaas.local';

function translaasProxy(pathPrefix) {
  return {
    target: API_BASE_URL,
    changeOrigin: true,
    secure: false, // Set to false if using self-signed certificates (e.g., local development)
    rewrite: (path) => path,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.log('Proxy error:', err);
      });
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        const apiKey = process.env.VITE_TRANSLAAS_API_KEY;
        if (apiKey && apiKey !== 'your-api-key-here') {
          proxyReq.setHeader('X-Api-Key', apiKey);
        }
        console.log(
          `[Vite Proxy ${pathPrefix}] ${req.method} ${req.url} -> ${API_BASE_URL}${proxyReq.path}`
        );
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 8080,
    open: true,
    // Proxy API requests to avoid CORS issues in development
    proxy: {
      '/api': translaasProxy('/api'),
      // SDK routes use /sdk/v1/translations/... (see TranslaasClient default prefix)
      '/sdk': translaasProxy('/sdk'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
