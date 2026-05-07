// apps/backend/src/routes/bookings.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { event_id, ticket_count, user_email } = req.body;

    // 1. In a real app, user_id comes from Auth tokens. 
    // For now, let's find or create a dummy user based on email.
    let user = await prisma.user.findUnique({ where: { email: user_email } });
    if (!user) {
      user = await prisma.user.create({ data: { email: user_email } });
    }

    // 2. Check if the event exists and has enough capacity
    const event = await prisma.event.findUnique({ where: { id: event_id } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.capacity < ticket_count) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // 3. Create the booking and reduce event capacity in a transaction
    const [booking, updatedEvent] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          user_id: user.id,
          event_id: event.id,
          ticket_count: ticket_count,
          status: 'CONFIRMED'
        }
      }),
      prisma.event.update({
        where: { id: event.id },
        data: { capacity: event.capacity - ticket_count }
      })
    ]);

    res.status(201).json({ 
      message: 'Booking successful', 
      booking,
      remaining_capacity: updatedEvent.capacity
    });

  } catch (error) {
    console.error("🚨 POST /api/bookings error:", error);
    res.status(500).json({ error: 'Failed to process booking' });
  }
});

// Get bookings for a specific user
router.get('/user/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const bookings = await prisma.booking.findMany({
      where: { user_id: user.id },
      include: { event: true }
    });
    
    res.json(bookings);
  } catch (error) {
    console.error("🚨 GET /api/bookings error:", error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;