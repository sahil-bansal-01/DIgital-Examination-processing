import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;
let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_eps';

  try {
    // Attempt connecting to the configured or default local MongoDB
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB] Connected to database: ${mongoose.connection.name} @ ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`⚠️ [MongoDB] Local connection to ${mongoUri} failed (${err.message}). Starting In-Memory MongoDB Server...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryServerInstance.getUri();
      await mongoose.connect(memUri);
      isConnected = true;
      console.log(`🚀 [MongoDB] In-Memory MongoDB Server ready at ${memUri} (zero-config local demo mode)`);
    } catch (memErr) {
      console.error('❌ [MongoDB] Failed to start In-Memory MongoDB:', memErr);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
  isConnected = false;
};
