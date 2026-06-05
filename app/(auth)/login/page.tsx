import { Card, CardHeader } from "@/components/card";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { melding?: string };
}) {
  const profielMelding = searchParams?.melding === "profiel";
  const supabaseConfig = getSupabaseConfig();
  const supabaseConfigured = Boolean(supabaseConfig);
  const configuratieMelding = searchParams?.melding === "configuratie" || !supabaseConfigured;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader
          eyebrow="Veilige toegang"
          title="Welkom bij Moreel Vakmanschap"
          description="Log in met een eenmalige link. We gebruiken geen wachtwoorden en tonen nooit auteurs in de groepsruimte."
        />
        {profielMelding ? (
          <p className="mb-5 border border-[#C45E3E]/30 bg-[#C45E3E]/5 p-4 text-sm text-[#8a3e29]">
            Je account is bekend, maar er is nog geen profiel gekoppeld. Vraag je begeleider om
            je aan een cohort toe te voegen.
          </p>
        ) : null}
        {configuratieMelding ? (
          <p className="mb-5 border border-[#C45E3E]/30 bg-[#C45E3E]/5 p-4 text-sm text-[#8a3e29]">
            Inloggen is tijdelijk niet beschikbaar omdat de Supabase configuratie ontbreekt.
            Controleer de Vercel omgevingsvariabelen en probeer het daarna opnieuw.
          </p>
        ) : null}
        <LoginForm supabaseConfig={supabaseConfig} />
      </Card>
    </main>
  );
}
