import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(env.mongodb.uri, {
    autoIndex: env.nodeEnv !== 'production',
  });

  return connection;
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};