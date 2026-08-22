import { Router } from 'express';
import {
  listMySubmissions,
  syncCodeforcesProblemSubmissions,
} from '../controllers/submissionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { syncCodeforcesSubmissionsSchema } from '../validators/submissionSchemas.js';

export const submissionRouter = Router();

submissionRouter.use(authenticate);

submissionRouter.get('/mine', listMySubmissions);
submissionRouter.post(
  '/rooms/:roomCode/problems/:problemId/sync',
  validate(syncCodeforcesSubmissionsSchema),
  syncCodeforcesProblemSubmissions,
);
