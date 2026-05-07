import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg'; // FIXED: Imported Pool
import { PrismaPg } from '@prisma/adapter-pg';

// FIXED: Import the event routes
import eventRoutes from './routes/events';

dotenv.config();

// Initialize Prisma with v7 adapter
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// FIXED: Initialize Express app and define PORT
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Event Booking API is running.' });
});

// FIXED: Mount the event routes
app.use('/api/events', eventRoutes);

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});