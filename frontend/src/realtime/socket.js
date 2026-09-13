import { io } from 'socket.io-client';
import { getApiOrigin } from '../api';

export function connectDuelRoomSocket(roomCode, handlers = {}) {
  const socket = io(getApiOrigin(), {
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });

  const normalizedRoomCode = roomCode?.trim().toUpperCase();

  socket.on('connect', () => {
    if (normalizedRoomCode) socket.emit('duel:join-room', normalizedRoomCode);
  });

  socket.on('duel:room-updated', handlers.onRoomUpdated || (() => {}));
  socket.on('duel:started', handlers.onDuelStarted || (() => {}));
  socket.on('duel:cancelled', handlers.onDuelCancelled || (() => {}));
  socket.on('submission:synced', handlers.onSubmissionSynced || (() => {}));
  socket.on('tournament:updated', handlers.onTournamentUpdated || (() => {}));

  return () => {
    if (normalizedRoomCode) socket.emit('duel:leave-room', normalizedRoomCode);
    socket.disconnect();
  };
}
