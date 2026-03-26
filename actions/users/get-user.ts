'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';
import { canAccessUser } from '@/lib/permissions';
import { auditLogger, AuditEventType } from '@/lib/security/audit-logger';

export async function getAdmin(id: string) {
  // Check permission to read admins
  const session = await requirePermission("user", "read");

  if (!id) {
    return { error: 'Admin ID is required' };
  }

  // IDOR guard: verify the current user is allowed to access this specific user
  const permitted = await canAccessUser(session.user.id, id);
  if (!permitted) {
    auditLogger.logSecurity(
      AuditEventType.USER_DATA_ACCESS_ATTEMPT,
      `User ${session.user.id} attempted to access user ${id} without permission`,
      { userId: session.user.id, metadata: { targetUserId: id } }
    );
    return { error: 'Forbidden: Cannot access this user' };
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
