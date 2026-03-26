import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

interface VerifyEmailChangePageProps {
  searchParams: Promise<{ token?: string }>;
}

type VerificationResult =
  | { status: "success"; newEmail: string }
  | { status: "expired" }
  | { status: "invalid" };

const verifyToken = async (token: string): Promise<VerificationResult> => {
  const request = await prisma.emailChangeRequest.findUnique({
    where: { token },
  });

  if (!request) {
    return { status: "invalid" };
  }

  if (request.expiresAt < new Date()) {
    await prisma.emailChangeRequest.delete({ where: { id: request.id } });
    return { status: "expired" };
  }

  // Check new email isn't taken (could have been claimed since request was made)
  const existingUser = await prisma.user.findUnique({
    where: { email: request.newEmail },
  });

  if (existingUser && existingUser.id !== request.userId) {
    await prisma.emailChangeRequest.delete({ where: { id: request.id } });
    return { status: "invalid" };
  }

  // Update user email and mark as verified
  await prisma.user.update({
    where: { id: request.userId },
    data: {
      email: request.newEmail,
      emailVerified: true,
    },
  });

  // Delete the request
  await prisma.emailChangeRequest.delete({ where: { id: request.id } });

  return { status: "success", newEmail: request.newEmail };
};

export default async function VerifyEmailChangePage({
  searchParams,
}: VerifyEmailChangePageProps) {
  const { token } = await searchParams;

  let result: VerificationResult;

  if (!token) {
    result = { status: "invalid" };
  } else {
    result = await verifyToken(token);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        {result.status === "success" && (
          <>
            <CheckCircle2
              className="h-16 w-16 text-green-500"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Email Changed Successfully
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your email has been updated to{" "}
                <strong>{result.newEmail}</strong>. You can now sign in with
                your new email address.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/profile">Go to Profile</Link>
              </Button>
            </div>
          </>
        )}

        {result.status === "expired" && (
          <>
            <Clock className="h-16 w-16 text-amber-500" aria-hidden="true" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Link Expired
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                This verification link has expired. Please request a new email
                change from your profile settings.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/profile">Go to Profile</Link>
              </Button>
            </div>
          </>
        )}

        {result.status === "invalid" && (
          <>
            <XCircle
              className="h-16 w-16 text-destructive"
              aria-hidden="true"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Invalid Link
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                This verification link is invalid or has already been used.
                Please request a new email change from your profile settings.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
              <Button asChild>
                <Link href="/profile">Go to Profile</Link>
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
