const fs = require('fs');
const path = require('path');
const rootEnvPath = path.resolve(__dirname, '../../.env');
const backendEnvPath = path.resolve(__dirname, '../.env');
require('dotenv').config({
  path: process.env.ENV_FILE || (fs.existsSync(rootEnvPath) ? rootEnvPath : backendEnvPath),
});
const app = require('./app');
const { initializeAI } = require('./services/aiService');

const PORT = process.env.PORT || 5000;

const startServer = () => {
  console.log('\n🚀 FocusDesk — Backend Starting...');
  console.log('=' .repeat(50));

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || /replace|your_|change_this/i.test(jwtSecret)) {
    console.error('❌ Configure JWT_SECRET with at least 32 random characters before starting the API.');
    process.exitCode = 1;
    return;
  }

  // Initialize AI service
  initializeAI();

  // Start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log('=' .repeat(50));
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('⏱  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
