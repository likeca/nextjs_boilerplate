import { stripe } from "./config";
import { prisma } from "@/lib/prisma";

export const createOrRetrieveCustomer = async (userId: string, email: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create a new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Update user with Stripe customer ID
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
};

export const formatAmount = (amount: number, currency: string = "usd"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

export const getInterval = (interval: string): string => {
  return interval === "month" ? "mo" : "yr";
};
