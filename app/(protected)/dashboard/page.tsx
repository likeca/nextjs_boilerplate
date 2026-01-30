import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <DashboardContent session={session!} />;
}
