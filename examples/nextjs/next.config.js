/** @type {import('next').NextConfig} */

// Handle SSL certificate verification for local development
// Only disable SSL verification if using a local API (e.g., *.local domain)
const baseUrl = process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com';
if (baseUrl.includes('.local') || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
  // Disable SSL certificate verification for local development only
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn('⚠️  SSL certificate verification disabled for local development');
}

const nextConfig = {
  // Enable server components
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Ignore Node.js-specific files in @translaas/caching-file for client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        // Force browser-compatible cache provider for client-side
        '@translaas/caching-file/dist/FileCacheProvider': false,
        '@translaas/caching-file/dist/HybridCacheProvider': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
