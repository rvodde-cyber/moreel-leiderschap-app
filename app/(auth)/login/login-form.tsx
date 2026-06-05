"use client";

import { useEffect, useState, useTransition } from "react";
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
  const [resolvedSupabaseConfig, setResolvedSupabaseConfig] = useState<SupabaseConfig | null>(
    supabaseConfig
  );
  const [isConfigLoading, setIsConfigLoading] = useState(!supabaseConfig);
  const [isPending, startTransition] = useTransition();
  const supabaseConfigured = Boolean(resolvedSupabaseConfig);

  useEffect(() => {
    if (supabaseConfig) {
      setResolvedSupabaseConfig(supabaseConfig);
      setIsConfigLoading(false);
      return;
    }

    let isActive = true;

    async function loadSupabaseConfig() {
      setIsConfigLoading(true);

      try {
        const response = await fetch("/api/supabase/config", {
          cache: "no-store"
        });
        const data = (await response.json().catch(() => null)) as SupabaseConfig | null;

        if (!isActive) return;

        if (response.ok && data?.url && data?.anonKey) {
          setResolvedSupabaseConfig(data);
          return;
        }

        setResolvedSupabaseConfig(null);
        setMelding("Inloggen is tijdelijk niet beschikbaar door ontbrekende configuratie.");
      } catch {
        if (!isActive) return;
        setResolvedSupabaseConfig(null);
        setMelding("We konden de inlogconfiguratie niet laden. Probeer het opnieuw.");
      } finally {
        if (isActive) {
          setIsConfigLoading(false);
        }
      }
    }

    loadSupabaseConfig();

    return () => {
      isActive = false;
    };
  }, [supabaseConfig]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMelding(null);

    if (!resolvedSupabaseConfig) {
      setMelding("Inloggen is tijdelijk niet beschikbaar door ontbrekende configuratie.");
      return;
    }

    const config = resolvedSupabaseConfig;

    startTransition(async () => {
      const supabase = createClient(config);
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
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isConfigLoading || !supabaseConfigured}
      >
        <Mail size={18} />
        {isConfigLoading
          ? "Configuratie laden..."
          : isPending
            ? "Link wordt verstuurd..."
            : "Stuur magic link"}
      </Button>
      {melding ? (
        <p className="border border-line bg-white/70 p-4 text-sm text-muted" role="status">
          {melding}
        </p>
      ) : null}
    </form>
  );
}
