export function makeToken(prefix = 'LETSDUEL') {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}_${random}`;
}

export function makeRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export function isAuthenticated() {
  return window.localStorage.getItem('letsduel-auth-demo') === 'true';
}
