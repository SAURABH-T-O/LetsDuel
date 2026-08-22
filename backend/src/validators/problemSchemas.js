import { z } from 'zod';

const ratingSchema = z
  .number()
  .int()
  .min(800)
  .max(3500)
  .refine((value) => value % 100 === 0, {
    message: 'Rating must be in increments of 100',
  });

export const importProblemsSchema = z.object({
  body: z.object({
    problems: z
      .array(
        z.object({
          contestId: z.number().int().positive(),
          index: z.string().trim().min(1),
          name: z.string().trim().min(1),
          type: z.string().optional(),
          rating: ratingSchema,
          tags: z.array(z.string()).optional(),
        }),
      )
      .min(1),
  }),
});

export const listProblemsSchema = z.object({
  query: z.object({
    ratingMin: z.coerce.number().int().optional(),
    ratingMax: z.coerce.number().int().optional(),
    tag: z.string().trim().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});