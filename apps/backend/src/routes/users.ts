import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

router.post('/auth', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { 
          email,
          profile_data: {} 
        }
      });
      console.log(`👤 New user registered: ${email}`);
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: email.split('@')[0] 
    });

  } catch (error) {
    console.error("🚨 Auth Route Error:", error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;