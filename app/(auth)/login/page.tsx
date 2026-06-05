import { Card, CardHeader } from "@/components/card";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { APP_NAME, APP_SERIES, INSTITUTION_FOOTER } from "@/lib/brand";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Inloggen"
};

export default function LoginPage({
  searchParams
}: {
  searchParams?: { melding?: string };
}) {
  const profielMelding = searchParams?.melding === "profiel";
  const linkMelding = searchParams?.melding === "link";
  const supabaseConfig = getSupabaseConfig();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader
          eyebrow="Veilige toegang"
          title={`Welkom bij ${APP_NAME}`}
          description="Log in met een eenmalige link. We gebruiken geen wachtwoorden en tonen nooit auteurs in de groepsruimte."
        />
        <p className="-mt-4 mb-6 text-xs uppercase tracking-[0.18em] text-accent">{APP_SERIES}</p>
        {profielMelding ? (
          <p className="mb-5 border border-[#C45E3E]/30 bg-[#C45E3E]/5 p-4 text-sm text-[#8a3e29]">
            Je account is bekend, maar er is nog geen profiel gekoppeld. Vraag je begeleider om
            je aan een cohort toe te voegen.
          </p>
        ) : null}
        {linkMelding ? (
          <p className="mb-5 border border-[#C45E3E]/30 bg-[#C45E3E]/5 p-4 text-sm text-[#8a3e29]">
            Deze inloglink is verlopen of ongeldig. Vraag hieronder een nieuwe link aan.
          </p>
        ) : null}
        <LoginForm supabaseConfig={supabaseConfig} />
        <p className="mt-8 border-t border-line pt-4 text-sm text-muted">{INSTITUTION_FOOTER}</p>
      </Card>
    </main>
  );
}
