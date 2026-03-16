import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

  const { name, description } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: "Organization name is required" }, { status: 400 })

  const baseSlug = slugify(name)
  const existing = await prisma.organization.findUnique({ where: { slug: baseSlug } })
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  const org = await prisma.organization.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      ownerId: session.user.id,
      members: { create: { userId: session.user.id, role: "owner" } },
    },
    include: { _count: { select: { members: true } } },
  })

  return NextResponse.json({ organization: org }, { status: 201 })
}
