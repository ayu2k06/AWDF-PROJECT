// Global error handling middleware
// Must be registered AFTER all routes and other middleware

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error (never expose stack traces to client)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`❌ [Error] ${req.method} ${req.path} - ${statusCode}: ${message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired' });
  }

  // Default error response — never leak stack trace or sensitive data
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : message,
  });
};

// Not found handler
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFound };
