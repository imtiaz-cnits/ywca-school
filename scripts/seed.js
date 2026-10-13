const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Super Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ywcaschool.edu.bd' },
    update: {
      password: passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Super Administrator',
      email: 'admin@ywcaschool.edu.bd',
      phone: '01712345678',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Super Admin created: ${adminUser.email} / password: admin123`);

  // 2. Create Default Sessions
  const session2025 = await prisma.session.upsert({
    where: { name: '2025' },
    update: { isCurrent: true },
    create: {
      name: '2025',
      isCurrent: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    },
  });

  await prisma.session.upsert({
    where: { name: '2026' },
    update: {},
    create: {
      name: '2026',
      isCurrent: false,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    },
  });
  console.log('✅ Academic Sessions created.');

  // 3. Create Default Shifts
  const morningShift = await prisma.shift.upsert({
    where: { name: 'Morning Shift' },
    update: {},
    create: {
      name: 'Morning Shift',
      startTime: '08:00 AM',
      endTime: '12:00 PM',
    },
  });

  await prisma.shift.upsert({
    where: { name: 'Day Shift' },
    update: {},
    create: {
      name: 'Day Shift',
      startTime: '12:30 PM',
      endTime: '04:30 PM',
    },
  });
  console.log('✅ Shifts created.');

  // 4. Create Default Classes & Sections
  const classesList = [
    { name: 'Play', numeric: 0, order: 1 },
    { name: 'Nursery', numeric: 0, order: 2 },
    { name: 'KG', numeric: 0, order: 3 },
    { name: 'Class One', numeric: 1, order: 4 },
    { name: 'Class Two', numeric: 2, order: 5 },
    { name: 'Class Three', numeric: 3, order: 6 },
    { name: 'Class Four', numeric: 4, order: 7 },
    { name: 'Class Five', numeric: 5, order: 8 },
  ];

  for (const c of classesList) {
    const cls = await prisma.class.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        numericValue: c.numeric,
        order: c.order,
      },
    });

    // Create sections for this class
    const sections = ['Padma', 'Meghna', 'Jamuna'];
    for (const sec of sections) {
      const existingSec = await prisma.section.findFirst({
        where: {
          name: sec,
          classId: cls.id,
        },
      });

      if (!existingSec) {
        await prisma.section.create({
          data: {
            name: sec,
            classId: cls.id,
            capacity: 40,
          },
        });
      }
    }
  }
  console.log('✅ Classes & Sections created.');

  // 5. Create Default Groups
  const groupsList = ['General', 'Science', 'Arts', 'Commerce'];
  for (const g of groupsList) {
    await prisma.group.upsert({
      where: { name: g },
      update: {},
      create: { name: g },
    });
  }
  console.log('✅ Groups created.');

  // 6. Create Default Biometric Device Record
  const deviceCount = await prisma.biometricDevice.count();
  if (deviceCount === 0) {
    await prisma.biometricDevice.create({
      data: {
        name: 'Main Gate K60 Device',
        ipAddress: '192.168.0.134',
        port: 4370,
        secretKey: 'ywca_zkteco_k40_bridge_sync_token_secret_9988',
        status: 'active',
      },
    });
    console.log('✅ Default Biometric Device configured.');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

