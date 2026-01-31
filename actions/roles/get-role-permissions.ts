"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

export async function getRolePermissions(roleId: string) {
  // Check permission to read roles
  await requirePermission("role", "read");

  if (!roleId) {
    return { error: "Role ID is required", permissions: [] };
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return { error: "Role not found" };
    }

    const permissions = role.rolePermissions.map((rp) => rp.permission);

    return { success: true, permissions };
  } catch (error: unknown) {
    console.error(error);
    return {
      error: "Failed to fetch role permissions: " + String(error),
      permissions: [],
    };
  }
}
