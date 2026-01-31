'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';

export async function getAdmin(id: string) {
  // Check permission to read admins
  await requirePermission("user", "read");

  if (!id) {
    return { error: 'Admin ID is required' };
  }

  try {
    const admin = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        image: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return { error: 'Admin not found' };
    }

    return { success: true, admin };
  } catch (error: unknown) {
    console.error(error);
    return { error: 'Failed to fetch admin: ' + String(error) };
  }
}
