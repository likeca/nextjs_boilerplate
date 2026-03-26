import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { createRateLimitMiddleware } from "@/lib/security/rate-limiter"
import { auditLogger, AuditEventType } from "@/lib/security/audit-logger"

// Rate limiters per the issue recommendations
const listRateLimiter = createRateLimitMiddleware(100, 60 * 60 * 1000)   // 100 requests/hour
const createRateLimiter = createRateLimitMiddleware(10, 60 * 60 * 1000)  // 10 requests/hour
const deleteRateLimiter = createRateLimitMiddleware(20, 60 * 60 * 1000)  // 20 requests/hour

export async function GET() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rateLimit = listRateLimiter(`api-key-list:${session.user.id}`)
  if (!rateLimit.allowed) {
    auditLogger.logSecurity(
      AuditEventType.RATE_LIMIT_EXCEEDED,
      "API key list rate limit exceeded",
      {
        userId: session.user.id,
        metadata: { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt },
      }
    )
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          "Retry-After": Math.ceil(rateLimit.resetAt / 1000).toString(),
        },
      }
    )
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    { keys },
    {
      headers: {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetAt.toString(),
      },
    }
  )
}

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rateLimit = createRateLimiter(`api-key-create:${session.user.id}`)
  if (!rateLimit.allowed) {
    auditLogger.logSecurity(
      AuditEventType.RATE_LIMIT_EXCEEDED,
      "API key creation rate limit exceeded",
      {
        userId: session.user.id,
        metadata: { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt },
      }
    )
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          "Retry-After": Math.ceil(rateLimit.resetAt / 1000).toString(),
        },
      }
    )
  }

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

  return NextResponse.json(
    {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      keyPrefix,
      createdAt: apiKey.createdAt,
    },
    {
      headers: {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetAt.toString(),
      },
    }
  )
}

export async function DELETE(request: NextRequest) {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rateLimit = deleteRateLimiter(`api-key-delete:${session.user.id}`)
  if (!rateLimit.allowed) {
    auditLogger.logSecurity(
      AuditEventType.RATE_LIMIT_EXCEEDED,
      "API key deletion rate limit exceeded",
      {
        userId: session.user.id,
        metadata: { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt },
      }
    )
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          "Retry-After": Math.ceil(rateLimit.resetAt / 1000).toString(),
        },
      }
    )
  }

  const { searchParams } = new URL(request.url)
  const keyId = searchParams.get("id")

  if (!keyId) return NextResponse.json({ error: "Key ID required" }, { status: 400 })

  await prisma.apiKey.updateMany({
    where: { id: keyId, userId: session.user.id },
    data: { revokedAt: new Date() },
  })

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetAt.toString(),
      },
    }
  )
}
