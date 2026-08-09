import { makeRoomCode } from '../utils/session';

export const wait = (ms = 800) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const authApi = {
  login: async () => {
    // TODO: POST /api/auth/login
    await wait();
    return { ok: true };
  },
  signup: async () => {
    // TODO: POST /api/auth/signup
    await wait();
    return { ok: true };
  },
  verifyCodeforcesHandle: async () => {
    // TODO: POST /api/auth/verify-codeforces
    await wait();
    return { ok: true };
  },
  generateResetToken: async () => {
    // TODO: POST /api/auth/forgot-password/token
    await wait();
    return { ok: true };
  },
  verifyIdentity: async () => {
    // TODO: POST /api/auth/forgot-password/verify
    await wait();
    return { ok: true };
  },
  resetPassword: async () => {
    // TODO: POST /api/auth/forgot-password/reset
    await wait();
    return { ok: true };
  },
};

export const duelApi = {
  createRoom: async () => {
    // TODO: POST /api/duel-rooms
    await wait();
    return { ok: true, roomCode: makeRoomCode(), creator: 'You' };
  },
  fetchRoom: async (roomCode) => {
    // TODO: GET /api/duel-rooms/:roomCode
    await wait(500);
    return { ok: true, roomCode, creator: 'CodeMaster_21', mode: 'battle-royale' };
  },
  joinRoom: async () => {
    // TODO: POST /api/duel-rooms/:roomCode/join
    await wait();
    return { ok: true };
  },
  startContest: async () => {
    // TODO: POST /api/duel-rooms/:roomCode/start
    await wait();
    return { ok: true };
  },
  cancelRoom: async () => {
    // TODO: DELETE /api/duel-rooms/:roomCode
    await wait();
    return { ok: true };
  },
};
