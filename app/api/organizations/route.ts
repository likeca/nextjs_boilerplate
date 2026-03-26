import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const orgSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
})

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export async function GET() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
    include: { organization: { include: { _count: { select: { members: true } } } } },
  })

  return NextResponse.json({ organizations: memberships.map((m) => ({ ...m.organization, role: m.role })) })
}

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = orgSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { name, description, slug: customSlug } = parsed.data

  const baseSlug = customSlug ?? slugify(name)
  const existing = await prisma.organization.findUnique({ where: { slug: baseSlug } })
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      description: description || null,
      ownerId: session.user.id,
      members: { create: { userId: session.user.id, role: "owner" } },
    },
    include: { _count: { select: { members: true } } },
  })

  return NextResponse.json({ organization: org }, { status: 201 })
}
