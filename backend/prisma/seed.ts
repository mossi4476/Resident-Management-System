import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@abc-apartment.com' },
    update: {},
    create: {
      email: 'admin@abc-apartment.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@abc-apartment.com' },
    update: {},
    create: {
      email: 'manager@abc-apartment.com',
      password: managerPassword,
      role: 'MANAGER',
    },
  });

  // Create sample resident user
  const residentPassword = await bcrypt.hash('resident123', 10);
  const resident = await prisma.user.upsert({
    where: { email: 'resident@example.com' },
    update: {},
    create: {
      email: 'resident@example.com',
      password: residentPassword,
      role: 'RESIDENT',
    },
  });

  // Create resident profile
  const residentProfile = await prisma.resident.upsert({
    where: { userId: resident.id },
    update: {},
    create: {
      userId: resident.id,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+84901234567',
      apartment: 'A101',
      floor: 1,
      building: 'Building A',
      moveInDate: new Date('2023-01-01'),
      isOwner: true,
    },
  });

  // Create family member
  await prisma.familyMember.create({
    data: {
      residentId: residentProfile.id,
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+84901234568',
      email: 'jane@example.com',
      relation: 'Spouse',
      isMinor: false,
    },
  });

  // Create sample complaints
  await prisma.complaint.create({
    data: {
      title: 'Water leak in bathroom',
      description: 'There is a water leak in the bathroom that needs immediate attention. Water is dripping from the ceiling.',
      category: 'MAINTENANCE',
      priority: 'HIGH',
      status: 'PENDING',
      authorId: resident.id,
      apartment: 'A101',
      building: 'Building A',
    },
  });

  await prisma.complaint.create({
    data: {
      title: 'Noisy neighbors',
      description: 'The neighbors above are making loud noises late at night, disturbing our sleep.',
      category: 'NOISE',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      authorId: resident.id,
      assigneeId: manager.id,
      apartment: 'A101',
      building: 'Building A',
    },
  });

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: resident.id,
      title: 'Welcome to ABC Apartment',
      message: 'Welcome to our resident management system. You can now submit complaints and track their status.',
      type: 'WELCOME',
    },
  });

  await prisma.notification.create({
    data: {
      userId: manager.id,
      title: 'New Complaint Assigned',
      message: 'A new complaint has been assigned to you for review.',
      type: 'COMPLAINT',
    },
  });

  console.log('✅ Database seeding completed!');
  console.log('📧 Admin login: admin@abc-apartment.com / admin123');
  console.log('📧 Manager login: manager@abc-apartment.com / manager123');
  console.log('📧 Resident login: resident@example.com / resident123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
