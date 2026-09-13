import { getAuthToken } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: 'include',
    headers,
    ...options,
    body: options.body
      ? typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)
      : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || payload.error || 'Request failed');
  }

  return payload;
};

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  signup: (data) => request('/auth/signup', { method: 'POST', body: data }),
  requestCodeforcesVerification: (data) =>
    request('/auth/codeforces/request-verification', { method: 'POST', body: data }),
  verifyCodeforcesHandle: (data) =>
    request('/auth/codeforces/verify', { method: 'POST', body: data }),
  generateResetToken: (data) =>
    request('/auth/forgot-password/token', { method: 'POST', body: data }),
  verifyIdentity: (data) =>
    request('/auth/forgot-password/verify', { method: 'POST', body: data }),
  resetPassword: (data) =>
    request('/auth/forgot-password/reset', { method: 'POST', body: data }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => ({})),
};

const getCode = (arg) => (typeof arg === 'object' && arg !== null ? arg.roomCode : arg);

export const duelApi = {
  createRoom: (data) => request('/duel-rooms', { method: 'POST', body: data }),
  fetchRoom: (roomCode) => request(`/duel-rooms/${getCode(roomCode)}`),
  joinRoom: (roomCode) => request(`/duel-rooms/${getCode(roomCode)}/join`, { method: 'POST' }),
  moveTeamSlot: ({ roomCode, team, slot }) =>
    request(`/duel-rooms/${getCode(roomCode)}/team-slot`, {
      method: 'PATCH',
      body: { team, slot },
    }),
  startContest: (roomCode) => request(`/duel-rooms/${getCode(roomCode)}/start`, { method: 'POST' }),
  cancelRoom: (roomCode) => request(`/duel-rooms/${getCode(roomCode)}/cancel`, { method: 'POST' }),
  syncProblemSubmissions: ({ roomCode, problemId, count = 100 }) =>
    request(`/submissions/rooms/${getCode(roomCode)}/problems/${problemId}/sync`, {
      method: 'POST',
      body: { count },
    }),
};

export const getApiOrigin = () => API_BASE_URL.replace(/\/api\/?$/, '');