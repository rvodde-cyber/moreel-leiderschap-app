import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { Input, Label } from "@/components/field";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Eerste setup"
};

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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
    redirect(`/setup?melding=${encodeURIComponent(error.message)}`);
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
            description="Gebruik je magic link en open daarna opnieuw /setup om de eerste begeleider en het eerste cohort aan te maken."
          />
          <Link href="/login" className={buttonVariants({ variant: "primary" })}>
            Naar login
          </Link>
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
          description="Deze tijdelijke setup werkt alleen zolang er nog geen andere profielen bestaan. Daarna wordt de route automatisch geblokkeerd door de database."
        />
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
              placeholder="Bijvoorbeeld: Moreel Vakmanschap 2026"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Maak begeleider en cohort aan
          </Button>
        </form>
      </Card>
    </main>
  );
}
