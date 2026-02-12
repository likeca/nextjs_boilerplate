"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/payments/stripe/config";
import { createOrRetrieveCustomer } from "@/lib/payments/stripe/utils";
import { prisma } from "@/lib/prisma";

export const createCheckoutSession = async (planId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "You must be logged in to purchase a plan" };
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return { error: "Plan not found or inactive" };
    }

    const customerId = await createOrRetrieveCustomer(
      session.user.id,
      session.user.email
    );

    const checkoutSession = await stripe.checkout.sessions.create({
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
    });

    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to create checkout session: ${errorMessage}` };
  }
};
