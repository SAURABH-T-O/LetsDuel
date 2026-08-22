import { z } from 'zod';
import { GAME_MODES } from '../constants/gameModes.js';

const roomCode = z
  .string()
  .trim()
  .length(5)
  .regex(/^[A-Z0-9]+$/i)
  .transform((value) => value.toUpperCase());

const settingsSchema = z
  .object({
    questionCount: z.number().int().min(1).max(50),
    difficultyMin: z.number().int().min(800).max(3500),
    difficultyMax: z.number().int().min(800).max(3500),
    durationMinutes: z.number().int().min(1).max(600),
    onlyUnsolved: z.boolean().optional(),
  })
  .refine((data) => data.difficultyMin <= data.difficultyMax, {
    path: ['difficultyMax'],
    message: 'difficultyMax must be greater than or equal to difficultyMin',
  })
  .refine(
    (data) =>
      data.difficultyMin % 100 === 0 &&
      data.difficultyMax % 100 === 0,
    {
      path: ['difficultyMin'],
      message: 'Difficulty must be in increments of 100',
    },
  );

export const createRoomSchema = z.object({
  body: z.object({
    mode: z.literal(GAME_MODES.TEAM_DUEL),
    settings: settingsSchema,
  }),
});

export const roomCodeParamSchema = z.object({
  params: z.object({
    roomCode,
  }),
});

export const moveTeamSlotSchema = z.object({
  params: z.object({
    roomCode,
  }),
  body: z.object({
    team: z.enum(['A', 'B']),
    slot: z.number().int().min(0).max(7),
  }),
});