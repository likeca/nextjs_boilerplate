"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

interface CreatePermissionInput {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export async function createPermission(data: CreatePermissionInput) {
  // Check permission to create permissions
  await requirePermission("permission", "create");

  const { name, description, resource, action } = data;

  // Validate required fields
  if (!name || name.trim() === "") {
    return { error: "Permission name is required" };
  }

  if (!resource || resource.trim() === "") {
    return { error: "Resource is required" };
  }

  if (!action || action.trim() === "") {
    return { error: "Action is required" };
  }

  try {
    // Check if permission already exists by name
    const existingPermission = await prisma.permission.findUnique({
      where: { name: name.trim() },
    });

    if (existingPermission) {
      return {
        error: "A permission with this name already exists. Please use a different name.",
      };
    }

    // Check if resource-action combination already exists
    const existingResourceAction = await prisma.permission.findFirst({
      where: {
        resource: resource.trim(),
        action: action.trim(),
      },
    });

    if (existingResourceAction) {
      return {
        error: "A permission with this resource and action combination already exists.",
      };
    }

    // Create permission
    const permission = await prisma.permission.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        resource: resource.trim(),
        action: action.trim(),
      },
    });

    return { success: "Permission created successfully", permission };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Failed to create permission: " + String(error) };
  }
}
