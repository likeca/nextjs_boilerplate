import { db as prisma } from "./db";

/**
 * Determine whether `editorId` is allowed to access or edit the user identified by `targetUserId`.
 *
 * Rules (in priority order):
 *  1. A user can always access/edit themselves.
 *  2. A Super Admin (isAdmin + role name "Super Admin") can access/edit anyone.
 *  3. Any admin whose role carries the permission with resource="user" and action="update_any" can access/edit anyone.
 *  4. Everyone else is denied.
 */
export async function canAccessUser(
  editorId: string,
  targetUserId: string
): Promise<boolean> {
  // Rule 1: users can always access/edit themselves
  if (editorId === targetUserId) return true;

  const editor = await prisma.user.findUnique({
    where: { id: editorId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!editor) return false;

  // Rule 2: Super Admin can access/edit anyone
  if (editor.isAdmin && editor.role?.name === "Super Admin") return true;

  // Rule 3: explicit permission with resource="user" and action="update_any"
  return (
    editor.role?.rolePermissions.some(
      (rp) =>
        rp.permission.resource === "user" &&
        rp.permission.action === "update_any"
    ) ?? false
  );
}

/**
 * Check if a user has a specific permission
 * This checks role-based permissions for specific CRUD operations
 */
export async function hasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) return false;

  // First, user must be an admin to access admin pages
  if (!user.isAdmin) return false;

  // If user has no role, they can't perform any actions
  if (!user.role) return false;

  // Check if the role has the specific permission for this action
  return user.role.rolePermissions.some(
    (rp) =>
      rp.permission.resource === resource && rp.permission.action === action
  );
}

/**
 * Check if a user has any of the specified roles
 */
export async function hasRole(userId: string, roleNames: string[]): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
    },
  });

  if (!user || !user.role) return false;

  return roleNames.includes(user.role.name);
}

/**
 * Check if a user can access protected routes
 */
export async function canAccessProtectedRoutes(
  userId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!user) return false;

  return user.isAdmin;
}
