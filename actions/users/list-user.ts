'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';

interface ListAdminsParams {
  page?: number;
  limit?: number;
  filters?: {
    name?: string;
    email?: string;
    emailVerified?: string;
    isAdmin?: string;
    role?: string;
  };
}

export async function listAdmins(params?: ListAdminsParams) {
  // Check permission to read admins
  await requirePermission("user", "read");

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const filters = params?.filters ?? {};
  const skip = (page - 1) * limit;

  try {
    // Build where clause based on filters
    const where: any = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }

    if (filters.emailVerified && filters.emailVerified !== 'all') {
      where.emailVerified = filters.emailVerified === 'verified' ? { not: null } : null;
    }

    if (filters.isAdmin && filters.isAdmin !== 'all') {
      where.isAdmin = filters.isAdmin === 'true';
    }

    if (filters.role && filters.role !== 'all') {
      where.role = filters.role;
    }

    // Get total count for pagination
    const total = await db.user.count({ where });

    const admins = await db.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      admins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    console.error(error);
    return {
      error: 'Failed to fetch admins: ' + String(error),
      admins: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}
