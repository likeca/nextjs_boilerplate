import { getActivePlans } from "@/actions/payments/get-plans";
import { PricingCards } from "./pricing-cards";

interface PricingSectionProps {
  isLoggedIn: boolean;
}

export const PricingSection = async ({ isLoggedIn }: PricingSectionProps) => {
  const { plans } = await getActivePlans();

  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="w-full bg-muted/50 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Select the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mt-12">
          <PricingCards plans={plans} isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </section>
  );
};
