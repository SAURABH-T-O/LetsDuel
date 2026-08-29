const ACCESS_TOKEN_KEY = 'letsduel_access_token';
const REFRESH_TOKEN_KEY = 'letsduel_refresh_token';
const USER_KEY = 'letsduel_user';

export function makeToken(prefix = 'LETSDUEL') {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}_${random}`;
}

export function makeRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export function getAuthToken() {
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY) || window.localStorage.getItem(ACCESS_TOKEN_KEY) || null;
}

export function getAuthUser() {
  const raw = window.sessionStorage.getItem(USER_KEY) || window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(authData = {}, remember = false) {
  const accessToken = authData.accessToken || authData.token || '';
  const refreshToken = authData.refreshToken || '';
  const user = authData.user || null;

  const targetStorage = remember ? window.localStorage : window.sessionStorage;
  const secondaryStorage = remember ? window.sessionStorage : window.localStorage;

  if (accessToken) {
    targetStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    targetStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (user) {
    targetStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  secondaryStorage.removeItem(ACCESS_TOKEN_KEY);
  secondaryStorage.removeItem(REFRESH_TOKEN_KEY);
  secondaryStorage.removeItem(USER_KEY);
}

export function clearAuthSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}
