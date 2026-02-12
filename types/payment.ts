export type BillingInterval = "month" | "year";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  stripePriceId: string;
  stripeProductId: string;
  amount: number;
  currency: string;
  interval: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: Plan;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

export type PaymentStatus = "succeeded" | "pending" | "failed";
