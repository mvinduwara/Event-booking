// apps/backend/src/routes/bookings.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import Stripe from 'stripe';

const router = Router();
const pool = new Pool({ connectionString: `${process.env.DATABASE_URL}` });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', 
});

router.get('/user/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.params.email } });
    if (!user) return res.json([]);

    const bookings = await prisma.booking.findMany({
      where: { user_id: user.id },
      include: { event: true },
      orderBy: { event: { datetime: 'asc' } }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { event_id, user_email } = req.body;

    const user = await prisma.user.findUnique({ where: { email: user_email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const event = await prisma.event.findUnique({ where: { id: event_id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const booking = await prisma.booking.create({
      data: {
        user_id: user.id,
        event_id: event.id,
        ticket_count: 1, 
        status: 'PENDING'
      }
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user_email,
      client_reference_id: booking.id, 
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${event.title} Ticket`,
              description: `Date: ${new Date(event.datetime).toLocaleDateString()}`,
              images: event.image_url ? [event.image_url] : [],
            },
            unit_amount: 5000, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?booking_id=${booking.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/events/${event.id}`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("🚨 Stripe Error:", error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/confirm', async (req, res) => {
  try {
    const { booking_id } = req.body;
    
    const booking = await prisma.booking.update({
      where: { id: booking_id },
      data: { status: 'CONFIRMED' }
    });

    await prisma.event.update({
      where: { id: booking.event_id },
      data: { capacity: { decrement: booking.ticket_count } }
    });

    res.json(booking);
  } catch(error) {
    console.error("🚨 Confirmation Error:", error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

export default router;