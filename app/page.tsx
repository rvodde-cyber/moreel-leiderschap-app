import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/app-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/demo");
  }

  const { profile } = await getAppContext();
  redirect(profile.rol === "begeleider" ? "/begeleider/dashboard" : "/traject");
}
