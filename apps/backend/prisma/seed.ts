// apps/backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  const mainVenue = await prisma.venue.create({
    data: {
      name: 'Grand Tech Arena',
      address: '404 Innovation Way, Silicon District',
      capacity: 1000,
      facilities: ['High-Speed WiFi', '4K Projectors', 'VIP Lounge', 'Catering']
    }
  });

  console.log(`✅ Created Venue: ${mainVenue.name} (ID: ${mainVenue.id})`);

  await prisma.event.create({
    data: {
      title: 'Full-Stack Dev Summit 2026',
      description: 'Join industry leaders for a comprehensive deep dive into the modern web ecosystem, featuring Next.js 14, Node.js, and advanced Docker containerization techniques.',
      venue_id: mainVenue.id, 
      datetime: new Date('2026-08-15T09:00:00Z'),
      capacity: 500
    }
  });

  await prisma.event.create({
    data: {
      title: 'AI & Cloud Infrastructure Expo',
      description: 'Explore the future of serverless deployments, edge computing, and integrating intelligent microservices into enterprise architecture.',
      venue_id: mainVenue.id,
      datetime: new Date('2026-09-22T10:30:00Z'),
      capacity: 850
    }
  });

  console.log('✅ Events created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🌱 Seeding finished.');
  });