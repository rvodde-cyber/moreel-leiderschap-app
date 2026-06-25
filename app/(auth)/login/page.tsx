import { Card, CardHeader } from "@/components/card";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { SUPABASE_UNAVAILABLE_MESSAGE, type SupabaseAvailability } from "@/lib/supabase/availability";
import { checkSupabaseAvailability } from "@/lib/supabase/status";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Inloggen"
};

function loginMelding(
  melding: string | undefined,
  supabaseAvailability: SupabaseAvailability | null
) {
  if (supabaseAvailability?.status === "unavailable" || melding === "supabase") {
    return SUPABASE_UNAVAILABLE_MESSAGE;
  }

  if (melding === "profiel") {
    return "Je account is bekend, maar er is nog geen profiel gekoppeld. Vraag je begeleider om je aan een cohort toe te voegen.";
  }

  if (melding === "link") {
    return "Deze inloglink is verlopen of ongeldig. Vraag hieronder een nieuwe link aan.";
  }

  if (melding === "configuratie") {
    return "Inloggen is tijdelijk niet beschikbaar door ontbrekende Supabase-configuratie.";
  }

  return null;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: { melding?: string };
}) {
  const supabaseConfig = getSupabaseConfig();
  const supabaseAvailability = supabaseConfig
    ? await checkSupabaseAvailability(supabaseConfig)
    : null;
  const melding = loginMelding(searchParams?.melding, supabaseAvailability);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader
          eyebrow="Veilige toegang"
          title="Welkom bij Moreel Vakmanschap"
          description="Log in met een eenmalige link. We gebruiken geen wachtwoorden en tonen nooit auteurs in de groepsruimte."
        />
        {melding ? (
          <p className="mb-5 border border-[#C45E3E]/30 bg-[#C45E3E]/5 p-4 text-sm text-[#8a3e29]">
            {melding}
          </p>
        ) : null}
        <LoginForm
          supabaseConfig={supabaseConfig}
          supabaseAvailability={supabaseAvailability}
        />
      </Card>
    </main>
  );
}
