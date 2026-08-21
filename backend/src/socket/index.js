import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('duel:join-room', (roomCode) => {
      if (typeof roomCode === 'string' && roomCode.trim()) {
        socket.join(`duel:${roomCode.trim().toUpperCase()}`);
      }
    });

    socket.on('duel:leave-room', (roomCode) => {
      if (typeof roomCode === 'string' && roomCode.trim()) {
        socket.leave(`duel:${roomCode.trim().toUpperCase()}`);
      }
    });
  });

  return io;
};

export const getSocketServer = () => io;

export const emitToDuelRoom = (roomCode, event, payload) => {
  if (!io) return;
  io.to(`duel:${roomCode.trim().toUpperCase()}`).emit(event, payload);
};