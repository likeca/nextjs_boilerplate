"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const getUserSubscription = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { subscription };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { error: "Failed to fetch subscription" };
  }
};
