import { syncCodeforcesSubmissionsForProblem } from '../services/submissionService.js';
import { Submission } from '../models/Submission.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { emitToDuelRoom } from '../socket/index.js';

export const syncCodeforcesProblemSubmissions = asyncHandler(async (req, res) => {
  const syncResult = await syncCodeforcesSubmissionsForProblem({
    roomCode: req.validated.params.roomCode,
    user: req.user,
    problemId: req.validated.params.problemId,
    count: req.validated.body.count,
  });

  emitToDuelRoom(req.validated.params.roomCode, 'submission:synced', {
    problem: syncResult.problem,
    submissions: syncResult.submissions,
    result: syncResult.result,
    room: {
      id: syncResult.room._id,
      roomCode: syncResult.room.roomCode,
      status: syncResult.room.status,
      participants: syncResult.room.participants,
      winner: syncResult.room.winner,
      completedAt: syncResult.room.completedAt,
    },
  });

  res.status(200).json({
    success: true,
    data: syncResult,
  });
});

export const listMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ user: req.user._id })
    .sort({ submittedAt: -1 })
    .limit(100)
    .populate('problem', 'name contestId index rating url');

  res.status(200).json({
    success: true,
    data: { submissions },
  });
});