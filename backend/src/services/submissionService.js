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
    (participant) =>
      participant.user.toString() === userId.toString(),
  );
};

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
  team,
  submission,
}) => {
  const status = mapCodeforcesVerdictToStatus(
    submission.verdict,
  );

  const submittedAt = getCodeforcesSubmissionDate(
    submission,
  );

  return {
    room: room._id,
    user: user._id,
    problem: problem._id,
    codeforcesSubmissionId: submission.id,
    codeforcesHandle,
    team,
    programmingLanguage:
      submission.programmingLanguage || null,
    status,
    verdict: submission.verdict || null,
    submittedAt,
    relativeTimeSeconds:
      submission.relativeTimeSeconds ?? null,
    passedTestCount:
      submission.passedTestCount ?? null,
    timeConsumedMillis:
      submission.timeConsumedMillis ?? null,
    memoryConsumedBytes:
      submission.memoryConsumedBytes ?? null,
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
    codeforcesSubmissionId:
      payload.codeforcesSubmissionId,
  });

  if (existingSubmission) {
    existingSubmission.set({
      team: payload.team,
      programmingLanguage:
        payload.programmingLanguage,
      status: payload.status,
      verdict: payload.verdict,
      submittedAt: payload.submittedAt,
      relativeTimeSeconds:
        payload.relativeTimeSeconds,
      passedTestCount: payload.passedTestCount,
      timeConsumedMillis:
        payload.timeConsumedMillis,
      memoryConsumedBytes:
        payload.memoryConsumedBytes,
      checkedAt: payload.checkedAt,
      raw: payload.raw,
    });

    await existingSubmission.save();

    return {
      submission: existingSubmission,
      created: false,
    };
  }

  const createdSubmission =
    await Submission.create(payload);

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
  const codeforcesSubmissions =
    await getCodeforcesUserSubmissions({
      handle,
      from: 1,
      count,
    });

  return codeforcesSubmissions
    .filter(
      (submission) =>
        isCodeforcesSubmissionForProblem(
          submission,
          problem,
        ) &&
        isSubmissionInsideRoomWindow({
          submission,
          room,
        }),
    )
    .sort(
      (submissionA, submissionB) =>
        submissionA.creationTimeSeconds -
        submissionB.creationTimeSeconds,
    );
};

const applyWrongSubmissionPenalty = async ({
  room,
  participant,
  problem,
  submission,
}) => {
  const roomProblem = room.problems.find(
    (item) =>
      item.problem.toString() ===
      problem._id.toString(),
  );

  if (!roomProblem || roomProblem.solvedByTeam) {
    return;
  }

  participant.score -= WRONG_SUBMISSION_PENALTY;
  participant.wrongSubmissions += 1;

  await Submission.updateOne(
    {
      room: room._id,
      user: participant.user,
      problem: problem._id,
      codeforcesSubmissionId: submission.id,
    },
    {
      $set: {
        penaltyApplied: WRONG_SUBMISSION_PENALTY,
      },
    },
  );
};

const updateTeamScores = (room) => {
  room.teamAScore = room.participants
    .filter((participant) => participant.team === 'A')
    .reduce(
      (total, participant) => total + participant.score,
      0,
    );

  room.teamBScore = room.participants
    .filter((participant) => participant.team === 'B')
    .reduce(
      (total, participant) => total + participant.score,
      0,
    );
};

const applyAcceptedResult = async ({
  room,
  participant,
  problem,
  roomProblem,
  acceptedSubmission,
}) => {
  if (roomProblem.solvedByTeam) {
    return {
      pointsAwarded: 0,
      penaltyApplied: 0,
      problemLocked: true,
      winningTeam: roomProblem.solvedByTeam,
    };
  }

  const team = participant.team;

  if (!team) {
    throw new AppError(
      'Participant is not assigned to a team',
      400,
    );
  }

  const acceptedAt =
    getCodeforcesSubmissionDate(
      acceptedSubmission,
    ) || new Date();

  participant.score += roomProblem.points;
  participant.solvedCount += 1;
  participant.lastAcceptedAt = acceptedAt;

  roomProblem.solvedByTeam = team;
  roomProblem.acceptedAt = acceptedAt;

  await Submission.updateOne(
    {
      room: room._id,
      user: participant.user,
      problem: problem._id,
      codeforcesSubmissionId:
        acceptedSubmission.id,
    },
    {
      $set: {
        pointsAwarded: roomProblem.points,
      },
    },
  );

  updateTeamScores(room);

  await room.save();

  return {
    pointsAwarded: roomProblem.points,
    penaltyApplied: 0,
    problemLocked: true,
    winningTeam: team,
  };
};

