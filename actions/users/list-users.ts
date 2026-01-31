'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';

export async function listUsers() {
  // Check permission to read users
  await requirePermission("user", "read");

  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, users };
  } catch (error: unknown) {
    console.error(error);
    return { error: 'Failed to fetch users: ' + String(error), users: [] };
  }
}
