require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const utilRoutes = require('./routes/utilRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// =========================================================
// CORS
// =========================================================
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// =========================================================
// Request Logging Middleware (Week 4 requirement)
// =========================================================
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Custom request logger to demonstrate middleware pipeline
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`📡 ${req.method} ${req.originalUrl} → ${res.statusCode} [${elapsed}ms]`);
    }
  });
  next();
});

// =========================================================
// Body parsing
// =========================================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// =========================================================
// Routes
// =========================================================
app.use('/api', utilRoutes);          // /api/health, /api/ai/suggest, /api/performance
app.use('/api/auth', authRoutes);     // /api/auth/register, /api/auth/login, /api/auth/me
app.use('/api/tasks', taskRoutes);    // /api/tasks CRUD
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);

// =========================================================
// Error Handling (must be AFTER routes — Week 4 requirement)
// =========================================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
