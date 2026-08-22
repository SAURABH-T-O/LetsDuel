import {
  GAME_MODES,
  ROOM_STATUSES,
  SUBMISSION_STATUSES,
} from '../constants/gameModes.js';
import { DuelRoom } from '../models/DuelRoom.js';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import {
  findAcceptedCodeforcesSubmission,
  getCodeforcesSubmissionDate,
  getCodeforcesUserSubmissions,
  isCodeforcesSubmissionForProblem,
  mapCodeforcesVerdictToStatus,
} from './codeforcesService.js';
import { AppError } from '../utils/AppError.js';

const DEFAULT_SUBMISSION_FETCH_COUNT = 100;
const WRONG_SUBMISSION_PENALTY = 10;

const getParticipant = (room, userId) => {
  return room.participants.find(
    (participant) => participant.user.toString() === userId.toString(),
  );
};

const createPlayerSnapshot = (participant) => ({
  user: participant.user,
  username: participant.username,
  codeforcesHandle: participant.codeforcesHandle,
});

const isSubmissionInsideRoomWindow = ({ submission, room }) => {
  const submittedAt = getCodeforcesSubmissionDate(submission);
  if (!submittedAt) return false;

  const submittedAtMs = submittedAt.getTime();
  const startedAtMs = room.startedAt
    ? new Date(room.startedAt).getTime()
    : 0;
  const endsAtMs = room.endsAt
    ? new Date(room.endsAt).getTime()
    : Number.POSITIVE_INFINITY;

  return submittedAtMs >= startedAtMs && submittedAtMs <= endsAtMs;
};

const toSubmissionDocument = ({
  room,
  user,
  problem,
  codeforcesHandle,
  submission,
}) => {
  const status = mapCodeforcesVerdictToStatus(submission.verdict);
  const submittedAt = getCodeforcesSubmissionDate(submission);

  return {
    room: room._id,
    user: user._id,
    problem: problem._id,
    codeforcesSubmissionId: submission.id,
    codeforcesHandle,
    programmingLanguage: submission.programmingLanguage || null,
    status,
    verdict: submission.verdict || null,
    submittedAt,
    relativeTimeSeconds: submission.relativeTimeSeconds ?? null,
    passedTestCount: submission.passedTestCount ?? null,
    timeConsumedMillis: submission.timeConsumedMillis ?? null,
    memoryConsumedBytes: submission.memoryConsumedBytes ?? null,
    pointsAwarded: 0,
    penaltyApplied: 0,
    checkedAt: new Date(),
    raw: submission,
  };
};

const upsertCodeforcesSubmission = async (payload) => {
  const existingSubmission = await Submission.findOne({
    room: payload.room,
    user: payload.user,
    problem: payload.problem,
    codeforcesSubmissionId: payload.codeforcesSubmissionId,
  });

  if (existingSubmission) {
    existingSubmission.set({
      programmingLanguage: payload.programmingLanguage,
      status: payload.status,
      verdict: payload.verdict,
      submittedAt: payload.submittedAt,
      relativeTimeSeconds: payload.relativeTimeSeconds,
      passedTestCount: payload.passedTestCount,
      timeConsumedMillis: payload.timeConsumedMillis,
      memoryConsumedBytes: payload.memoryConsumedBytes,
      checkedAt: payload.checkedAt,
      raw: payload.raw,
    });

    await existingSubmission.save();

    return {
      submission: existingSubmission,
      created: false,
    };
  }

  const createdSubmission = await Submission.create(payload);

  return {
    submission: createdSubmission,
    created: true,
  };
};

const getRelevantCodeforcesSubmissions = async ({
  handle,
  problem,
  room,
  count,
}) => {
  const codeforcesSubmissions = await getCodeforcesUserSubmissions({
    handle,
    from: 1,
    count,
  });

  return codeforcesSubmissions
    .filter(
      (submission) =>
        isCodeforcesSubmissionForProblem(submission, problem) &&
        isSubmissionInsideRoomWindow({ submission, room }),
    )
    .sort(
      (submissionA, submissionB) =>
        submissionA.creationTimeSeconds -
        submissionB.creationTimeSeconds,
    );
};

