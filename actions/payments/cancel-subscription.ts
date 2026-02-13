"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe/config";
import { prisma } from "@/lib/prisma";
import { auditLogger, AuditEventType } from "@/lib/security/audit-logger";
import { getClientIdentifier } from "@/lib/security/rate-limiter";

export const cancelSubscription = async (subscriptionId: string) => {
  const requestHeaders = await headers();
  const clientIp = getClientIdentifier(requestHeaders);
  
  try {
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user) {
      auditLogger.logSecurity(
        AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
        "Unauthorized subscription cancellation attempt",
        {
          ipAddress: clientIp,
          metadata: { subscriptionId },
        }
      );
      return { error: "Authentication required" };
    }

    // Validate subscription ID format
    if (!subscriptionId || typeof subscriptionId !== "string") {
      return { error: "Invalid subscription" };
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
        userId: session.user.id, // Ensure user owns this subscription
      },
    });

    if (!subscription) {
      auditLogger.logSecurity(
        AuditEventType.AUTHORIZATION_FAILED,
        "Subscription not found or access denied",
        {
          userId: session.user.id,
          email: session.user.email,
          ipAddress: clientIp,
          metadata: { subscriptionId },
        }
      );
      return { error: "Subscription not found" };
    }

    // Check if subscription is already cancelled
    if (subscription.status === "canceled" || subscription.cancelAtPeriodEnd) {
      return { error: "Subscription already cancelled" };
    }

    // Cancel at period end with idempotency
    const idempotencyKey = `cancel_${subscriptionId}_${Date.now()}`;
    
    await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      },
      {
        idempotencyKey,
      }
    );

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true },
    });

    auditLogger.logPayment(
      AuditEventType.SUBSCRIPTION_CANCELLED,
      "success",
      "Subscription cancelled at period end",
      {
        userId: session.user.id,
        email: session.user.email,
        ipAddress: clientIp,
        resourceId: subscriptionId,
        metadata: {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      }
    );

    return { success: true };
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.SUBSCRIPTION_CANCELLED,
      "failure",
      "Failed to cancel subscription",
      {
        ipAddress: clientIp,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: { subscriptionId },
      }
    );
    
    return { error: "Unable to cancel subscription" };
  }
};
