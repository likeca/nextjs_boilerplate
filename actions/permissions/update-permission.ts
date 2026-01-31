"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

interface UpdatePermissionInput {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export async function updatePermission(data: UpdatePermissionInput) {
  // Check permission to update permissions
  await requirePermission("permission", "update");

  const { id, name, description, resource, action } = data;

  // Validate required fields
  if (!id || !name || name.trim() === "") {
    return { error: "ID and permission name are required" };
  }

  if (!resource || resource.trim() === "") {
    return { error: "Resource is required" };
  }

  if (!action || action.trim() === "") {
    return { error: "Action is required" };
  }

  try {
    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return { error: "Permission not found" };
    }

    // Check if new name conflicts with another permission
    const nameConflict = await prisma.permission.findFirst({
      where: {
        name: name.trim(),
        NOT: { id },
      },
    });

    if (nameConflict) {
      return {
        error:
          "A permission with this name already exists. Please use a different name.",
      };
    }

    // Check if resource-action combination conflicts with another permission
    const resourceActionConflict = await prisma.permission.findFirst({
      where: {
        resource: resource.trim(),
        action: action.trim(),
        NOT: { id },
      },
    });

    if (resourceActionConflict) {
      return {
        error: "A permission with this resource and action combination already exists.",
      };
    }

    // Update permission
    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        resource: resource.trim(),
        action: action.trim(),
      },
    });

    return { success: "Permission updated successfully", permission };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Failed to update permission: " + String(error) };
  }
}
