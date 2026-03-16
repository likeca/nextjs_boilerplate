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
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-32 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              \uD83D\uDE80 Production-ready SaaS boilerplate
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Launch your SaaS{" "}
                <span className="text-primary">faster than ever</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                {appConfig.description}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
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
