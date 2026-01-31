import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { appConfig } from "@/lib/config";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/lib/auth-utils";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = await isUserAdmin(session?.user?.id);

  // if (session) {
  //   redirect("/dashboard");
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} isAdmin={isAdmin} />

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Welcome to {appConfig.name}
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              {appConfig.description}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
