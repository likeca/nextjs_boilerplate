"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

export async function deleteRole(id: string) {
  // Check permission to delete roles
  await requirePermission("role", "delete");

  if (!id) {
    return { error: "Role ID is required" };
  }

  try {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return { error: "Role not found" };
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return {
        error: "Cannot delete system roles (user, admin, super_admin).",
      };
    }

    // Check if role is assigned to any users
    const adminsWithRole = await prisma.user.count({
      where: { roleId: id },
    });

    if (adminsWithRole > 0) {
      return {
        error: `Cannot delete role. It is currently assigned to ${adminsWithRole} admin(s).`,
      };
    }

    // Delete role (cascade will delete role permissions)
    await prisma.role.delete({
      where: { id },
    });

    return { success: "Role deleted successfully" };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Failed to delete role: " + String(error) };
  }
}
