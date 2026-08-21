import crypto from 'crypto';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const createRoomCode = () => {
  return Array.from({ length: 5 }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join('');
};
