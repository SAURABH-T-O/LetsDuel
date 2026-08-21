import http from 'http';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { initializeSocket } from './socket/index.js';

const app = createApp();
const server = http.createServer(app);

initializeSocket(server);

const startServer = async () => {
  await connectDatabase();

  server.listen(env.port, () => {
    console.log(`LetsDuel backend running on port ${env.port}`);
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  shutdown('unhandledRejection');
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});