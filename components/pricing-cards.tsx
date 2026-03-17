"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/actions/payments/create-checkout-session";
import { toast } from "sonner";

type PricingInterval = "monthly" | "yearly";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  interval: string;
  features: string[];
  isPopular: boolean;
  stripePriceId: string;
}

interface PricingCardsProps {
  plans: Plan[];
  isLoggedIn: boolean;
}

export const PricingCards = ({ plans, isLoggedIn }: PricingCardsProps) => {
  const [interval, setInterval] = useState<PricingInterval>("monthly");
  const [isPending, startTransition] = useTransition();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const filteredPlans = plans.filter(
    (plan) => plan.interval === (interval === "monthly" ? "month" : "year")
  );

  const handleBuyNow = (planId: string) => {
    if (!isLoggedIn) {
      toast.error("Please login to purchase a plan");
      window.location.href = "/login";
      return;
    }

    // Check if using placeholder Stripe IDs
    const plan = filteredPlans.find(p => p.id === planId);
    if (plan?.stripePriceId.startsWith("price_") && !plan.stripePriceId.includes("_1")) {
      toast.error("Payment system is being configured. Please try again later.");
      console.error("Placeholder Stripe Price ID detected:", plan.stripePriceId);
      return;
    }

    setLoadingPlanId(planId);
    startTransition(async () => {
      const result = await createCheckoutSession(planId);
      
      if (result.error) {
        toast.error(result.error);
        setLoadingPlanId(null);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  };

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="space-y-8">
      {/* Interval Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={interval === "monthly" ? "default" : "outline"}
          onClick={() => setInterval("monthly")}
          className="min-w-30"
        >
          Monthly
        </Button>
        <Button
          variant={interval === "yearly" ? "default" : "outline"}
          onClick={() => setInterval("yearly")}
          className="min-w-30"
        >
          Yearly
          <Badge variant="secondary" className="ml-2">
            Save 17%
          </Badge>
        </Button>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col ${
              plan.isPopular ? "border-primary shadow-lg" : ""
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <Badge className="px-4 py-1">Most Popular</Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-6">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    ${formatPrice(plan.amount)}
                  </span>
                  <span className="text-muted-foreground">
                    /{interval === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                variant={plan.isPopular ? "default" : "outline"}
                onClick={() => handleBuyNow(plan.id)}
                disabled={isPending && loadingPlanId === plan.id}
              >
                {isPending && loadingPlanId === plan.id
                  ? "Loading..."
                  : "Buy Now"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
