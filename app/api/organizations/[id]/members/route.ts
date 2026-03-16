import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

async function requireOrgAccess(orgId: string, userId: string, minRole: "member" | "admin" | "owner" = "member") {
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } },
  })
  if (!membership) return null
  const roleRank = { member: 0, admin: 1, owner: 2 }
  if (roleRank[membership.role as keyof typeof roleRank] < roleRank[minRole]) return null
  return membership
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const access = await requireOrgAccess(id, session.user.id)
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { joinedAt: "asc" },
  })

  return NextResponse.json({ members })
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId } = await request.json()
  if (userId === session.user.id) return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 })

  const access = await requireOrgAccess(id, session.user.id, "admin")
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.organizationMember.delete({
    where: { organizationId_userId: { organizationId: id, userId } },
  })

  return NextResponse.json({ success: true })
}
