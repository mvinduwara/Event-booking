// apps/backend/src/routes/users.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();
const pool = new Pool({ connectionString: `${process.env.DATABASE_URL}` });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 1. Authenticate or Register User
router.post('/auth', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { 
          email,
          profile_data: { name: "", phone: "" } 
        }
      });
    }

    res.status(200).json({ id: user.id, email: user.email, name: email.split('@')[0] });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 2. Fetch User Profile
router.get('/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.params.email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 3. Update User Profile
router.put('/profile', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { profile_data: { name, phone } }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;