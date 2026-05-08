// apps/backend/src/routes/bookings.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

const router = Router();
const pool = new Pool({ connectionString: `${process.env.DATABASE_URL}` });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia', 
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
  } catch (error) { res.status(500).json({ error: 'Failed to fetch bookings' }); }
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { event_id, user_email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: user_email } });
    const event = await prisma.event.findUnique({ where: { id: event_id } });

    if (!user || !event) return res.status(404).json({ error: 'Missing data' });

    const booking = await prisma.booking.create({
      data: { user_id: user.id, event_id: event.id, ticket_count: 1, status: 'PENDING' }
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user_email,
      client_reference_id: booking.id, 
      line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `${event.title} Ticket`, images: event.image_url ? [event.image_url] : [] },
            unit_amount: 5000, 
          },
          quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?booking_id=${booking.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/events/${event.id}`,
    });

    res.json({ url: session.url });
  } catch (error) { res.status(500).json({ error: 'Checkout failed' }); }
});

// 3. Confirm Booking & SEND EMAIL
router.post('/confirm', async (req, res) => {
  try {
    const { booking_id } = req.body;
    
    // 1. Confirm the ticket in the database
    const booking = await prisma.booking.update({
      where: { id: booking_id },
      data: { status: 'CONFIRMED' },
      include: { user: true, event: true } // Include relations for the email
    });

    // 2. Reduce event capacity
    await prisma.event.update({
      where: { id: booking.event_id },
      data: { capacity: { decrement: booking.ticket_count } }
    });

    // 3. Send Automated Email via Nodemailer Ethereal Testing
    try {
      console.log("📨 Generating temporary email server for testing...");
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
          <h1 style="color: #2563eb;">You're going to ${booking.event.title}! 🎉</h1>
          <p>Hi there,</p>
          <p>Your payment was successful and your ticket is officially confirmed. You can download your PDF ticket directly from your Eventify dashboard.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Date:</strong> ${new Date(booking.event.datetime).toLocaleString()}</p>
            <p><strong>Tickets:</strong> ${booking.ticket_count}</p>
          </div>
          <p>Enjoy the event!</p>
          <p>- The Eventify Team</p>
        </div>
      `;

      const info = await transporter.sendMail({
        from: '"Eventify Tickets" <tickets@eventify.com>',
        to: booking.user.email,
        subject: `🎟️ Your Ticket for ${booking.event.title} is Confirmed!`,
        html: emailHtml
      });

      // THIS WILL PRINT IN YOUR BACKEND TERMINAL
      console.log("✅ ==========================================");
      console.log("✅ EMAIL SENT SUCCESSFULLY!");
      console.log("✅ Click this link to view the user's email:");
      console.log("✅ " + nodemailer.getTestMessageUrl(info));
      console.log("✅ ==========================================");

    } catch (emailError) {
      console.error("🚨 Email sending failed:", emailError);
    }

    res.json(booking);
  } catch(error) {
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

export default router;