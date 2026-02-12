import "dotenv/config";
import { prisma } from "../lib/prisma";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log("\n🔧 Update Stripe Price IDs\n");
  console.log("Before running this, create products in your Stripe Dashboard:");
  console.log("https://dashboard.stripe.com/test/products\n");

  const plans = await prisma.plan.findMany({
    orderBy: [{ name: "asc" }, { interval: "asc" }],
  });

  for (const plan of plans) {
    console.log(`\n📦 ${plan.name} (${plan.interval}ly)`);
    console.log(`   Current Price ID: ${plan.stripePriceId}`);
    console.log(`   Current Product ID: ${plan.stripeProductId}`);

    const newPriceId = await question(
      `   Enter new Stripe Price ID (or press Enter to skip): `
    );

    if (newPriceId.trim()) {
      const newProductId = await question(
        `   Enter new Stripe Product ID (or press Enter to keep ${plan.stripeProductId}): `
      );

      await prisma.plan.update({
        where: { id: plan.id },
        data: {
          stripePriceId: newPriceId.trim(),
          ...(newProductId.trim() && { stripeProductId: newProductId.trim() }),
        },
      });

      console.log(`   ✓ Updated!`);
    }
  }

  console.log("\n✅ Done!\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
