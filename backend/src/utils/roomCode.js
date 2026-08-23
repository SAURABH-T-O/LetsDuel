import crypto from 'crypto';

const ROOM_CODE_LENGTH = 5;
const ROOM_CODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const createRoomCode = () => {
  const bytes = crypto.randomBytes(ROOM_CODE_LENGTH);

  return Array.from(bytes, (byte) => {
    return ROOM_CODE_CHARACTERS[byte % ROOM_CODE_CHARACTERS.length];
  }).join('');
};