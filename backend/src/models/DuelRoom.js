import mongoose from 'mongoose';
import { GAME_MODES, ROOM_STATUSES } from '../constants/gameModes.js';

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    codeforcesHandle: {
      type: String,
      required: true,
    },
    team: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
    slot: {
      type: Number,
      default: null,
    },
    ready: {
      type: Boolean,
      default: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      default: 0,
    },
    solvedCount: {
      type: Number,
      default: 0,
    },
    wrongSubmissions: {
      type: Number,
      default: 0,
    },
    lastAcceptedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const roomProblemSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    solvedByTeam: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const roomSettingsSchema = new mongoose.Schema(
  {
    questionCount: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    difficultyMin: {
      type: Number,
      required: true,
      min: 800,
    },
    difficultyMax: {
      type: Number,
      required: true,
      min: 800,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 600,
    },
    onlyUnsolved: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const duelRoomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 5,
      maxlength: 5,
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: Object.values(GAME_MODES),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUSES),
      default: ROOM_STATUSES.WAITING,
      index: true,
    },
    settings: {
      type: roomSettingsSchema,
      required: true,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    problems: {
      type: [roomProblemSchema],
      default: [],
    },
    teamAScore: {
      type: Number,
      default: 0,
    },
    teamBScore: {
      type: Number,
      default: 0,
    },
    winnerTeam: {
      type: String,
      enum: ['A', 'B', 'DRAW', null],
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

duelRoomSchema.index({
  status: 1,
  mode: 1,
  createdAt: -1,
});

export const DuelRoom = mongoose.model('DuelRoom', duelRoomSchema);