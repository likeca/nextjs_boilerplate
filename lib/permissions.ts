import { db as prisma } from "./db";

/**
 * Role hierarchy (higher roles inherit permissions from lower roles)
 */
export const ROLES = {
  USER: "user", // No access to protected routes
  ADMIN: "admin", // Access to most protected routes
  SUPER_ADMIN: "super_admin", // Full access including admin management
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

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
export async function hasRole(userId: string, roles: Role[]): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
    },
  });

  if (!user || !user.role) return false;

  return roles.includes(user.role.name as Role);
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

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string) {
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

  if (!user) return [];

  // Get role-based permissions
  const rolePermissions = user.role?.rolePermissions.map((rp) => rp.permission) || [];

  return rolePermissions;
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  roleId: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });
}
