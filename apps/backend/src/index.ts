import dotenv from 'dotenv';
// 1. LOAD ENV VARIABLES FIRST!
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bookingRoutes from './routes/bookings';
import venueRoutes from './routes/venues';

// 2. NOW IMPORT ROUTES (Database URL is safely loaded)
import eventRoutes from './routes/events';

// Initialize Prisma with v7 adapter
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Event Booking API is running.' });
});

// Mount the event routes
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/venues', venueRoutes);

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});