import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { venue: true }
    });
    res.json(events);
  } catch (error) {
    console.error("🚨 GET /api/events error:", error); // <-- Better debugging
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, venue_id, datetime, capacity } = req.body;
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        venue_id,
        datetime: new Date(datetime),
        capacity
      }
    });
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("🚨 POST /api/events error:", error); // <-- Better debugging
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;