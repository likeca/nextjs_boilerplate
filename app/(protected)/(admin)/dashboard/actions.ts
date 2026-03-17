"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
  const [
    totalUsers,
    activeSubscriptions,
    totalRevenue,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: { status: "active" },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "succeeded" },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
  ])

  return {
    totalUsers,
    activeSubscriptions,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    recentUsers,
  }
}
