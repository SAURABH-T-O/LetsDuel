import { z } from 'zod';

const username = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(24, 'Username must be at most 24 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

const codeforcesHandle = z
  .string()
  .trim()
  .min(1, 'Codeforces handle is required')
  .max(80, 'Codeforces handle is too long');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const requestVerificationSchema = z.object({
  body: z.object({
    codeforcesHandle,
  }),
});

export const verifyCodeforcesSchema = z.object({
  body: z.object({
    codeforcesHandle,
    token: z.string().trim().min(8, 'Verification token is required'),
  }),
});

export const signupSchema = z.object({
  body: z
    .object({
      codeforcesHandle,
      username,
      password,
      confirmPassword: z.string(),
      verificationToken: z.string().trim().min(8, 'Verification token is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(1, 'Username or Codeforces handle is required'),
    password: z.string().optional().default(''),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export const forgotPasswordTokenSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(1, 'Username or Codeforces handle is required'),
  }),
});

export const verifyResetIdentitySchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(1, 'Username or Codeforces handle is required'),
    token: z.string().trim().min(8, 'Verification token is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      identifier: z.string().trim().min(1, 'Username or Codeforces handle is required'),
      token: z.string().trim().min(8, 'Verification token is required'),
      password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    }),
});