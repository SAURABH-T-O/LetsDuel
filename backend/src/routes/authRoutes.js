import { Router } from 'express';
import {
  forgotPasswordTokenSchema,
  loginSchema,
  refreshSchema,
  requestVerificationSchema,
  resetPasswordSchema,
  signupSchema,
  verifyCodeforcesSchema,
  verifyResetIdentitySchema,
} from '../validators/authSchemas.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  generateResetToken,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  requestCodeforcesVerification,
  resetPassword,
  signup,
  verifyCodeforcesHandle,
  verifyResetIdentity,
} from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/codeforces/request-verification', validate(requestVerificationSchema), requestCodeforcesVerification);
authRouter.post('/codeforces/verify', validate(verifyCodeforcesSchema), verifyCodeforcesHandle);
authRouter.post('/signup', validate(signupSchema), signup);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/refresh', validate(refreshSchema), refresh);
authRouter.post('/logout', logout);
authRouter.post('/logout-all', authenticate, logoutAll);
authRouter.get('/me', authenticate, me);

authRouter.post('/forgot-password/token', validate(forgotPasswordTokenSchema), generateResetToken);
authRouter.post('/forgot-password/verify', validate(verifyResetIdentitySchema), verifyResetIdentity);
authRouter.post('/forgot-password/reset', validate(resetPasswordSchema), resetPassword);