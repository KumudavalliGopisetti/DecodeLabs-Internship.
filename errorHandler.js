/**
 * Central Express error handler.
 * Must have exactly 4 parameters (err, req, res, next).
 * Register this LAST with app.use() in server.js.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
  let errors     = null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = 'Validation failed';
    errors     = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key (unique index)
  if (err.code === 11000) {
    statusCode    = 409;
    const field   = Object.keys(err.keyValue)[0];
    const value   = err.keyValue[field];
    message       = `"${value}" is already registered for field "${field}".`;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message    = `Invalid ID format: "${err.value}"`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired.'; }

  const response = { success: false, message };
  if (errors)                                 response.errors = errors;
  if (process.env.NODE_ENV === 'development') response.stack  = err.stack;

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
