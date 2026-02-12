"use server";

import { prisma } from "@/lib/prisma";

export const getActivePlans = async () => {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        amount: "asc",
      },
    });

    return { plans };
  } catch (error) {
    console.error("Error fetching plans:", error);
    return { error: "Failed to fetch plans", plans: [] };
  }
};
