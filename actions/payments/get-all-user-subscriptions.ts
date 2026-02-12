"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const getAllUserSubscriptions = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { subscriptions };
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return { error: "Failed to fetch subscriptions" };
  }
};
