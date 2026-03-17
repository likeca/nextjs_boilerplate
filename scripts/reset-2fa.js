// Reset 2FA state for a user (for test purposes)
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const EMAIL = process.argv[2] || 'admin@admin.com';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.twoFactor.deleteMany({ where: { user: { email: EMAIL } } });
  await prisma.user.update({ where: { email: EMAIL }, data: { twoFactorEnabled: false } });
  console.log(`✅ 2FA state reset for ${EMAIL}`);
}

main()
  .then(() => Promise.all([prisma.$disconnect(), pool.end()]))
  .catch((e) => { console.error(e); prisma.$disconnect(); pool.end(); process.exit(1); });
