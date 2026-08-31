const logger = require('../services/loggerService');

// Centralized error handler middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log critical error details using Winston logger
  logger.error(`Error ${statusCode} - ${err.message} - Path: ${req.originalUrl} - Method: ${req.method} - IP: ${req.ip}`, {
    stack: err.stack
  });

  // Sanitize the response payload sent back in production
  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred on the server.'
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { errorHandler };
