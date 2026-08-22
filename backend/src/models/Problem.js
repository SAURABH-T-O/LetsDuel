import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['codeforces'],
      default: 'codeforces',
      index: true,
    },
    contestId: {
      type: Number,
      required: true,
    },
    index: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'PROGRAMMING',
    },
    rating: {
      type: Number,
      min: 0,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    solvedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    url: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

problemSchema.index({ source: 1, contestId: 1, index: 1 }, { unique: true });
problemSchema.index({ rating: 1, solvedCount: 1 });

export const Problem = mongoose.model('Problem', problemSchema);
