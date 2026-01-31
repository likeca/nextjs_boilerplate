"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

export async function deletePermission(id: string) {
  // Check permission to delete permissions
  await requirePermission("permission", "delete");

  if (!id) {
    return { error: "Permission ID is required" };
  }

  try {
    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      return { error: "Permission not found" };
    }

    // Check if permission is assigned to any roles
    const rolesWithPermission = await prisma.rolePermission.count({
      where: { permissionId: id },
    });

    if (rolesWithPermission > 0) {
      return {
        error: `Cannot delete permission. It is currently assigned to ${rolesWithPermission} role(s).`,
      };
    }

    // Delete permission
    await prisma.permission.delete({
      where: { id },
    });

    return { success: "Permission deleted successfully" };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Failed to delete permission: " + String(error) };
  }
}
