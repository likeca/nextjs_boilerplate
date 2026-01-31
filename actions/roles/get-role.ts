"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

export async function getRole(id: string) {
  // Check permission to read roles
  await requirePermission("role", "read");

  if (!id) {
    return { error: "Role ID is required" };
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id },
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

    return { success: true, role };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Failed to fetch role: " + String(error) };
  }
}
