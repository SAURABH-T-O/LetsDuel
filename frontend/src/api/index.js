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
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const authApi = {
  login: async (credentials) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  signup: async (data) => {
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  requestCodeforcesVerification: async (data) => {
    return request('/auth/codeforces/request-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyCodeforcesHandle: async (data) => {
    return request('/auth/codeforces/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  generateResetToken: async (data) => {
    return request('/auth/forgot-password/token', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyIdentity: async (data) => {
    return request('/auth/forgot-password/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data) => {
    return request('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: async () => {
    return request('/auth/logout', {
      method: 'POST',
    }).catch(() => ({}));
  },
};

export const duelApi = {
  createRoom: async (data) => {
    return request('/duel-rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  fetchRoom: async (roomCode) => {
    return request(`/duel-rooms/${roomCode}`);
  },

  joinRoom: async (roomCode) => {
    return request(`/duel-rooms/${roomCode}/join`, {
      method: 'POST',
    });
  },

  startContest: async (roomCode) => {
    return request(`/duel-rooms/${roomCode}/start`, {
      method: 'POST',
    });
  },

  cancelRoom: async (roomCode) => {
    return request(`/duel-rooms/${roomCode}/cancel`, {
      method: 'POST',
    });
  },
};