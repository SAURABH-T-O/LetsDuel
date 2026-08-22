import mongoose from 'mongoose';
import { SUBMISSION_STATUSES } from '../constants/gameModes.js';

const submissionSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DuelRoom',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    codeforcesSubmissionId: {
      type: Number,
      required: true,
      index: true,
    },
    codeforcesHandle: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    programmingLanguage: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUSES),
      default: SUBMISSION_STATUSES.RUNNING,
      index: true,
    },
    verdict: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: Date,
      required: true,
      index: true,
    },
    relativeTimeSeconds: {
      type: Number,
      default: null,
    },
    passedTestCount: {
      type: Number,
      default: null,
    },
    timeConsumedMillis: {
      type: Number,
      default: null,
    },
    memoryConsumedBytes: {
      type: Number,
      default: null,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    penaltyApplied: {
      type: Number,
      default: 0,
    },
    checkedAt: {
      type: Date,
      default: null,
    },
    raw: {
      type: mongoose.Schema.Types.Mixed,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

submissionSchema.index(
  { room: 1, user: 1, problem: 1, codeforcesSubmissionId: 1 },
  { unique: true },
);
submissionSchema.index({ room: 1, user: 1, problem: 1, submittedAt: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
