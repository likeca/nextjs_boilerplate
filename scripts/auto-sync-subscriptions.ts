import "dotenv/config";
import { prisma } from "../lib/prisma";
import { stripe } from "../lib/payments/stripe/config";

async function main() {
  console.log("\n🔄 Auto-Syncing All Subscriptions from Stripe\n");

  // Get all users with Stripe Customer IDs
  const users = await prisma.user.findMany({
    where: {
      stripeCustomerId: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true,
    },
  });

  if (users.length === 0) {
    console.log("❌ No users with Stripe Customer IDs found");
    return;
  }

  console.log(`📋 Found ${users.length} user(s) with Stripe Customer IDs\n`);

  let syncedCount = 0;

  for (const user of users) {
    if (!user.stripeCustomerId) continue;

    try {
      console.log(`🔍 Checking ${user.name} (${user.email})...`);

      // Get subscriptions from Stripe
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });

      if (stripeSubscriptions.data.length === 0) {
        console.log(`   ℹ️  No subscriptions found in Stripe\n`);
        continue;
      }

      for (const stripeSub of stripeSubscriptions.data) {
        // Check if subscription already exists
        const existingSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSub.id },
        });

        if (existingSub) {
          console.log(`   ⚠️  Subscription already exists (${stripeSub.id})`);
          continue;
        }

        // Get the price ID
        const priceId = stripeSub.items.data[0]?.price.id;

        if (!priceId) {
          console.log(`   ❌ No price ID found for subscription ${stripeSub.id}`);
          continue;
        }

        // Find the plan
        const plan = await prisma.plan.findFirst({
          where: { stripePriceId: priceId },
        });

        if (!plan) {
          console.log(`   ❌ No plan found for Stripe Price ID: ${priceId}`);
          console.log(`   💡 Run 'npm run seed:plans' with correct Stripe IDs\n`);
          continue;
        }

        // Create subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: plan.id,
            stripeSubscriptionId: stripeSub.id,
            stripeCustomerId: stripeSub.customer as string,
            status: stripeSub.status,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });

        console.log(`   ✅ Synced: ${plan.name} (${plan.interval}) - ${stripeSub.status}`);
        console.log(`      Period: ${new Date(stripeSub.current_period_start * 1000).toLocaleDateString()} - ${new Date(stripeSub.current_period_end * 1000).toLocaleDateString()}\n`);
        syncedCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\n✅ Sync complete! Synced ${syncedCount} subscription(s)\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
