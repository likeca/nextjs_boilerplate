import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createBlogPermissions() {
  console.log('Starting blog permissions creation...');

  try {
    // Define blog permissions
    const blogPermissions = [
      { resource: 'blog', action: 'create', description: 'Create new blog posts' },
      { resource: 'blog', action: 'read', description: 'View blog posts' },
      { resource: 'blog', action: 'update', description: 'Edit blog posts' },
      { resource: 'blog', action: 'delete', description: 'Delete blog posts' },
    ];

    console.log('Creating blog permissions...');
    
    for (const permission of blogPermissions) {
      const existingPermission = await prisma.permission.findUnique({
        where: {
          resource_action: {
            resource: permission.resource,
            action: permission.action,
          },
        },
      });

      if (existingPermission) {
        console.log(`Permission ${permission.resource}:${permission.action} already exists`);
      } else {
        await prisma.permission.create({
          data: {
            name: `${permission.resource}.${permission.action}`,
            description: permission.description,
            resource: permission.resource,
            action: permission.action,
          },
        });
        console.log(`Created permission: ${permission.resource}:${permission.action}`);
      }
    }

    // Get all blog permissions
    const createdPermissions = await prisma.permission.findMany({
      where: {
        resource: 'blog',
      },
    });

    console.log(`\nBlog permissions created/verified: ${createdPermissions.length}`);
    
    // Optionally: Assign blog permissions to admin role
    const adminRole = await prisma.role.findFirst({
      where: {
        OR: [
          { name: 'admin' },
          { name: 'Admin' },
          { isSystem: true },
        ],
      },
    });

    if (adminRole) {
      console.log(`\nAssigning blog permissions to ${adminRole.name} role...`);
      
      for (const permission of createdPermissions) {
        const existingRolePermission = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          },
        });

        if (!existingRolePermission) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          });
          console.log(`Assigned ${permission.name} to ${adminRole.name}`);
        } else {
          console.log(`Permission ${permission.name} already assigned to ${adminRole.name}`);
        }
      }
    }

    console.log('\nBlog permissions setup completed successfully!');
    console.log('\nCreated permissions:');
    createdPermissions.forEach((p) => {
      console.log(`  - ${p.name}: ${p.description}`);
    });

  } catch (error) {
    console.error('Error creating blog permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createBlogPermissions()
  .catch((error) => {
    console.error('Failed to create blog permissions:', error);
    process.exit(1);
  });