const syncParticipantSubmissions = async ({
  room,
  participant,
  problem,
  relevantSubmissions,
}) => {
  const syncedSubmissions = [];

  for (const codeforcesSubmission of relevantSubmissions) {
    const payload = toSubmissionDocument({
      room,
      user: {
        _id: participant.user,
      },
      problem,
      codeforcesHandle:
        participant.codeforcesHandle,
      team: participant.team,
      submission: codeforcesSubmission,
    });

    const { submission, created } =
      await upsertCodeforcesSubmission(
        payload,
      );

    if (
      created &&
      submission.status !==
        SUBMISSION_STATUSES.ACCEPTED
    ) {
      await applyWrongSubmissionPenalty({
        room,
        participant,
        problem,
        submission: codeforcesSubmission,
      });
    }

    syncedSubmissions.push(submission);
  }

  return syncedSubmissions;
};

export const syncCodeforcesSubmissionsForProblem =
  async ({
    roomCode,
    user,
    problemId,
    count = DEFAULT_SUBMISSION_FETCH_COUNT,
  }) => {
    const room = await DuelRoom.findOne({
      roomCode: roomCode.toUpperCase(),
    });

    if (!room) {
      throw new AppError(
        'Duel room not found',
        404,
      );
    }

    if (room.status !== ROOM_STATUSES.ACTIVE) {
      throw new AppError(
        'Room is not active',
        400,
      );
    }

    if (room.mode !== GAME_MODES.TEAM_DUEL) {
      throw new AppError(
        'Only Team Duel is currently available',
        400,
      );
    }

    const participant = getParticipant(
      room,
      user._id,
    );

    if (!participant) {
      throw new AppError(
        'You are not a participant in this room',
        403,
      );
    }

    const roomProblem = room.problems.find(
      (item) =>
        item.problem.toString() ===
        problemId.toString(),
    );

    if (!roomProblem) {
      throw new AppError(
        'Problem is not part of this room',
        400,
      );
    }

    const problem = await Problem.findById(
      roomProblem.problem,
    );

    if (!problem) {
      throw new AppError(
        'Problem not found',
        404,
      );
    }

    const relevantSubmissions =
      await getRelevantCodeforcesSubmissions({
        handle: participant.codeforcesHandle,
        problem,
        room,
        count,
      });

    const syncedSubmissions =
      await syncParticipantSubmissions({
        room,
        participant,
        problem,
        relevantSubmissions,
      });

    let result = {
      accepted: false,
      acceptedAt: null,
      pointsAwarded: 0,
      penaltyApplied: 0,
      problemLocked: Boolean(
        roomProblem.solvedByTeam,
      ),
      winningTeam: roomProblem.solvedByTeam,
    };

    if (!roomProblem.solvedByTeam) {
      const acceptedSubmission =
        findAcceptedCodeforcesSubmission({
          submissions: relevantSubmissions,
          problem,
          startedAt: room.startedAt,
          endsAt: room.endsAt,
        });

      if (acceptedSubmission) {
        result = {
          accepted: true,
          acceptedAt:
            getCodeforcesSubmissionDate(
              acceptedSubmission,
            ),
          ...(await applyAcceptedResult({
            room,
            participant,
            problem,
            roomProblem,
            acceptedSubmission,
          })),
        };
      }
    }

    updateTeamScores(room);
    await room.save();

    return {
      room,
      problem,
      submissions: syncedSubmissions,
      problemSolvedBy:
        roomProblem.solvedByTeam,
      teamAScore: room.teamAScore,
      teamBScore: room.teamBScore,
      result,
    };
  };