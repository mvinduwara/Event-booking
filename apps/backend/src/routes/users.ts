import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// POST - Authenticate or Register User
router.post('/auth', async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // 2. If user doesn't exist, create one (Auto-registration on first login)
    if (!user) {
      user = await prisma.user.create({
        data: { 
          email,
          profile_data: {} // Initial empty profile JSON as per schema
        }
      });
      console.log(`👤 New user registered: ${email}`);
    }

    // Return the user object for the NextAuth session
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: email.split('@')[0] // Dummy name from email
    });

  } catch (error) {
    console.error("🚨 Auth Route Error:", error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;