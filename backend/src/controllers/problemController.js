import { Problem } from '../models/Problem.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { importCodeforcesProblems } from '../services/problemService.js';

export const importProblems = asyncHandler(async (req, res) => {
  const result = await importCodeforcesProblems(req.validated.body.problems);

  res.status(201).json({
    success: true,
    data: result,
  });
});

export const listProblems = asyncHandler(async (req, res) => {
  const { ratingMin, ratingMax, tag, limit = 50 } = req.validated.query;

  const query = { isActive: true };
  if (ratingMin || ratingMax) {
    query.rating = {};
    if (ratingMin) query.rating.$gte = ratingMin;
    if (ratingMax) query.rating.$lte = ratingMax;
  }
  if (tag) query.tags = tag;

  const problems = await Problem.find(query)
    .sort({ rating: 1, solvedCount: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: { problems },
  });
});
