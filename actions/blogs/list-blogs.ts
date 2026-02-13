'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';

interface ListBlogsParams {
  page?: number;
  limit?: number;
  filters?: {
    title?: string;
    authorId?: string;
    published?: string;
    tags?: string;
  };
}

export async function listBlogs(params?: ListBlogsParams) {
  // Check permission to read blogs
  await requirePermission("blog", "read");

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const filters = params?.filters ?? {};
  const skip = (page - 1) * limit;

  try {
    // Build where clause based on filters
    const where: any = {};

    if (filters.title) {
      where.title = {
        contains: filters.title,
        mode: 'insensitive',
      };
    }

    if (filters.authorId && filters.authorId !== 'all') {
      where.authorId = filters.authorId;
    }

    if (filters.published && filters.published !== 'all') {
      where.published = filters.published === 'true';
    }

    if (filters.tags) {
      where.tags = {
        has: filters.tags,
      };
    }

    // Get total count for pagination
    const total = await db.blog.count({ where });

    const blogs = await db.blog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        published: true,
        publishedAt: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      blogs,
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
      error: 'Failed to fetch blogs: ' + String(error),
      blogs: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}
