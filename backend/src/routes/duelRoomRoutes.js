import { Router } from 'express';
import {
  cancelRoom,
  createRoom,
  getRoom,
  joinRoom,
  moveTeam,
  startRoom,
} from '../controllers/duelRoomController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createRoomSchema,
  moveTeamSlotSchema,
  roomCodeParamSchema,
} from '../validators/duelSchemas.js';

export const duelRoomRouter = Router();

duelRoomRouter.use(authenticate);

duelRoomRouter.post('/', validate(createRoomSchema), createRoom);
duelRoomRouter.get('/:roomCode', validate(roomCodeParamSchema), getRoom);
duelRoomRouter.post('/:roomCode/join', validate(roomCodeParamSchema), joinRoom);
duelRoomRouter.patch(
  '/:roomCode/team-slot',
  validate(moveTeamSlotSchema),
  moveTeam,
);
duelRoomRouter.post('/:roomCode/start', validate(roomCodeParamSchema), startRoom);
duelRoomRouter.post('/:roomCode/cancel', validate(roomCodeParamSchema), cancelRoom);