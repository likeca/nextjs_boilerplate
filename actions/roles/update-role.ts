"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

interface UpdateRoleInput {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
}

export async function updateRole(data: UpdateRoleInput) {
  // Check permission to update roles
  await requirePermission("role", "update");

  const { id, name, description, permissionIds } = data;

  // Validate required fields
  if (!id || !name || name.trim() === "") {
    return { error: "ID and role name are required" };
  }

  try {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return { error: "Role not found" };
    }

    // Check if new name conflicts with another role
    const nameConflict = await prisma.role.findFirst({
      where: {
        name: name.trim(),
        NOT: { id },
      },
    });

    if (nameConflict) {
      return {
        error:
          "A role with this name already exists. Please use a different name.",
      };
    }

    // Use transaction to ensure atomicity
    const role = await prisma.$transaction(async (tx) => {
      // Delete existing role permissions
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Update role and create new permissions
      return await tx.role.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          rolePermissions: {
            create: permissionIds.map((permissionId) => ({
              permissionId,
            })),
          },
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });

    // Revalidate the cache for role-related pages
    revalidatePath("/roles");
    revalidatePath(`/roles/${id}`);

    return { success: "Role updated successfully", role };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Failed to update role: " + String(error) };
  }
}
