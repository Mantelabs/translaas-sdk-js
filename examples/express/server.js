/**
 * Express.js Example Server
 *
 * Demonstrates Translaas SDK integration with Express.js
 */

import 'dotenv/config';
import express from 'express';
import { createTranslaasMiddleware } from './middleware.js';
import { createRoutes } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Translaas middleware (adds translaas service to request)
app.use(createTranslaasMiddleware());

// Routes
app.use('/', createRoutes());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📝 Translaas SDK integrated`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /`);
  console.log(`  GET  /api/translate/:group/:entry`);
  console.log(`  GET  /api/translate/:group/:entry/:lang`);
  console.log(`  GET  /api/locales`);
});
