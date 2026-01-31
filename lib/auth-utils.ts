import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Check if the current user is authenticated
 * Redirects to /login if not authenticated
 * @returns The authenticated session
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Check if the current user is an admin
 * Redirects to /login if not authenticated
 * Redirects to / if authenticated but not an admin
 * @returns The authenticated session with user data
 */
export async function requireAdmin() {
  const session = await requireAuth();

  // Get user from database to check admin status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    redirect("/");
  }

  return session;
}

/**
 * Check if the current user has a specific role
 * Redirects to /login if not authenticated
 * Redirects to / if user doesn't have the required role
 * @param roleName - The name of the required role
 * @returns The authenticated session with user data
 */
export async function requireRole(roleName: string) {
  const session = await requireAuth();

  // Get user with role information
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  if (!user?.role || user.role.name !== roleName) {
    redirect("/");
  }

  return session;
}

/**
 * Check if the current user has a specific permission
 * Redirects to /login if not authenticated
 * Redirects to / if user doesn't have the required permission
 * @param resource - The resource name (e.g., "user", "post")
 * @param action - The action name (e.g., "create", "read", "update", "delete")
 * @returns The authenticated session with user data
 */
export async function requirePermission(resource: string, action: string) {
  const session = await requireAuth();

  // Get user with role and permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  // Check if user has the required permission
  const hasPermission = user?.role?.rolePermissions.some(
    (rp) => rp.permission.resource === resource && rp.permission.action === action
  );

  if (!hasPermission) {
    redirect("/");
  }

  return session;
}

/**
 * Get the admin status of a user (non-blocking)
 * Returns false if user is not authenticated or not an admin
 * @param userId - The user ID to check (optional, will use current session if not provided)
 * @returns Boolean indicating if the user is an admin
 */
export async function isUserAdmin(userId?: string): Promise<boolean> {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (!session) {
        return false;
      }
      
      targetUserId = session.user.id;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { isAdmin: true },
    });

    return user?.isAdmin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
