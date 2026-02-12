import "dotenv/config";
import { prisma } from "../lib/prisma";
import { stripe } from "../lib/payments/stripe/config";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("\n🔄 Stripe Subscription Sync Tool\n");
  console.log("This tool will sync subscriptions from Stripe to your database.\n");

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true,
    },
  });

  if (users.length === 0) {
    console.log("❌ No users found in database");
    rl.close();
    return;
  }

  console.log("📋 Users in database:\n");
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Stripe Customer ID: ${user.stripeCustomerId || "None"}\n`);
  });

  const userIndex = await question("Enter user number to sync (or 'all' for all users): ");

  let usersToSync = [];
  if (userIndex.toLowerCase() === "all") {
    usersToSync = users.filter((u) => u.stripeCustomerId);
  } else {
    const index = parseInt(userIndex) - 1;
    if (index >= 0 && index < users.length && users[index].stripeCustomerId) {
      usersToSync = [users[index]];
    } else {
      console.log("❌ Invalid selection or user has no Stripe Customer ID");
      rl.close();
      return;
    }
  }

  console.log(`\n🔍 Syncing ${usersToSync.length} user(s)...\n`);

  for (const user of usersToSync) {
    if (!user.stripeCustomerId) continue;

    try {
      console.log(`Checking Stripe for ${user.name}...`);

      // Get subscriptions from Stripe
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });

      if (stripeSubscriptions.data.length === 0) {
        console.log(`  ℹ️  No active subscriptions found in Stripe\n`);
        continue;
      }

      for (const stripeSub of stripeSubscriptions.data) {
        // Check if subscription already exists in database
        const existingSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: stripeSub.id },
        });

        if (existingSub) {
          console.log(`  ⚠️  Subscription ${stripeSub.id} already exists, skipping\n`);
          continue;
        }

        // Get the price ID from the subscription
        const priceId = stripeSub.items.data[0]?.price.id;

        // Find the plan in our database
        const plan = await prisma.plan.findFirst({
          where: { stripePriceId: priceId },
        });

        if (!plan) {
          console.log(`  ❌ Plan not found for price ID: ${priceId}`);
          console.log(`  ℹ️  Make sure you've seeded your plans with correct Stripe Price IDs\n`);
          continue;
        }

        // Create subscription in database
        const newSub = await prisma.subscription.create({
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

        console.log(`  ✅ Created subscription for ${plan.name} (${plan.interval})`);
        console.log(`     Status: ${stripeSub.status}`);
        console.log(`     Period: ${newSub.currentPeriodStart.toLocaleDateString()} - ${newSub.currentPeriodEnd.toLocaleDateString()}\n`);
      }
    } catch (error) {
      console.error(`  ❌ Error syncing ${user.name}:`, error);
    }
  }

  console.log("✅ Sync completed!\n");
  rl.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
