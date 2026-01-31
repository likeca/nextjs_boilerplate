import { requireAdmin } from "@/lib/auth-utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to "/" if user is not an admin
  // and to "/login" if not authenticated
  await requireAdmin();

  return <>{children}</>;
}
