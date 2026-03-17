import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  let dbStatus: "ok" | "error" = "ok";
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch {
    dbStatus = "error";
  }

  const responseTime = Date.now() - startTime;

  const health = {
    status: dbStatus === "ok" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    responseTime: `${responseTime}ms`,
    services: {
      database: {
        status: dbStatus,
        latency: dbLatency > 0 ? `${dbLatency}ms` : undefined,
      },
    },
  };

  const statusCode = dbStatus === "ok" ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
