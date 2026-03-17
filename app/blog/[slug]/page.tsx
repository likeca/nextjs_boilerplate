import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blog.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  })

  if (!post) return { title: "Post not found" }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await prisma.blog.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { name: true } },
    },
  })

  if (!post) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            {post.author?.name && <span>By {post.author.name}</span>}
            <span>·</span>
            <time>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-4 text-xl text-muted-foreground">{post.excerpt}</p>
          )}
        </div>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="mt-12 pt-6 border-t">
          <a href="/blog" className="text-sm text-primary hover:underline">
            ← Back to Blog
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
