import mongoose from 'mongoose';
import { env, isProduction } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const notFoundHandler = (req, _res, next) => { //(naming convention)
// not using res, so named it _res.
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (error, _req, res, _next) => {
  let normalizedError = error;

  if (error instanceof mongoose.Error.CastError) {
    normalizedError = new AppError('Invalid resource identifier', 400);
  }

  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern || {});
    normalizedError = new AppError(`${fields.join(', ') || 'Field'} already exists`, 409);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    normalizedError = new AppError(
      'Validation failed',
      400,
      Object.values(error.errors).map((item) => ({
        path: item.path,
        message: item.message,
      })),
    );
  }

  const statusCode = normalizedError.statusCode || 500;

  if (!isProduction || statusCode >= 500) {
    console.error(normalizedError);
  }

  res.status(statusCode).json({
    success: false,
    message: normalizedError.isOperational? normalizedError.message: 'Internal server error',
    details: normalizedError.details || undefined,
    stack: env.nodeEnv === 'development' ? normalizedError.stack : undefined,
  });
};