import dotenv from 'dotenv';

// Ensure environment variables are loaded for Prisma
dotenv.config();

export default {
  migrate: {
    url: process.env.DATABASE_URL,
  }
};