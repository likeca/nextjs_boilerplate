'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';
import { hashPassword } from 'better-auth/crypto';
import { canAccessUser } from '@/lib/permissions';
import { auditLogger, AuditEventType } from '@/lib/security/audit-logger';

interface UpdateAdminInput {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified?: boolean;
  password?: string;
  role?: string;
  isAdmin?: boolean;
}

export async function updateAdmin(data: UpdateAdminInput) {
  // Check permission to update admins
  const session = await requirePermission("user", "update");

  const { id, name, email, phone, emailVerified, password, role, isAdmin } = data;

  // Validate required fields
  if (!id || !name || !email) {
    return { error: 'ID, name, and email are required' };
  }

  // IDOR guard: verify the current user is allowed to update this specific user
  const permitted = await canAccessUser(session.user.id, id);
  if (!permitted) {
    auditLogger.logSecurity(
      AuditEventType.USER_DATA_ACCESS_ATTEMPT,
      `User ${session.user.id} attempted to update user ${id} without permission`,
      { userId: session.user.id, metadata: { targetUserId: id } }
    );
    return { error: 'Forbidden: Cannot edit this user' };
  }

  try {
    // Check if admin exists
    const existingAdmin = await db.user.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      return { error: 'Admin not found' };
    }

    // Check if email is already used by another admin
    const duplicateAdmin = await db.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { email },
        ],
      },
    });

    if (duplicateAdmin) {
      return { error: 'An admin with this email already exists' };
    }

    // Prepare update data
    const updateData: Record<string, string | boolean | null | undefined> = {
      name,
      email,
      phone: phone ?? existingAdmin.phone ?? undefined,
      emailVerified: emailVerified ?? existingAdmin.emailVerified,
    };

    // Update role if provided
    if (role !== undefined) {
      updateData.roleId = role && role !== 'user' ? role : null;
    }

    // Update isAdmin if provided
    if (isAdmin !== undefined) {
      updateData.isAdmin = isAdmin;
    }

    // Update admin
    const admin = await db.user.update({
      where: { id },
      data: updateData,
    });

    // Update password if provided using better-auth password hashing
    if (password && password.trim() !== '') {
      // Validate password length
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters long' };
      }

      try {
        // Use better-auth's hashPassword to properly hash the password
        const hashedPassword = await hashPassword(password);

        // Find or create the password account
        const account = await db.account.findFirst({
          where: {
            userId: id,
            providerId: 'credential',
          },
        });

        if (account) {
          await db.account.update({
            where: { id: account.id },
            data: { password: hashedPassword },
          });
        } else {
          await db.account.create({
            data: {
              userId: id,
              accountId: email,
              providerId: 'credential',
              password: hashedPassword,
            },
          });
        }
      } catch (error) {
        console.error('Error updating password:', error);
        return { error: 'Failed to update password' };
      }
    }

    return { success: 'Admin updated successfully', admin };
  } catch (error: unknown) {
    console.error(error);
    return { error: 'Failed to update admin: ' + String(error) };
  }
}
