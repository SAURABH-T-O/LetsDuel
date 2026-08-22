import { Problem } from '../models/Problem.js';
import { AppError } from '../utils/AppError.js';

export const selectProblemsForRoom = async ({
  questionCount,
  difficultyMin,
  difficultyMax,
}) => {
  const problems = await Problem.aggregate([
    {
      $match: {
        isActive: true,
        rating: {
          $gte: difficultyMin,
          $lte: difficultyMax,
        },
      },
    },
    {
      $sample: {
        size: questionCount,
      },
    },
    {
      $sort: {
        rating: 1,
      },
    },
  ]);

  if (problems.length < questionCount) {
    throw new AppError(
      'Not enough problems available for the selected settings',
      400,
    );
  }

  return problems.map((problem, index) => ({
    problem: problem._id,
    order: index + 1,
    points: (index + 1) * 50,
    rating: problem.rating,
  }));
};

export const importCodeforcesProblems = async (problems) => {
  const operations = problems
    .filter(
      (problem) =>
        problem.contestId &&
        problem.index &&
        problem.name &&
        problem.rating,
    )
    .map((problem) => ({
      updateOne: {
        filter: {
          source: 'codeforces',
          contestId: problem.contestId,
          index: problem.index,
        },
        update: {
          $set: {
            source: 'codeforces',
            contestId: problem.contestId,
            index: problem.index,
            name: problem.name,
            type: problem.type || 'PROGRAMMING',
            rating: problem.rating,
            tags: problem.tags || [],
            url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
            isActive: true,
            importedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

  if (operations.length === 0) {
    return { imported: 0 };
  }

  const result = await Problem.bulkWrite(operations);

  return {
    imported: result.upsertedCount + result.modifiedCount,
  };
};