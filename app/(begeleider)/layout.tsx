import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/app-data";

export default async function BegeleiderLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole("begeleider");
  return <AppShell profile={profile}>{children}</AppShell>;
}
