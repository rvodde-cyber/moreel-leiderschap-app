import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Cohort, Profile } from "@/lib/supabase/types";
import { clampWeek } from "@/lib/utils";

export type AppContext = {
  profile: Profile;
  cohort: Cohort | null;
  huidigeWeek: number;
};

async function getAppContextImpl(): Promise<AppContext> {
  if (!isSupabaseConfigured()) {
    redirect("/login?melding=configuratie");
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Supabase auth user lookup failed.", { message: userError.message });
  }

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Supabase profile lookup failed.", { message: profileError.message });
  }

  if (!profile) {
    redirect("/login?melding=profiel");
  }

  const cohortQuery = profile.cohort_id
    ? supabase.from("cohorten").select("*").eq("id", profile.cohort_id).maybeSingle()
    : profile.rol === "begeleider"
      ? supabase.from("cohorten").select("*").eq("begeleider_id", profile.id).maybeSingle()
      : Promise.resolve({ data: null, error: null });
  const { data: cohort, error: cohortError } = await cohortQuery;

  if (cohortError) {
    console.error("Supabase cohort lookup failed.", { message: cohortError.message });
  }

  return {
    profile,
    cohort,
    huidigeWeek: calculateCurrentWeek(cohort?.startdatum)
  };
}

export const getAppContext = cache(getAppContextImpl);

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
