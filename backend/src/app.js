import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isDevelopment } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { authRouter } from './routes/authRoutes.js';
import { duelRoomRouter } from './routes/duelRoomRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';
import { problemRouter } from './routes/problemRoutes.js';
import { submissionRouter } from './routes/submissionRoutes.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(compression());

  if (isDevelopment) {
    app.use(morgan('dev'));
  }

  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/problems', problemRouter);
  app.use('/api/duel-rooms', duelRoomRouter);
  app.use('/api/submissions', submissionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
