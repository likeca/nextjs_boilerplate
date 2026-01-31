"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

export async function listRoles() {
  // Check permission to read roles
  await requirePermission("role", "read");

  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return { success: true, roles };
  } catch (error: unknown) {
    console.error(error);
    return {
      error: "Failed to fetch roles: " + String(error),
      roles: [],
    };
  }
}
