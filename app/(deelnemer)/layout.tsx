import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/app-data";

export default async function DeelnemerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole("deelnemer");
  return <AppShell profile={profile}>{children}</AppShell>;
}
