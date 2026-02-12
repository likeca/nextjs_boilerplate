import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/actions/payments/get-user-subscription";
import { isUserAdmin } from "@/lib/auth-utils";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default async function SubscriptionPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = await isUserAdmin(session?.user?.id);
  const { subscription } = await getUserSubscription();

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} isAdmin={isAdmin} />

      <div className="container max-w-4xl mx-auto flex-1 py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {subscription ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{subscription.plan.name}</CardTitle>
                  <CardDescription>
                    {subscription.plan.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    subscription.status === "active" ? "default" : "secondary"
                  }
                >
                  {subscription.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Amount
                  </p>
                  <p className="text-2xl font-bold">
                    ${(subscription.plan.amount / 100).toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{subscription.plan.interval}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Next billing date
                  </p>
                  <p className="text-lg font-semibold">
                    {format(
                      new Date(subscription.currentPeriodEnd),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Features included:</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">
                    Your subscription will be canceled on{" "}
                    {format(
                      new Date(subscription.currentPeriodEnd),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {!subscription.cancelAtPeriodEnd && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
                <CardDescription>
                  Update your billing information or cancel your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/">Change Plan</Link>
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don&apos;t have an active subscription yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      </div>

      <Footer />
    </div>
  );
}
