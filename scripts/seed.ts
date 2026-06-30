import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin User
  const adminEmail = 'admin@voting.com';
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Super Admin',
      },
    });
    console.log('Admin user created (admin@voting.com / password123)');
  }

  // 2. Create Default Event
  const existingEvent = await prisma.event.findFirst();
  if (!existingEvent) {
    const event = await prisma.event.create({
      data: {
        title: 'Little Miss Nigeria 2026',
        description: 'The most prestigious online beauty pageant in Nigeria. Vote for your favorite contestant!',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        isActive: true,
      },
    });
    console.log('Event created:', event.title);

    // 3. Create sample contestants
    await prisma.contestant.createMany({
      data: [
        {
          name: 'Jane Doe',
          bio: 'A passionate model from Lagos with a heart of gold.',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          eventId: event.id,
        },
        {
          name: 'Sarah Smith',
          bio: 'Aspiring actress and philanthropist from Abuja.',
          imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
          eventId: event.id,
        },
        {
          name: 'Aisha Bello',
          bio: 'Loves cooking, exploring nature, and making the world a better place.',
          imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400',
          eventId: event.id,
        },
      ],
    });
    console.log('Sample contestants created.');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
