"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe/config";
import { prisma } from "@/lib/prisma";

export const cancelSubscription = async (subscriptionId: string) => {
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

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { error: "Failed to cancel subscription" };
  }
};
