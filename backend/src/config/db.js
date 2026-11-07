import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`✅ [MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.warn(`⚠️ [MongoDB] Could not connect to MongoDB at ${config.mongoUri}. Reason: ${err.message}`);
    console.warn('ℹ️ [MongoDB] If using MongoDB Atlas, set MONGODB_URI in backend/.env. Using graceful in-memory storage fallback for local testing.');
    isConnected = false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
