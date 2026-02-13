'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';

export async function getBlog(id: string) {
  // Check permission to read blogs
  await requirePermission("blog", "read");

  if (!id) {
    return { error: 'Blog ID is required' };
  }

  try {
    const blog = await db.blog.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
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

    if (!blog) {
      return { error: 'Blog not found' };
    }

    return { success: true, blog };
  } catch (error: unknown) {
    console.error(error);
    return { error: 'Failed to fetch blog: ' + String(error) };
  }
}
