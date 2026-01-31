import { redirect } from "next/navigation";
import { auth } from "./auth";
import {
  canAccessProtectedRoutes,
  hasPermission,
  hasRole,
} from "./permissions";

/**
 * Require authentication and optionally check for specific roles
 * Use this in Server Components and Server Actions
 */
export async function requireAuth(options?: { roles?: string[] }) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user can access protected routes
  const canAccess = await canAccessProtectedRoutes(session.user.id);
  if (!canAccess) {
    redirect("/unauthorized");
  }

  // Check for specific roles if provided
  if (options?.roles) {
    const hasRequiredRole = await hasRole(session.user.id, options.roles);
    if (!hasRequiredRole) {
      redirect("/unauthorized");
    }
  }

  return session;
}

/**
 * Require specific permission
 * Use this in Server Components and Server Actions
 */
export async function requirePermission(resource: string, action: string) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const allowed = await hasPermission(session.user.id, resource, action);
  // console.log("Permission check:", { resource, action, allowed });
  if (!allowed) {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Get the current session without redirecting
 * Returns null if not authenticated
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });
}

/**
 * Check if current user has permission without redirecting
 */
export async function checkPermission(
  resource: string,
  action: string
): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;

  return hasPermission(session.user.id, resource, action);
}

/**
 * Check if current user has role without redirecting
 */
export async function checkRole(roles: string[]): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;

  return hasRole(session.user.id, roles);
}
