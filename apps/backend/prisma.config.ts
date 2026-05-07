import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://admin:adminpassword@localhost:5432/event_booking_db?schema=public",
  },
});