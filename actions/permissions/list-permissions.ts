"use server";

import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requirePermission } from "@/lib/auth-helpers";

export async function listPermissions() {
  // Check permission to read permissions
  await requirePermission("permission", "read");

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });

    return { success: true, permissions };
  } catch (error: unknown) {
    console.error(error);
    return {
      error: "Failed to fetch permissions: " + String(error),
      permissions: [],
    };
  }
}
