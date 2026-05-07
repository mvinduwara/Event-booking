import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import uploadRoutes from './routes/upload';
import path from 'path';
import categoryRoutes from './routes/categories';

import eventRoutes from './routes/events';
import bookingRoutes from './routes/bookings';
import venueRoutes from './routes/venues';
import userRoutes from './routes/users';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Event Booking API is running.' });
});

app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});