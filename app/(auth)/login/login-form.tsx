"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/button";
import { Input, Label } from "@/components/field";
import { createClient } from "@/lib/supabase/browser";
import type { SupabaseConfig } from "@/lib/supabase/config";

type LoginFormProps = {
  supabaseConfig: SupabaseConfig | null;
};

export function LoginForm({ supabaseConfig }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabaseConfigured = Boolean(supabaseConfig);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMelding(null);

    if (!supabaseConfigured) {
      setMelding("Inloggen is tijdelijk niet beschikbaar door ontbrekende configuratie.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient(supabaseConfig);
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback`
        }
      });

      setMelding(
        error
          ? "We konden de link niet versturen. Controleer je e-mailadres en probeer opnieuw."
          : "Bekijk je inbox. We hebben een veilige inloglink gestuurd."
      );
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="jouw@emailadres.nl"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !supabaseConfigured}>
        <Mail size={18} />
        {isPending ? "Link wordt verstuurd..." : "Stuur magic link"}
      </Button>
      {melding ? (
        <p className="border border-line bg-white/70 p-4 text-sm text-muted" role="status">
          {melding}
        </p>
      ) : null}
    </form>
  );
}
