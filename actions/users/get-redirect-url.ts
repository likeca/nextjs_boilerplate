"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Get the appropriate redirect URL based on user's admin status
 * @returns The URL to redirect to after login
 */
export async function getRedirectUrl(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return "/login";
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  // Redirect admins to dashboard, non-admins to profile
  return user?.isAdmin ? "/dashboard" : "/profile";
}
