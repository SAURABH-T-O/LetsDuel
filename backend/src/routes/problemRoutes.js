import { Router } from 'express';
import { importProblems, listProblems, syncProblems } from '../controllers/problemController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { importProblemsSchema, listProblemsSchema } from '../validators/problemSchemas.js';

export const problemRouter = Router();

problemRouter.get('/', validate(listProblemsSchema), listProblems);
problemRouter.post('/import', authenticate, authorize('admin'), validate(importProblemsSchema), importProblems);
problemRouter.post('/sync', authenticate, authorize('admin'), syncProblems);
