import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding plans...");

  // Note: You need to create these products and prices in your Stripe Dashboard first
  // Then replace the stripePriceId and stripeProductId with your actual Stripe IDs
  
  const plans = [
    // Monthly Plans
    {
      name: "Starter",
      description: "Perfect for individuals and small projects",
      stripePriceId: "price_starter_monthly", // Replace with actual Stripe Price ID
      stripeProductId: "prod_starter", // Replace with actual Stripe Product ID
      amount: 999, // $9.99 in cents
      currency: "usd",
      interval: "month",
      features: [
        "Up to 10 projects",
        "Basic analytics",
        "Email support",
        "1 GB storage",
        "Community access",
      ],
      isPopular: false,
      isActive: true,
    },
    {
      name: "Professional",
      description: "Ideal for growing teams and businesses",
      stripePriceId: "price_professional_monthly", // Replace with actual Stripe Price ID
      stripeProductId: "prod_professional", // Replace with actual Stripe Product ID
      amount: 2999, // $29.99 in cents
      currency: "usd",
      interval: "month",
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "10 GB storage",
        "Team collaboration",
        "API access",
        "Custom integrations",
      ],
      isPopular: true,
      isActive: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations with advanced needs",
      stripePriceId: "price_enterprise_monthly", // Replace with actual Stripe Price ID
      stripeProductId: "prod_enterprise", // Replace with actual Stripe Product ID
      amount: 9999, // $99.99 in cents
      currency: "usd",
      interval: "month",
      features: [
        "Everything in Professional",
        "Dedicated support",
        "Unlimited storage",
        "Advanced security",
        "SLA guarantee",
        "Custom contracts",
        "On-premise deployment",
      ],
      isPopular: false,
      isActive: true,
    },
    // Yearly Plans
    {
      name: "Starter",
      description: "Perfect for individuals and small projects",
      stripePriceId: "price_starter_yearly", // Replace with actual Stripe Price ID
      stripeProductId: "prod_starter", // Replace with actual Stripe Product ID
      amount: 9999, // $99.99 in cents (save ~17%)
      currency: "usd",
      interval: "year",
      features: [
        "Up to 10 projects",
        "Basic analytics",
        "Email support",
        "1 GB storage",
        "Community access",
      ],
      isPopular: false,
      isActive: true,
    },
    {
      name: "Professional",
      description: "Ideal for growing teams and businesses",
      stripePriceId: "price_professional_yearly", // Replace with actual Stripe Price ID
      stripeProductId: "prod_professional", // Replace with actual Stripe Product ID
      amount: 29999, // $299.99 in cents (save ~17%)
      currency: "usd",
      interval: "year",
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "10 GB storage",
        "Team collaboration",
        "API access",
        "Custom integrations",
      ],
      isPopular: true,
      isActive: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations with advanced needs",
      stripePriceId: "price_enterprise_yearly", // Replace with actual Stripe Price ID
      stripeProductId: "prod_enterprise", // Replace with actual Stripe Product ID
      amount: 99999, // $999.99 in cents (save ~17%)
      currency: "usd",
      interval: "year",
      features: [
        "Everything in Professional",
        "Dedicated support",
        "Unlimited storage",
        "Advanced security",
        "SLA guarantee",
        "Custom contracts",
        "On-premise deployment",
      ],
      isPopular: false,
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { stripePriceId: plan.stripePriceId },
      update: plan,
      create: plan,
    });
  }

  console.log("Plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
