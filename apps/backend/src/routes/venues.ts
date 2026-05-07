import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Get all venues
router.get('/', async (req, res) => {
  try {
    const venues = await prisma.venue.findMany();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// Create a new venue
router.post('/', async (req, res) => {
  try {
    const { name, address, capacity, facilities } = req.body;
    const newVenue = await prisma.venue.create({
      data: {
        name,
        address,
        capacity: parseInt(capacity),
        facilities: facilities || []
      }
    });
    res.status(201).json(newVenue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create venue' });
  }
});

export default router;