"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe/config";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const verifyCheckoutSession = async (sessionId: string) => {
  console.log("[VERIFY] Starting checkout session verification");
  console.log("[VERIFY] Session ID received:", sessionId);
  
  try {
    console.log("[VERIFY] Fetching authenticated user session...");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.error("[VERIFY] No authenticated user found");
      return { error: "Unauthorized" };
    }

    console.log("[VERIFY] Authenticated user:", session.user.id, session.user.email);

    // Retrieve the checkout session from Stripe
    console.log("[VERIFY] Retrieving checkout session from Stripe...");
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("[VERIFY] Checkout session retrieved from Stripe:", {
      id: checkoutSession.id,
      payment_status: checkoutSession.payment_status,
      customer: checkoutSession.customer,
      subscription: checkoutSession.subscription,
      metadata: checkoutSession.metadata,
    });

    if (!checkoutSession) {
      console.error("[VERIFY] Checkout session not found in Stripe");
      return { error: "Session not found" };
    }

    if (checkoutSession.payment_status !== "paid") {
      console.error("[VERIFY] Payment not completed. Status:", checkoutSession.payment_status);
      return { error: "Payment not completed" };
    }

    console.log("[VERIFY] Payment status confirmed: paid");

    const subscriptionId = checkoutSession.subscription as string;
    const customerId = checkoutSession.customer as string;
    const userId = checkoutSession.metadata?.userId;
    const planId = checkoutSession.metadata?.planId;

    console.log("[VERIFY] Extracted data:", {
      subscriptionId,
      customerId,
      userId,
      planId,
    });

    if (!userId || !planId || !subscriptionId) {
      console.error("[VERIFY] Missing required data:", {
        hasUserId: !!userId,
        hasPlanId: !!planId,
        hasSubscriptionId: !!subscriptionId,
      });
      return { error: "Invalid session data" };
    }

    console.log("[VERIFY] All required data present");

    // Check if subscription already exists
    console.log("[VERIFY] Checking for existing subscription in database...");
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (existingSubscription) {
      console.log("[VERIFY] Subscription already exists in database:", {
        id: existingSubscription.id,
        userId: existingSubscription.userId,
        status: existingSubscription.status,
      });
      return { success: true, alreadyExists: true };
    }

    console.log("[VERIFY] No existing subscription found, proceeding to create...");

    // Retrieve subscription details from Stripe
    console.log("[VERIFY] Retrieving full subscription details from Stripe...");
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log("[VERIFY] Stripe subscription details:", {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      current_period_start: stripeSubscription.current_period_start,
      current_period_end: stripeSubscription.current_period_end,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    });

    // Create subscription in database
    console.log("[VERIFY] Creating subscription in database with data:", {
      userId,
      planId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });

    const createdSubscription = await prisma.subscription.create({
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

    console.log("[VERIFY] ✅ Subscription created successfully!", {
      id: createdSubscription.id,
      userId: createdSubscription.userId,
      planId: createdSubscription.planId,
      status: createdSubscription.status,
    });

    // Create payment record if payment_intent exists
    if (checkoutSession.payment_intent) {
      console.log("[VERIFY] Creating payment record for payment intent:", checkoutSession.payment_intent);
      const paymentRecord = await prisma.payment.create({
        data: {
          userId,
          stripePaymentId: checkoutSession.payment_intent as string,
          amount: checkoutSession.amount_total || 0,
          currency: checkoutSession.currency || "usd",
          status: "succeeded",
          description: `Subscription payment for plan ${planId}`,
        },
      });
      console.log("[VERIFY] Payment record created:", paymentRecord.id);
    } else {
      console.log("[VERIFY] No payment_intent found, skipping payment record creation");
    }

    console.log("[VERIFY] ✅ Checkout session verification completed successfully");
    return { success: true };
  } catch (error) {
    console.error("[VERIFY] ❌ Error verifying checkout session:", error);
    console.error("[VERIFY] Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return { error: "Failed to verify checkout session" };
  }
};
