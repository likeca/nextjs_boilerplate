import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe, stripeConfig } from "@/lib/payments/stripe/config";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature found" },
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
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Processing checkout.session.completed", session.id);
  
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error("Missing metadata in checkout session:", { userId, planId });
    return;
  }

  if (!subscriptionId) {
    console.error("No subscription ID in checkout session");
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    console.log("Creating subscription in database for user:", userId);

    // Use upsert to handle duplicate webhook calls
    await prisma.subscription.upsert({
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

    console.log("Subscription created successfully for user:", userId);

    // Only create payment record if payment_intent exists
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
      console.log("Payment record created");
    }
  } catch (error) {
    console.error("Error in handleCheckoutSessionCompleted:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "canceled",
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!subscription) {
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
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!subscription) {
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "past_due" },
  });
}
