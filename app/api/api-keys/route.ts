import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function GET() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ keys })
}

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Key name is required" }, { status: 400 })
  }

  const rawKey = `sk_live_${crypto.randomBytes(24).toString("hex")}`
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")
  const keyPrefix = rawKey.slice(0, 12)

  const apiKey = await prisma.apiKey.create({
    data: {
      name: name.trim(),
      keyHash,
      keyPrefix,
      userId: session.user.id,
    },
  })

  return NextResponse.json({
    id: apiKey.id,
    name: apiKey.name,
    key: rawKey,
    keyPrefix,
    createdAt: apiKey.createdAt,
  })
}

export async function DELETE(request: NextRequest) {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const keyId = searchParams.get("id")

  if (!keyId) return NextResponse.json({ error: "Key ID required" }, { status: 400 })

  await prisma.apiKey.updateMany({
    where: { id: keyId, userId: session.user.id },
    data: { revokedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
