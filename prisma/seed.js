const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding JAN-SEVA data...');

  // 1. Create Anonymous User
  let anonUser = await prisma.user.findUnique({ where: { email: 'anonymous@janseva.gov' } });
  if (!anonUser) {
    anonUser = await prisma.user.create({
      data: {
        id: 'citizen_4729',
        fullName: 'Anonymous Reporter',
        email: 'anonymous@janseva.gov',
        anonymousName: 'Citizen_4729',
        verified: true,
      },
    });
  }

  // 2. Create Authority (Prem Singh)
  let premSingh = await prisma.authority.findUnique({ where: { employeeId: 'EMP-2024-001' } });
  if (!premSingh) {
    premSingh = await prisma.authority.create({
      data: {
        id: 'auth_prem_singh',
        name: 'Prem Singh',
        employeeId: 'EMP-2024-001',
        designation: 'Roads Inspector',
        department: 'Municipal Corporation',
        serviceCategory: 'Roads & Potholes',
        officeLocation: 'Ward 5 Office',
        officeAddress: 'Sector 5, Main Street',
        officePhone: '+91-9999999999',
        jurisdictionWards: JSON.stringify(['Ward 5', 'Ward 6']),
        jurisdictionSectors: JSON.stringify(['Sector 5-7', 'Sector 8-10']),
        jurisdictionBoundary: JSON.stringify({
          north: 28.465,
          south: 28.45,
          east: 77.03,
          west: 77.01,
        }),
        latitude: 28.4600,
        longitude: 77.0270,
        totalPoints: 145,
        averageRating: 4.7,
        completedTasks: 31,
        status: 'active',
      },
    });
  }

  // 3. Create another Authority (Meera Sharma)
  let meeraSharma = await prisma.authority.findUnique({ where: { employeeId: 'EMP-2024-002' } });
  if (!meeraSharma) {
    meeraSharma = await prisma.authority.create({
      data: {
        id: 'auth_meera_sharma',
        name: 'Meera Sharma',
        employeeId: 'EMP-2024-002',
        designation: 'Environment Officer',
        department: 'Sanitation Dept',
        serviceCategory: 'Sanitation & Garbage',
        officeLocation: 'Ward 3 Office',
        latitude: 28.4550,
        longitude: 77.0250,
        totalPoints: 128,
        averageRating: 4.6,
        completedTasks: 25,
      },
    });
  }

  // 4. Create Sample Issue (from PRD)
  const reportId = 'Post_4729_0001';
  let issue1 = await prisma.issue.findUnique({ where: { id: reportId } });
  if (!issue1) {
    issue1 = await prisma.issue.create({
      data: {
        id: reportId,
        title: 'Large Pothole causing accidents',
        description: 'Large pothole outside market. Dangerous for two-wheelers.',
        category: 'Roads & Potholes',
        photoUrl: '/clogged_drain_bg_1773442922859.png', // reusing existing artifact image as placeholder
        latitude: 28.4595,
        longitude: 77.0266,
        locationAddress: 'Sector 5, near market',
        locationAccuracy: 10,
        severity: 'critical',
        reporterId: anonUser.id,
        anonymousUsername: 'Citizen_4729',
        status: 'assigned',
        authorityId: premSingh.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Create corresponding Task
    await prisma.task.create({
      data: {
        id: 'task_prem_001',
        issueId: issue1.id,
        officialId: premSingh.id,
        status: 'assigned',
        deadline: issue1.deadline,
      },
    });

    // Update Prem's current tasks
    await prisma.authority.update({
      where: { id: premSingh.id },
      data: { currentTasks: 1 },
    });
  }

  console.log('Seeding finished clusters: Users, Authorities, Issues, Tasks');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
