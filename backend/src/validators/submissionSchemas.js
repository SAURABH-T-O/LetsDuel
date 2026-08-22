import { z } from 'zod';

const roomCode = z
  .string()
  .trim()
  .length(5)
  .regex(/^[A-Z0-9]+$/i)
  .transform((value) => value.toUpperCase());

export const syncCodeforcesSubmissionsSchema = z.object({
  params: z.object({
    roomCode,
    problemId: z.string().trim().min(1),
  }),
  body: z
    .object({
      count: z.number().int().min(1).max(200).optional(),
    })
    .default({}),
});
