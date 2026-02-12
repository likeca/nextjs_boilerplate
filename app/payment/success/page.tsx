import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { verifyCheckoutSession } from "@/actions/payments";
import { redirect } from "next/navigation";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  // Verify and create subscription if the session_id is provided
  if (sessionId) {
    const result = await verifyCheckoutSession(sessionId);
    
    if (result.error) {
      console.error("Failed to verify checkout session:", result.error);
      // Don't redirect on error, still show success message
      // The webhook might handle it, or the user can check billing page
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your subscription is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            You will receive a confirmation email shortly with your subscription details.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/billing">View Subscription</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
