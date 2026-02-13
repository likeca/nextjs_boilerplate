"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe/config";
import { prisma } from "@/lib/prisma";
import { auditLogger, AuditEventType } from "@/lib/security/audit-logger";
import { getClientIdentifier } from "@/lib/security/rate-limiter";

export const createBillingPortalSession = async () => {
  const requestHeaders = await headers();
  const clientIp = getClientIdentifier(requestHeaders);
  
  try {
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user) {
      auditLogger.logSecurity(
        AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
        "Unauthorized billing portal access attempt",
        {
          ipAddress: clientIp,
        }
      );
      return { error: "Authentication required" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      auditLogger.logPayment(
        AuditEventType.BILLING_PORTAL_ACCESSED,
        "failure",
        "No billing information found",
        {
          userId: session.user.id,
          email: session.user.email,
          ipAddress: clientIp,
        }
      );
      return { error: "No billing information available" };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    auditLogger.logPayment(
      AuditEventType.BILLING_PORTAL_ACCESSED,
      "success",
      "Billing portal session created",
      {
        userId: session.user.id,
        email: session.user.email,
        ipAddress: clientIp,
        resourceId: portalSession.id,
        metadata: {
          customerId: user.stripeCustomerId,
        },
      }
    );

    return { url: portalSession.url };
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.BILLING_PORTAL_ACCESSED,
      "failure",
      "Failed to create billing portal session",
      {
        ipAddress: clientIp,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    
    return { error: "Unable to access billing portal" };
  }
};
