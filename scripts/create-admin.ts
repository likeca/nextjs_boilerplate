import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as readline from 'readline';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Initialize Better Auth with same config as your app
const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your-google-client-id",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminUser() {
  console.log('\n🔐 Admin Account Setup\n');
  console.log('This script will create an admin user for your application.\n');

  try {
    // Get user input
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    if (!name || !email || !password) {
      console.error('\n❌ All fields are required!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('\n❌ User with this email already exists!');
      
      const update = await question('\nDo you want to make this user an admin? (yes/no): ');
      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        await prisma.user.update({
          where: { email },
          data: { isAdmin: true }
        });
        console.log('\n✅ User updated to admin successfully!');
      }
      
      rl.close();
      await prisma.$disconnect();
      await pool.end();
      process.exit(0);
    }

    // Use Better Auth's signup API to create the user with properly hashed password
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    // Now update the user to be an admin
    const createdUser = await prisma.user.findUnique({
      where: { email }
    });

    if (createdUser) {
      await prisma.user.update({
        where: { email },
        data: { 
          isAdmin: true,
          emailVerified: true,
        }
      });

      console.log('\n✅ Admin account created successfully!');
      console.log('\nAdmin Details:');
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Admin: Yes`);
      console.log('\nYou can now login with these credentials.\n');
    } else {
      console.error('\n❌ Failed to create user account');
    }

    console.log('\n✅ Admin account created successfully!');
    console.log('\nAdmin Details:');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Admin: Yes`);
    console.log('\nYou can now login with these credentials.\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdminUser();
