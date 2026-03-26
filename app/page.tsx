import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { appConfig } from "@/lib/config";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isUserAdmin } from "@/lib/auth-utils";
import { PricingSection } from "@/components/pricing-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = await isUserAdmin(session?.user?.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} isAdmin={isAdmin} />

      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 sm:py-32 text-center">
          <div className="mx-auto max-w-2xl space-y-6 animate-fade-in-up">
            <p className="text-sm font-medium text-muted-foreground tracking-wide">
              {"\uD83D\uDE80"} Production-ready SaaS boilerplate
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Launch your SaaS faster than ever
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {appConfig.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2 animate-fade-in-up delay-100">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <FeaturesSection />
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection isLoggedIn={!!session} />

        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
