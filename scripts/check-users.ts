import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      roleId: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  console.log('Current users:');
  console.table(users);
  
  await prisma.$disconnect();
}

main().catch(console.error);
