"use server";

import { db as prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-helpers";

export async function getPermission(id: string) {
  // Check permission to read permissions
  await requirePermission("permission", "read");

  if (!id) {
    return { error: "Permission ID is required" };
  }

  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      return { error: "Permission not found" };
    }

    return { success: true, permission };
  } catch (error: unknown) {
    console.error(error);
    return { error: "Failed to fetch permission: " + String(error) };
  }
}
