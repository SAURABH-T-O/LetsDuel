import { asyncHandler } from '../utils/asyncHandler.js';
import {
  cancelDuelRoom,
  createDuelRoom,
  getRoomByCode,
  joinDuelRoom,
  moveTeamSlot,
  startDuelRoom,
} from '../services/duelRoomService.js';
import { emitToDuelRoom } from '../socket/index.js';

export const createRoom = asyncHandler(async (req, res) => {
  const room = await createDuelRoom({
    creator: req.user,
    mode: req.validated.body.mode,
    settings: req.validated.body.settings,
  });

  res.status(201).json({
    success: true,
    data: { room },
  });
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await getRoomByCode(req.validated.params.roomCode);

  res.status(200).json({
    success: true,
    data: { room },
  });
});

export const joinRoom = asyncHandler(async (req, res) => {
  const room = await joinDuelRoom({
    roomCode: req.validated.params.roomCode,
    user: req.user,
  });

  emitToDuelRoom(room.roomCode, 'duel:room-updated', { room });

  res.status(200).json({
    success: true,
    data: { room },
  });
});

export const moveTeam = asyncHandler(async (req, res) => {
  const room = await moveTeamSlot({
    roomCode: req.validated.params.roomCode,
    user: req.user,
    team: req.validated.body.team,
    slot: req.validated.body.slot,
  });

  emitToDuelRoom(room.roomCode, 'duel:room-updated', { room });

  res.status(200).json({
    success: true,
    data: { room },
  });
});

export const startRoom = asyncHandler(async (req, res) => {
  const room = await startDuelRoom({
    roomCode: req.validated.params.roomCode,
    user: req.user,
  });

  emitToDuelRoom(room.roomCode, 'duel:started', { room });

  res.status(200).json({
    success: true,
    data: { room },
  });
});

export const cancelRoom = asyncHandler(async (req, res) => {
  const room = await cancelDuelRoom({
    roomCode: req.validated.params.roomCode,
    user: req.user,
  });

  emitToDuelRoom(room.roomCode, 'duel:cancelled', { room });

  res.status(200).json({
    success: true,
    data: { room },
  });
});