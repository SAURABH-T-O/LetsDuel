export const GAME_MODES = Object.freeze({
  TEAM_DUEL: 'team-duel',
});

export const ROOM_STATUSES = Object.freeze({
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const MATCH_STATUSES = Object.freeze({
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const SUBMISSION_STATUSES = Object.freeze({
  RUNNING: 'running',
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong-answer',
  COMPILATION_ERROR: 'compilation-error',
  RUNTIME_ERROR: 'runtime-error',
  TIME_LIMIT_EXCEEDED: 'time-limit-exceeded',
  FAILED: 'failed',
});