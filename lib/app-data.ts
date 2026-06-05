import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Cohort, Profile } from "@/lib/supabase/types";
import { clampWeek } from "@/lib/utils";

export type AppContext = {
  profile: Profile;
  cohort: Cohort | null;
  huidigeWeek: number;
};

export async function getAppContext(): Promise<AppContext> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login?melding=profiel");

  const { data: cohort } = profile.cohort_id
    ? await supabase.from("cohorten").select("*").eq("id", profile.cohort_id).maybeSingle()
    : { data: null };

  return {
    profile,
    cohort,
    huidigeWeek: calculateCurrentWeek(cohort?.startdatum)
  };
}

export async function requireRole(role: Profile["rol"]) {
  const context = await getAppContext();
  if (context.profile.rol !== role) {
    redirect(context.profile.rol === "begeleider" ? "/begeleider/dashboard" : "/traject");
  }

  return context;
}

export function calculateCurrentWeek(startdatum?: string | null) {
  if (!startdatum) return 1;

  const start = new Date(`${startdatum}T00:00:00`);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
  return clampWeek(week);
}
