import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { Button, buttonVariants } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { Input, Label } from "@/components/field";
import { APP_NAME, APP_SERIES, INSTITUTION_FOOTER } from "@/lib/brand";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Eerste setup"
};

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isMissingRpcError(error: { code?: string; message: string }) {
  return error.code === "PGRST202" || error.message.toLowerCase().includes("could not find the function");
}

function setupErrorUrl(message: string) {
  return `/setup?melding=${encodeURIComponent(message)}`;
}

async function bootstrapWithServiceRole({
  cohortNaam,
  begeleiderNaam
}: {
  cohortNaam: string;
  begeleiderNaam: string | null;
}) {
  const supabaseConfig = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseConfig || !serviceRoleKey) {
    throw new Error(
      "De databasefunctie ontbreekt nog. Voer de Supabase migration uit of voeg tijdelijk SUPABASE_SERVICE_ROLE_KEY toe aan Vercel."
    );
  }

  const sessionClient = createClient();
  const {
    data: { user },
    error: userError
  } = await sessionClient.auth.getUser();

  if (userError || !user) {
    throw new Error("Je moet ingelogd zijn om de setup uit te voeren.");
  }

  const admin = createSupabaseAdminClient<Database>(supabaseConfig.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const { count: otherProfileCount, error: countError } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .neq("id", user.id);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((otherProfileCount ?? 0) > 0) {
    throw new Error("Setup is alleen beschikbaar voor de eerste gebruiker.");
  }

  const fallbackName =
    begeleiderNaam ||
    (typeof user.user_metadata?.naam === "string" ? user.user_metadata.naam : null) ||
    user.email?.split("@")[0] ||
    "Begeleider";
  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id,
    naam: fallbackName,
    rol: "begeleider",
    cohort_id: null
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: existingCohort, error: existingCohortError } = await admin
    .from("cohorten")
    .select("id")
    .eq("begeleider_id", user.id)
    .order("startdatum", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (existingCohortError) {
    throw new Error(existingCohortError.message);
  }

  const cohortId = existingCohort?.id;

  if (cohortId) {
    const { error } = await admin.from("cohorten").update({ naam: cohortNaam }).eq("id", cohortId);
    if (error) throw new Error(error.message);
  } else {
    const { data: newCohort, error } = await admin
      .from("cohorten")
      .insert({
        naam: cohortNaam,
        startdatum: new Date().toISOString().slice(0, 10),
        begeleider_id: user.id
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    const { error: updateProfileError } = await admin
      .from("profiles")
      .update({ cohort_id: newCohort.id })
      .eq("id", user.id);

    if (updateProfileError) {
      throw new Error(updateProfileError.message);
    }

    return;
  }

  const { error: updateProfileError } = await admin
    .from("profiles")
    .update({ cohort_id: cohortId })
    .eq("id", user.id);

  if (updateProfileError) {
    throw new Error(updateProfileError.message);
  }
}

async function bootstrapFirstBegeleider(formData: FormData) {
  "use server";

  const supabase = createClient();
  const cohortNaam = stringValue(formData, "cohort_naam") || "Eerste cohort";
  const begeleiderNaam = stringValue(formData, "begeleider_naam") || null;
  const { error } = await supabase.rpc("bootstrap_first_begeleider", {
    p_cohort_naam: cohortNaam,
    p_begeleider_naam: begeleiderNaam
  });

  if (error) {
    if (!isMissingRpcError(error)) {
      redirect(setupErrorUrl(error.message));
    }

    try {
      await bootstrapWithServiceRole({ cohortNaam, begeleiderNaam });
    } catch (fallbackError) {
      redirect(
        setupErrorUrl(
          fallbackError instanceof Error ? fallbackError.message : "Setup fallback mislukt."
        )
      );
    }
  }

  redirect("/begeleider/dashboard");
}

export default async function SetupPage({
  searchParams
}: {
  searchParams?: { melding?: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-12">
        <Card className="w-full max-w-xl">
          <CardHeader
            eyebrow="Eerste setup"
            title="Log eerst in"
            description={`Gebruik je magic link en open daarna opnieuw /setup om ${APP_NAME} klaar te zetten.`}
          />
          <p className="-mt-4 mb-6 text-xs uppercase tracking-[0.18em] text-accent">{APP_SERIES}</p>
          <Link href="/login" className={buttonVariants({ variant: "primary" })}>
            Naar login
          </Link>
          <p className="mt-8 border-t border-line pt-4 text-sm text-muted">{INSTITUTION_FOOTER}</p>
        </Card>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.rol === "begeleider") {
    redirect("/begeleider/dashboard");
  }

  const defaultName =
    typeof user.user_metadata?.naam === "string"
      ? user.user_metadata.naam
      : user.email?.split("@")[0] ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader
          eyebrow="Eerste setup"
          title="Maak jezelf begeleider"
          description={`Deze tijdelijke setup werkt alleen zolang er nog geen andere profielen bestaan. Daarna wordt ${APP_NAME} automatisch geblokkeerd voor setup.`}
        />
        <p className="-mt-4 mb-6 text-xs uppercase tracking-[0.18em] text-accent">{APP_SERIES}</p>
        {searchParams?.melding ? (
          <p className="mb-5 border border-[#C45E3E]/30 bg-[#C45E3E]/5 p-4 text-sm text-[#8a3e29]">
            Setup mislukt: {searchParams.melding}
          </p>
        ) : null}
        <form action={bootstrapFirstBegeleider} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="begeleider_naam">Jouw naam</Label>
            <Input
              id="begeleider_naam"
              name="begeleider_naam"
              defaultValue={profile?.naam ?? defaultName}
              placeholder="Bijvoorbeeld: Robin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cohort_naam">Cohortnaam</Label>
            <Input
              id="cohort_naam"
              name="cohort_naam"
              defaultValue="Eerste cohort"
              placeholder="Bijvoorbeeld: Moreel Leiderschap 2026"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Maak begeleider en cohort aan
          </Button>
        </form>
        <p className="mt-8 border-t border-line pt-4 text-sm text-muted">{INSTITUTION_FOOTER}</p>
      </Card>
    </main>
  );
}
