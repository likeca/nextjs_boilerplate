"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe/config";
import { prisma } from "@/lib/prisma";

export const resumeSubscription = async (subscriptionId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return { error: "Subscription not found" };
    }

    // Resume subscription by removing cancel_at_period_end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: false },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resuming subscription:", error);
    return { error: "Failed to resume subscription" };
  }
};
