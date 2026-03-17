import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe, stripeConfig } from "@/lib/payments/stripe/config";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { getClientIdentifier, createRateLimitMiddleware } from "@/lib/security/rate-limiter";
import { auditLogger, AuditEventType } from "@/lib/security/audit-logger";
import { createEventGuard } from "@/lib/security/webhook-event-store";
import { EmailService } from "@/lib/email-service";

// Rate limiter: 100 requests per 15 minutes per IP
const rateLimiter = createRateLimitMiddleware(100, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  const requestHeaders = await headers();
  const clientIp = getClientIdentifier(requestHeaders);
  
  // Apply rate limiting
  const rateLimit = rateLimiter(clientIp);
  if (!rateLimit.allowed) {
    auditLogger.logSecurity(
      AuditEventType.RATE_LIMIT_EXCEEDED,
      "Webhook rate limit exceeded",
      {
        ipAddress: clientIp,
        metadata: {
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
      }
    );
    
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          "Retry-After": Math.ceil(rateLimit.resetAt / 1000).toString(),
        },
      }
    );
  }

  const body = await request.text();
  const signature = requestHeaders.get("stripe-signature");

  if (!signature) {
    auditLogger.logSecurity(
      AuditEventType.WEBHOOK_SIGNATURE_INVALID,
      "Missing webhook signature",
      { ipAddress: clientIp }
    );
    
    return NextResponse.json(
      { error: "Signature required" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeConfig.webhookSecret
    );
    
    auditLogger.logWebhook(
      AuditEventType.WEBHOOK_SIGNATURE_VALID,
      "success",
      "Webhook signature verified",
      {
        ipAddress: clientIp,
        webhookEventId: event.id,
        stripeEventType: event.type,
      }
    );
  } catch (error) {
    auditLogger.logWebhook(
      AuditEventType.WEBHOOK_SIGNATURE_INVALID,
      "failure",
      "Webhook signature verification failed",
      {
        ipAddress: clientIp,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Check for replay attacks and duplicate processing
  const eventGuard = createEventGuard(event.id, event.type, event.created);
  if (!eventGuard.shouldProcess) {
    auditLogger.logWebhook(
      AuditEventType.WEBHOOK_PROCESSING_ERROR,
      "warning",
      `Event skipped: ${eventGuard.reason}`,
      {
        webhookEventId: event.id,
        stripeEventType: event.type,
        metadata: { reason: eventGuard.reason },
      }
    );
    
    return NextResponse.json({ received: true, processed: false, reason: eventGuard.reason });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        auditLogger.logWebhook(
          AuditEventType.WEBHOOK_PROCESSING_ERROR,
          "warning",
          `Unhandled event type: ${event.type}`,
          {
            webhookEventId: event.id,
            stripeEventType: event.type,
          }
        );
    }

    eventGuard.markProcessed();

    return NextResponse.json(
      { received: true },
      {
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      }
    );
  } catch (error) {
    auditLogger.logWebhook(
      AuditEventType.WEBHOOK_PROCESSING_ERROR,
      "failure",
      "Error processing webhook",
      {
        webhookEventId: event.id,
        stripeEventType: event.type,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  auditLogger.logPayment(
    AuditEventType.CHECKOUT_SESSION_COMPLETED,
    "success",
    "Processing checkout session completed",
    {
      userId,
      resourceId: session.id,
      metadata: { subscriptionId, customerId, planId },
    }
  );

  if (!userId || !planId) {
    auditLogger.logPayment(
      AuditEventType.CHECKOUT_SESSION_FAILED,
      "failure",
      "Missing metadata in checkout session",
      {
        resourceId: session.id,
        metadata: { hasUserId: !!userId, hasPlanId: !!planId },
      }
    );
    return;
  }

  if (!subscriptionId) {
    auditLogger.logPayment(
      AuditEventType.CHECKOUT_SESSION_FAILED,
      "failure",
      "No subscription ID in checkout session",
      {
        userId,
        resourceId: session.id,
      }
    );
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const dbSubscription = await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscriptionId },
      update: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      create: {
        userId,
        planId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    auditLogger.logPayment(
      AuditEventType.SUBSCRIPTION_CREATED,
      "success",
      "Subscription created successfully",
      {
        userId,
        resourceId: dbSubscription.id,
        metadata: {
          stripeSubscriptionId: subscriptionId,
          planId,
          status: subscription.status,
        },
      }
    );

    // Send subscription confirmation email
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (user) {
        const emailService = new EmailService();
        await emailService.sendEmail({
          recipients: [user.email],
          type: 'subscription_created',
          data: {
            recipientEmail: user.email,
            recipientName: user.name || user.email.split('@')[0],
            planName: planId,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
          },
        });
      }
    } catch (emailError) {
      console.error('Failed to send subscription confirmation email:', emailError);
    }

    if (session.payment_intent) {
      await prisma.payment.create({
        data: {
          userId,
          stripePaymentId: session.payment_intent as string,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: "succeeded",
          description: `Subscription payment for plan ${planId}`,
        },
      });

      auditLogger.logPayment(
        AuditEventType.PAYMENT_SUCCEEDED,
        "success",
        "Payment record created",
        {
          userId,
          resourceId: session.payment_intent as string,
          metadata: {
            amount: session.amount_total,
            currency: session.currency,
          },
        }
      );
    }
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.CHECKOUT_SESSION_FAILED,
      "failure",
      "Error in handleCheckoutSessionCompleted",
      {
        userId,
        resourceId: session.id,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    auditLogger.logPayment(
      AuditEventType.SUBSCRIPTION_UPDATED,
      "success",
      "Subscription updated",
      {
        resourceId: subscription.id,
        metadata: {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      }
    );
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.SUBSCRIPTION_UPDATED,
      "failure",
      "Failed to update subscription",
      {
        resourceId: subscription.id,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Fetch before update so we can notify the user
    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: "canceled",
      },
    });

    auditLogger.logPayment(
      AuditEventType.SUBSCRIPTION_DELETED,
      "success",
      "Subscription deleted",
      {
        resourceId: subscription.id,
      }
    );

    // Send cancellation email
    if (dbSubscription) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: dbSubscription.userId },
          select: { email: true, name: true },
        });
        if (user) {
          const emailService = new EmailService();
          await emailService.sendEmail({
            recipients: [user.email],
            type: 'subscription_cancelled',
            data: {
              recipientEmail: user.email,
              recipientName: user.name || user.email.split('@')[0],
            },
          });
        }
      } catch (emailError) {
        console.error('Failed to send subscription cancellation email:', emailError);
      }
    }
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.SUBSCRIPTION_DELETED,
      "failure",
      "Failed to delete subscription",
      {
        resourceId: subscription.id,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (!subscription) {
      auditLogger.logPayment(
        AuditEventType.PAYMENT_SUCCEEDED,
        "warning",
        "Subscription not found for invoice payment",
        {
          resourceId: invoice.id,
          metadata: { subscriptionId: invoice.subscription },
        }
      );
      return;
    }

    await prisma.payment.create({
      data: {
        userId: subscription.userId,
        stripePaymentId: invoice.payment_intent as string,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: "succeeded",
        description: `Invoice payment for subscription ${subscription.id}`,
      },
    });

    auditLogger.logPayment(
      AuditEventType.PAYMENT_SUCCEEDED,
      "success",
      "Invoice payment recorded",
      {
        userId: subscription.userId,
        resourceId: invoice.payment_intent as string,
        metadata: {
          amount: invoice.amount_paid,
          currency: invoice.currency,
          invoiceId: invoice.id,
        },
      }
    );

    // Send payment receipt email
    try {
      const user = await prisma.user.findUnique({
        where: { id: subscription.userId },
        select: { email: true, name: true },
      });
      if (user) {
        const emailService = new EmailService();
        await emailService.sendEmail({
          recipients: [user.email],
          type: 'payment_receipt',
          data: {
            recipientEmail: user.email,
            recipientName: user.name || user.email.split('@')[0],
            invoiceId: invoice.payment_intent as string,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            paymentDate: new Date().toLocaleDateString(),
            description: `Invoice payment for subscription ${subscription.id}`,
          },
        });
      }
    } catch (emailError) {
      console.error('Failed to send payment receipt email:', emailError);
    }
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.PAYMENT_FAILED,
      "failure",
      "Failed to record invoice payment",
      {
        resourceId: invoice.id,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (!subscription) {
      auditLogger.logPayment(
        AuditEventType.PAYMENT_FAILED,
        "warning",
        "Subscription not found for failed invoice",
        {
          resourceId: invoice.id,
          metadata: { subscriptionId: invoice.subscription },
        }
      );
      return;
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "past_due" },
    });

    auditLogger.logPayment(
      AuditEventType.PAYMENT_FAILED,
      "failure",
      "Invoice payment failed",
      {
        userId: subscription.userId,
        resourceId: invoice.id,
        metadata: {
          amount: invoice.amount_due,
          currency: invoice.currency,
          subscriptionId: subscription.id,
        },
      }
    );
  } catch (error) {
    auditLogger.logPayment(
      AuditEventType.PAYMENT_FAILED,
      "failure",
      "Failed to process failed invoice",
      {
        resourceId: invoice.id,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    );
    throw error;
  }
}
