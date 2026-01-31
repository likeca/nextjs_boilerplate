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
  console.log('This script will create an admin user with full permissions.\n');

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
      
      const update = await question('\nDo you want to make this user an admin with full permissions? (yes/no): ');
      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        // Get or create Super Admin role
        const superAdminRole = await getOrCreateSuperAdminRole();
        
        await prisma.user.update({
          where: { email },
          data: { 
            isAdmin: true,
            roleId: superAdminRole.id,
          }
        });
        console.log('\n✅ User updated to admin with Super Admin role successfully!');
      }
      
      rl.close();
      await prisma.$disconnect();
      await pool.end();
      process.exit(0);
    }

    // Create or get the Super Admin role with all permissions
    console.log('\n📋 Setting up Super Admin role...');
    const superAdminRole = await getOrCreateSuperAdminRole();
    console.log('✅ Super Admin role ready with all permissions');

    // Use Better Auth's signup API to create the user with properly hashed password
    console.log('\n👤 Creating admin user...');
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    // Now update the user to be an admin with the Super Admin role
    const createdUser = await prisma.user.findUnique({
      where: { email }
    });

    if (createdUser) {
      await prisma.user.update({
        where: { email },
        data: { 
          isAdmin: true,
          emailVerified: true,
          roleId: superAdminRole.id,
        }
      });

      console.log('\n✅ Admin account created successfully!');
      console.log('\nAdmin Details:');
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Role: Super Admin (${superAdminRole.rolePermissions.length} permissions)`);
      console.log(`Admin: Yes`);
      console.log('\nYou can now login with these credentials.\n');
    } else {
      console.error('\n❌ Failed to create user account');
    }

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
    await pool.end();
  }
}

async function getOrCreateSuperAdminRole() {
  // Define all resources and actions
  const resources = ['user', 'role', 'permission', 'setting'];
  const actions = ['create', 'read', 'update', 'delete'];

  // Check if Super Admin role exists
  let role = await prisma.role.findUnique({
    where: { name: 'Super Admin' },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    // Create the Super Admin role
    role = await prisma.role.create({
      data: {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        isSystem: true,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  // Create all permissions if they don't exist
  const allPermissions = [];
  for (const resource of resources) {
    for (const action of actions) {
      const permissionName = `${resource}:${action}`;
      
      let permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (!permission) {
        permission = await prisma.permission.create({
          data: {
            name: permissionName,
            resource,
            action,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
          },
        });
      }

      allPermissions.push(permission);
    }
  }

  // Assign all permissions to Super Admin role if not already assigned
  const existingPermissionIds = role.rolePermissions.map(rp => rp.permissionId);
  
  for (const permission of allPermissions) {
    if (!existingPermissionIds.includes(permission.id)) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Fetch the updated role with all permissions
  return await prisma.role.findUnique({
    where: { id: role.id },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  }) as any;
}

createAdminUser();
