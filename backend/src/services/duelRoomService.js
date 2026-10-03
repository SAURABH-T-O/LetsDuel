import { GAME_MODES, ROOM_STATUSES } from '../constants/gameModes.js';
import { DuelRoom } from '../models/DuelRoom.js';
import { AppError } from '../utils/AppError.js';
import { createRoomCode } from '../utils/roomCode.js';
import { selectProblemsForRoom } from './problemService.js';

const participantSnapshot = (user) => ({
  user: user._id,
  username: user.username,
  codeforcesHandle: user.codeforcesHandle,
});

const buildSettings = (settings) => ({
  questionCount: settings.questionCount,
  difficultyMin: settings.difficultyMin,
  difficultyMax: settings.difficultyMax,
  durationMinutes: settings.durationMinutes,
  onlyUnsolved: settings.onlyUnsolved ?? true,
});

export const createDuelRoom = async ({ creator, mode, settings }) => {
  if (mode !== GAME_MODES.TEAM_DUEL) {
    throw new AppError('Only N vs N Team Duel is currently available', 400);
  }

  let roomCode = createRoomCode();

  while (await DuelRoom.exists({ roomCode })) {
    roomCode = createRoomCode();
  }

  const room = await DuelRoom.create({
    roomCode,
    creator: creator._id,
    mode: GAME_MODES.TEAM_DUEL,
    settings: buildSettings(settings),
    participants: [
      {
        ...participantSnapshot(creator),
        team: 'A',
        slot: 0,
        ready: true,
      },
    ],
  });

  return room;
};

export const getRoomByCode = async (roomCode) => {
  const room = await DuelRoom.findOne({
    roomCode: roomCode.toUpperCase(),
  })
    .populate('creator', 'username codeforcesHandle')
    .populate('problems.problem');

  if (!room) {
    throw new AppError('Duel room not found', 404);
  }

  return room;
};

export const joinDuelRoom = async ({ roomCode, user }) => {
  const room = await DuelRoom.findOne({
    roomCode: roomCode.toUpperCase(),
  });

  if (!room) {
    throw new AppError('Duel room not found', 404);
  }

  if (room.status !== ROOM_STATUSES.WAITING) {
    throw new AppError('Room is not open for joining', 400);
  }

  if (room.mode !== GAME_MODES.TEAM_DUEL) {
    throw new AppError('Only N vs N Team Duel is currently available', 400);
  }

  const alreadyJoined = room.participants.some(
    (participant) =>
      participant.user.toString() === user._id.toString(),
  );

  if (alreadyJoined) {
    return room;
  }

  const participant = participantSnapshot(user);

  const teamACount = room.participants.filter(
    (item) => item.team === 'A',
  ).length;

  const teamBCount = room.participants.filter(
    (item) => item.team === 'B',
  ).length;

  // Maximum 8 players per team
  if (teamACount >= 8 && teamBCount >= 8) {
    throw new AppError('Both teams are full', 400);
  }

  participant.team =
    teamACount <= teamBCount ? 'A' : 'B';

  participant.slot = room.participants.filter(
    (item) => item.team === participant.team,
  ).length;

  room.participants.push(participant);

  await room.save();

  return room;
};

export const moveTeamSlot = async ({
  roomCode,
  user,
  team,
  slot,
}) => {
  const room = await DuelRoom.findOne({
    roomCode: roomCode.toUpperCase(),
  });

  if (!room) {
    throw new AppError('Duel room not found', 404);
  }

  if (room.mode !== GAME_MODES.TEAM_DUEL) {
    throw new AppError(
      'Team movement is only available in Team Duel',
      400,
    );
  }

  if (room.status !== ROOM_STATUSES.WAITING) {
    throw new AppError(
      'Cannot move teams after the contest starts',
      400,
    );
  }

  if (!['A', 'B'].includes(team) || slot < 0 || slot > 7) {
    throw new AppError('Invalid team slot', 400);
  }

  const participant = room.participants.find(
    (item) =>
      item.user.toString() === user._id.toString(),
  );

  if (!participant) {
    throw new AppError('You are not in this room', 403);
  }

  const occupied = room.participants.some(
    (item) =>
      item.team === team &&
      item.slot === slot &&
      item.user.toString() !== user._id.toString(),
  );

  if (occupied) {
    throw new AppError(
      'Team slot is already occupied',
      409,
    );
  }

  participant.team = team;
  participant.slot = slot;

  await room.save();

  return room;
};

export const startDuelRoom = async ({ roomCode, user }) => {
  const room = await DuelRoom.findOne({
    roomCode: roomCode.toUpperCase(),
  });

  if (!room) {
    throw new AppError('Duel room not found', 404);
  }

  const isCreator = room.creator.toString() === user._id.toString();
  const isParticipant = room.participants.some(
    (participant) => participant.user.toString() === user._id.toString(),
  );

  if (!isCreator && !isParticipant) {
    throw new AppError(
      'Only the creator or a participant can start this room',
      403,
    );
  }

  if (room.status !== ROOM_STATUSES.WAITING) {
    throw new AppError(
      'Room has already started or ended',
      400,
    );
  }

  if (room.mode !== GAME_MODES.TEAM_DUEL) {
    throw new AppError(
      'Only N vs N Team Duel is currently available',
      400,
    );
  }

  const teamACount = room.participants.filter(
    (participant) => participant.team === 'A',
  ).length;

  const teamBCount = room.participants.filter(
    (participant) => participant.team === 'B',
  ).length;

  const totalPlayers = room.participants.length;

  if (totalPlayers === 0 || (teamACount === 0 && teamBCount === 0)) {
    throw new AppError(
      'At least one player in either team is required to start the duel',
      400,
    );
  }

  room.problems = await selectProblemsForRoom(
    room.settings,
  );

  room.status = ROOM_STATUSES.ACTIVE;
  room.startedAt = new Date();

  room.endsAt = new Date(
    Date.now() +
      room.settings.durationMinutes * 60 * 1000,
  );

  await room.save();

  await room.populate([
    { path: 'creator', select: 'username codeforcesHandle' },
    { path: 'problems.problem' },
  ]);

  return room;
};

export const cancelDuelRoom = async ({
  roomCode,
  user,
}) => {
  const room = await DuelRoom.findOne({
    roomCode: roomCode.toUpperCase(),
  });

  if (!room) {
    throw new AppError('Duel room not found', 404);
  }

  if (room.creator.toString() !== user._id.toString()) {
    throw new AppError(
      'Only the creator can cancel this room',
      403,
    );
  }

  if (room.status !== ROOM_STATUSES.WAITING) {
    throw new AppError(
      'Only waiting rooms can be cancelled',
      400,
    );
  }

  room.status = ROOM_STATUSES.CANCELLED;
  room.cancelledAt = new Date();

  await room.save();

  return room;
};