"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds: string[];
}

export async function createRole(data: CreateRoleInput) {
  // Check permission to create roles
  await requirePermission("role", "create");

  const { name, description, permissionIds } = data;

  // Validate required fields
  if (!name || name.trim() === "") {
    return { error: "Role name is required" };
  }

  try {
    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: name.trim() },
    });

    if (existingRole) {
      return {
        error: "A role with this name already exists. Please use a different name.",
      };
    }

    // Create role with permissions
    const role = await prisma.role.create({
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

    return { success: "Role created successfully", role };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Failed to create role: " + String(error) };
  }
}
