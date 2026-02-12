import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("\n📊 Checking Subscriptions in Database:\n");

  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: {
        select: {
          name: true,
          interval: true,
          amount: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (subscriptions.length === 0) {
    console.log("❌ No subscriptions found in database");
    console.log("\nThis means:");
    console.log("1. No payments have been completed, OR");
    console.log("2. Stripe webhooks are not configured/working");
    console.log("\nTo fix:");
    console.log("- Make sure you've completed a test payment");
    console.log("- Set up Stripe webhooks locally with: stripe listen --forward-to localhost:3000/api/webhooks/stripe");
    console.log("- Or the subscription will be created when visiting /payment/success page");
  } else {
    console.log(`✅ Found ${subscriptions.length} subscription(s):\n`);
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.user.name} (${sub.user.email})`);
      console.log(`   Plan: ${sub.plan.name} - $${(sub.plan.amount / 100).toFixed(2)}/${sub.plan.interval}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Stripe Sub ID: ${sub.stripeSubscriptionId}`);
      console.log(`   Period: ${sub.currentPeriodStart.toLocaleDateString()} - ${sub.currentPeriodEnd.toLocaleDateString()}`);
      console.log(`   Cancel at period end: ${sub.cancelAtPeriodEnd}`);
      console.log("");
    });
  }

  // Also check payments
  const payments = await prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  console.log(`\n💳 Recent Payments (last 5):\n`);
  if (payments.length === 0) {
    console.log("❌ No payment records found");
  } else {
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. User ID: ${payment.userId}`);
      console.log(`   Amount: $${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Stripe Payment ID: ${payment.stripePaymentId}`);
      console.log(`   Date: ${payment.createdAt.toLocaleDateString()}`);
      console.log("");
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