const syncParticipantSubmissions = async ({
  room,
  userId,
  codeforcesHandle,
  problem,
  relevantSubmissions,
}) => {
  const syncedSubmissions = [];

  for (const codeforcesSubmission of relevantSubmissions) {
    const payload = toSubmissionDocument({
      room,
      user: { _id: userId },
      problem,
      codeforcesHandle,
      submission: codeforcesSubmission,
    });

    const result = await upsertCodeforcesSubmission(payload);

    syncedSubmissions.push({
      submission: result.submission,
      created: result.created,
    });
  }

  return syncedSubmissions;
};

const getProblemWinner = async ({ room, problem }) => {
  const acceptedSubmissions = await Submission.find({
    room: room._id,
    problem: problem._id,
    status: SUBMISSION_STATUSES.ACCEPTED,
  }).sort({ submittedAt: 1 });

  return acceptedSubmissions[0] || null;
};

const applySubmissionScoring = async ({
  room,
  problem,
  roomProblem,
  syncedSubmissions,
}) => {
  const firstAcceptedSubmission = await getProblemWinner({
    room,
    problem,
  });

  const allSubmissions = syncedSubmissions
    .filter((item) => item.created)
    .sort(
      (a, b) =>
        new Date(a.submission.submittedAt).getTime() -
        new Date(b.submission.submittedAt).getTime(),
    );

  if (!allSubmissions.length) {
    return {
      pointsAwarded: 0,
      penaltyApplied: 0,
      accepted: Boolean(firstAcceptedSubmission),
      locked: Boolean(firstAcceptedSubmission),
      winnerUserId: firstAcceptedSubmission?.user || null,
    };
  }

  let pointsAwarded = 0;
  let penaltyApplied = 0;

  for (const item of allSubmissions) {
    const submission = item.submission;

    if (
      firstAcceptedSubmission &&
      new Date(submission.submittedAt).getTime() >
        new Date(firstAcceptedSubmission.submittedAt).getTime()
    ) {
      continue;
    }

    const participant = getParticipant(room, submission.user);

    if (!participant) continue;

    if (
      submission.status === SUBMISSION_STATUSES.ACCEPTED &&
      submission.codeforcesSubmissionId ===
        firstAcceptedSubmission?.codeforcesSubmissionId
    ) {
      if (submission.pointsAwarded === 0) {
        participant.score += roomProblem.points;
        participant.solvedCount += 1;
        participant.lastAcceptedAt = submission.submittedAt;

        submission.pointsAwarded = roomProblem.points;
        await submission.save();

        pointsAwarded += roomProblem.points;
      }

      continue;
    }

    if (
      submission.status !== SUBMISSION_STATUSES.ACCEPTED &&
      submission.penaltyApplied === 0
    ) {
      participant.score -= WRONG_SUBMISSION_PENALTY;

      submission.penaltyApplied = WRONG_SUBMISSION_PENALTY;
      await submission.save();

      penaltyApplied += WRONG_SUBMISSION_PENALTY;
    }
  }

  if (firstAcceptedSubmission) {
    room.winner = createPlayerSnapshot(
      getParticipant(room, firstAcceptedSubmission.user),
    );

    room.status = ROOM_STATUSES.COMPLETED;
    room.completedAt =
      firstAcceptedSubmission.submittedAt || new Date();
  }

  await room.save();

  return {
    pointsAwarded,
    penaltyApplied,
    accepted: Boolean(firstAcceptedSubmission),
    locked: Boolean(firstAcceptedSubmission),
    winnerUserId: firstAcceptedSubmission?.user || null,
  };
};

