import { db as prisma } from "./db";

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
