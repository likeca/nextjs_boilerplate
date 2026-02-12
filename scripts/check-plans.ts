import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const plans = await prisma.plan.findMany({
    select: {
      id: true,
      name: true,
      interval: true,
      stripePriceId: true,
      stripeProductId: true,
      isActive: true,
    },
    orderBy: [
      { name: "asc" },
      { interval: "asc" },
    ],
  });

  console.log("\n📊 Current Plans in Database:\n");
  plans.forEach((plan) => {
    console.log(`${plan.name} (${plan.interval}):`);
    console.log(`  Price ID: ${plan.stripePriceId}`);
    console.log(`  Product ID: ${plan.stripeProductId}`);
    console.log(`  Active: ${plan.isActive}`);
    console.log("");
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
