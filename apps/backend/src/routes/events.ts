import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    
    if (category && category !== 'all') {
      whereClause.category_id = String(category);
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: { 
        venue: true,
        category: true 
      },
      orderBy: { datetime: 'asc' } 
    });
    
    res.json(events);
  } catch (error) {
    console.error("🚨 GET /api/events error:", error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { 
        venue: true,
        category: true 
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error("🚨 GET /api/events/:id error:", error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, venue_id, category_id, datetime, capacity, image_url } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        venue_id,
        category_id: category_id || null, 
        datetime: new Date(datetime),
        capacity: parseInt(capacity),   
        image_url: image_url || null   
      }
    });
    
    res.status(201).json(newEvent);
  } catch (error: any) {
    if (error.code === 'P2003') {
      console.error("🚨 Foreign Key Error:", error.meta);
      return res.status(400).json({ 
        error: 'Constraint Violation', 
        message: 'Cannot create event: The specified venue or category does not exist.' 
      });
    }

    console.error("🚨 POST /api/events error:", error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;