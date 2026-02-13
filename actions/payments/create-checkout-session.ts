"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe/config";
import { createOrRetrieveCustomer } from "@/lib/payments/stripe/utils";
import { prisma } from "@/lib/prisma";
import { auditLogger, AuditEventType } from "@/lib/security/audit-logger";
import { getClientIdentifier } from "@/lib/security/rate-limiter";

export const createCheckoutSession = async (planId: string) => {
  const requestHeaders = await headers();
  const clientIp = getClientIdentifier(requestHeaders);
  
  try {
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user) {
      auditLogger.logSecurity(
        AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
        "Unauthorized checkout session attempt",
        {
          ipAddress: clientIp,
          metadata: { planId },
        }
      );
      return { error: "Authentication required" };
    }

    // Validate plan ID format
    if (!planId || typeof planId !== "string") {
      return { error: "Invalid plan" };
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      auditLogger.logPayment(
        AuditEventType.CHECKOUT_SESSION_FAILED,
        "failure",
        "Invalid or inactive plan",
        {
          userId: session.user.id,
          email: session.user.email,
          ipAddress: clientIp,
          metadata: { planId, planFound: !!plan, planActive: plan?.isActive },
        }
      );
      return { error: "Plan not available" };
    }

    const customerId = await createOrRetrieveCustomer(
      session.user.id,
      session.user.email
    );

    // Create idempotency key for Stripe API call
    const idempotencyKey = `checkout_${session.user.id}_${planId}_${Date.now()}`;

    const checkoutSession = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?from=checkout`,
        metadata: {
          userId: session.user.id,
          planId: plan.id,
        },
      },
      {
        idempotencyKey,
      }
    );

    auditLogger.logPayment(
      AuditEventType.CHECKOUT_SESSION_CREATED,
      "success",
      "Checkout session created successfully",
      {
        userId: session.user.id,
        email: session.user.email,
        ipAddress: clientIp,
        resourceId: checkoutSession.id,
        metadata: {
          planId: plan.id,
          planName: plan.name,
          amount: plan.amount,
          currency: plan.currency,
        },
      }
    );

    return { url: checkoutSession.url };
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.CHECKOUT_SESSION_FAILED,
      "failure",
      "Failed to create checkout session",
      {
        ipAddress: clientIp,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: { planId },
      }
    );
    
    // Return generic error message to client
    return { error: "Unable to process request" };
  }
};
