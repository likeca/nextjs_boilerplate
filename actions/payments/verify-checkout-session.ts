"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe/config";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const verifyCheckoutSession = async (sessionId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession) {
      return { error: "Session not found" };
    }

    if (checkoutSession.payment_status !== "paid") {
      return { error: "Payment not completed" };
    }

    const subscriptionId = checkoutSession.subscription as string;
    const customerId = checkoutSession.customer as string;
    const userId = checkoutSession.metadata?.userId;
    const planId = checkoutSession.metadata?.planId;

    if (!userId || !planId || !subscriptionId) {
      return { error: "Invalid session data" };
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (existingSubscription) {
      console.log("Subscription already exists, skipping creation");
      return { success: true, alreadyExists: true };
    }

    // Retrieve subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Create subscription in database
    await prisma.subscription.create({
      data: {
        userId,
        planId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });

    console.log("Subscription created successfully for user:", userId);

    // Create payment record if payment_intent exists
    if (checkoutSession.payment_intent) {
      await prisma.payment.create({
        data: {
          userId,
          stripePaymentId: checkoutSession.payment_intent as string,
          amount: checkoutSession.amount_total || 0,
          currency: checkoutSession.currency || "usd",
          status: "succeeded",
          description: `Subscription payment for plan ${planId}`,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying checkout session:", error);
    return { error: "Failed to verify checkout session" };
  }
};
