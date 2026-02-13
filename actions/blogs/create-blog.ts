'use server';

import { db } from '@/lib/db';
import { requirePermission, getSession } from '@/lib/auth-helpers';

interface CreateBlogInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tags?: string[];
}

export async function createBlog(data: CreateBlogInput) {
  // Check permission to create blogs
  await requirePermission("blog", "create");

  const session = await getSession();
  if (!session || !session.user) {
    return { error: 'You must be logged in to create a blog' };
  }

  const { 
    title, 
    slug, 
    content, 
    excerpt, 
    coverImage, 
    published = false,
    tags = []
  } = data;

  // Validate required fields
  if (!title || !slug || !content) {
    return { error: 'Title, slug, and content are required' };
  }

  try {
    // Check if slug is already used
    const existingBlog = await db.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return { error: 'A blog with this slug already exists' };
    }

    // Create the blog
    const blog = await db.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        authorId: session.user.id,
        published,
        publishedAt: published ? new Date() : null,
        tags,
      },
    });

    return { 
      success: 'Blog created successfully', 
      blog 
    };
  } catch (error: unknown) {
    console.error(error);
    return { error: 'Failed to create blog: ' + String(error) };
  }
}
