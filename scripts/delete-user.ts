import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function deleteUser() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: tsx scripts/delete-user.ts <email>');
    process.exit(1);
  }

  try {
    await prisma.user.delete({
      where: { email }
    });
    
    console.log(`✅ Deleted user: ${email}`);
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

deleteUser();
