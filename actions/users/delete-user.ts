'use server';

import { db } from '@/lib/db';
import { requirePermission, getSession } from '@/lib/auth-helpers';

export async function deleteUser(id: string) {
  // Check permission to delete users
  await requirePermission("user", "delete");
  
  // Get session to check if deleting own account
  const session = await getSession();

  if (!id) {
    return { error: 'User ID is required' };
  }

  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { error: 'User not found' };
    }

    // Check if users depend on this user's role
    const usersWithRole = await db.user.count({
      where: { roleId: existingUser.roleId || undefined },
    });

    // Prevent deleting the currently logged-in user
    if (session && session.user.id === id) {
      return { error: 'You cannot delete your own account' };
    }

    // Delete user (this will cascade delete sessions and accounts due to schema)
    await db.user.delete({
      where: { id },
    });

    return { success: 'User deleted successfully' };
  } catch (error: unknown) {
    console.error(error);
    return { error: 'Failed to delete user: ' + String(error) };
  }
}
