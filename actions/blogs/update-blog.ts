'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';

interface UpdateBlogInput {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tags?: string[];
}

export async function updateBlog(data: UpdateBlogInput) {
  // Check permission to update blogs
  await requirePermission("blog", "update");

  const { 
    id, 
    title, 
    slug, 
    content, 
    excerpt, 
    coverImage, 
    published,
    tags = []
  } = data;

  // Validate required fields
  if (!id || !title || !slug || !content) {
    return { error: 'ID, title, slug, and content are required' };
  }

  try {
    // Check if blog exists
    const existingBlog = await db.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return { error: 'Blog not found' };
    }

    // Check if slug is already used by another blog
    const duplicateBlog = await db.blog.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { slug },
        ],
      },
    });

    if (duplicateBlog) {
      return { error: 'A blog with this slug already exists' };
    }

    // Prepare update data
    const updateData: any = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      published,
      tags,
    };

    // Set publishedAt when publishing for the first time
    if (published && !existingBlog.published) {
      updateData.publishedAt = new Date();
    }

    // Update the blog
    const blog = await db.blog.update({
      where: { id },
      data: updateData,
    });

    return { 
      success: 'Blog updated successfully', 
      blog 
    };
  } catch (error: unknown) {
    console.error(error);
    return { error: 'Failed to update blog: ' + String(error) };
  }
}