export const syncCodeforcesSubmissionsForProblem = async ({
  roomCode,
  user,
  problemId,
  count = DEFAULT_SUBMISSION_FETCH_COUNT,
}) => {
  const room = await DuelRoom.findOne({
    roomCode: roomCode.toUpperCase(),
  });

  if (!room) {
    throw new AppError('Duel room not found', 404);
  }

  if (room.status !== ROOM_STATUSES.ACTIVE) {
    throw new AppError('Room is not active', 400);
  }

  const participant = getParticipant(room, user._id);

  if (!participant) {
    throw new AppError(
      'You are not a participant in this room',
      403,
    );
  }

  const roomProblem = room.problems.find(
    (item) => item.problem.toString() === problemId.toString(),
  );

  if (!roomProblem) {
    throw new AppError(
      'Problem is not part of this room',
      400,
    );
  }

  const problem = await Problem.findById(roomProblem.problem);

  if (!problem) {
    throw new AppError('Problem not found', 404);
  }

  const existingWinner = await getProblemWinner({
    room,
    problem,
  });

  if (existingWinner) {
    const relevantSubmissions =
      await getRelevantCodeforcesSubmissions({
        handle: participant.codeforcesHandle,
        problem,
        room,
        count,
      });

    const syncedSubmissions = await syncParticipantSubmissions({
      room,
      userId: user._id,
      codeforcesHandle: participant.codeforcesHandle,
      problem,
      relevantSubmissions,
    });

    return {
      room,
      problem,
      submissions: syncedSubmissions.map(
        (item) => item.submission,
      ),
      latestAcceptedSubmission: relevantSubmissions.find(
        (submission) =>
          submission.verdict === 'OK' &&
          submission.id === existingWinner.codeforcesSubmissionId,
      ) || null,
      result: {
        accepted: true,
        acceptedAt: existingWinner.submittedAt,
        pointsAwarded: 0,
        penaltyApplied: 0,
        roomCompleted: room.status === ROOM_STATUSES.COMPLETED,
        alreadySolved: true,
        locked: true,
        winnerUserId: existingWinner.user,
      },
    };
  }

  const relevantSubmissions =
    await getRelevantCodeforcesSubmissions({
      handle: participant.codeforcesHandle,
      problem,
      room,
      count,
    });

  const syncedSubmissions = await syncParticipantSubmissions({
    room,
    userId: user._id,
    codeforcesHandle: participant.codeforcesHandle,
    problem,
    relevantSubmissions,
  });

  if (
    room.mode !== GAME_MODES.BATTLE_ROYALE &&
    room.mode !== GAME_MODES.CODE_GAUNTLET
  ) {
    for (const otherParticipant of room.participants) {
      if (
        otherParticipant.user.toString() ===
        user._id.toString()
      ) {
        continue;
      }

      const otherSubmissions =
        await getRelevantCodeforcesSubmissions({
          handle: otherParticipant.codeforcesHandle,
          problem,
          room,
          count,
        });

      const otherSyncedSubmissions =
        await syncParticipantSubmissions({
          room,
          userId: otherParticipant.user,
          codeforcesHandle:
            otherParticipant.codeforcesHandle,
          problem,
          relevantSubmissions: otherSubmissions,
        });

      syncedSubmissions.push(...otherSyncedSubmissions);
    }
  }

  const scoringResult = await applySubmissionScoring({
    room,
    problem,
    roomProblem,
    syncedSubmissions,
  });

  const acceptedCodeforcesSubmission =
    await getProblemWinner({
      room,
      problem,
    });

  return {
    room,
    problem,
    submissions: syncedSubmissions.map(
      (item) => item.submission,
    ),
    latestAcceptedSubmission:
      acceptedCodeforcesSubmission,
    result: {
      accepted: scoringResult.accepted,
      acceptedAt:
        acceptedCodeforcesSubmission?.submittedAt || null,
      pointsAwarded: scoringResult.pointsAwarded,
      penaltyApplied: scoringResult.penaltyApplied,
      roomCompleted:
        room.status === ROOM_STATUSES.COMPLETED,
      alreadySolved: false,
      locked: scoringResult.locked,
      winnerUserId: scoringResult.winnerUserId,
    },
  };
};