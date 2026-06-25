"use client";

import { useEffect, useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/button";
import { Input, Label } from "@/components/field";
import { createClient } from "@/lib/supabase/browser";
import {
  SUPABASE_UNAVAILABLE_MESSAGE,
  isSupabaseUnavailableMessage,
  type SupabaseAvailability
} from "@/lib/supabase/availability";
import type { SupabaseConfig } from "@/lib/supabase/config";

type LoginFormProps = {
  supabaseConfig: SupabaseConfig | null;
  supabaseAvailability: SupabaseAvailability | null;
};

type SupabaseConfigResponse = (SupabaseConfig & { availability?: SupabaseAvailability }) | null;

export function LoginForm({ supabaseConfig, supabaseAvailability }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const [resolvedSupabaseConfig, setResolvedSupabaseConfig] = useState<SupabaseConfig | null>(
    supabaseConfig
  );
  const [resolvedAvailability, setResolvedAvailability] = useState<SupabaseAvailability | null>(
    supabaseAvailability
  );
  const [isConfigLoading, setIsConfigLoading] = useState(!supabaseConfig);
  const [isPending, startTransition] = useTransition();
  const supabaseConfigured = Boolean(resolvedSupabaseConfig);
  const supabaseAvailable = resolvedAvailability?.status !== "unavailable";
  const canSubmit = supabaseConfigured && supabaseAvailable;

  useEffect(() => {
    if (supabaseConfig) {
      setResolvedSupabaseConfig(supabaseConfig);
      setResolvedAvailability(supabaseAvailability);
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
        const data = (await response.json().catch(() => null)) as SupabaseConfigResponse;

        if (!isActive) return;

        if (data?.url && data?.anonKey) {
          setResolvedSupabaseConfig(data);
          setResolvedAvailability(data.availability ?? null);
          if (data.availability?.status === "unavailable") {
            setMelding(data.availability.message);
          }
          return;
        }

        setResolvedSupabaseConfig(null);
        setResolvedAvailability(null);
        setMelding(
          data?.availability?.message ??
            "Inloggen is tijdelijk niet beschikbaar door ontbrekende configuratie."
        );
      } catch {
        if (!isActive) return;
        setResolvedSupabaseConfig(null);
        setResolvedAvailability(null);
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
  }, [supabaseConfig, supabaseAvailability]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMelding(null);

    if (!resolvedSupabaseConfig) {
      setMelding("Inloggen is tijdelijk niet beschikbaar door ontbrekende configuratie.");
      return;
    }

    if (resolvedAvailability?.status === "unavailable") {
      setMelding(resolvedAvailability.message);
      return;
    }

    const config = resolvedSupabaseConfig;

    startTransition(async () => {
      try {
        const supabase = createClient(config);
        const origin = window.location.origin;
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${origin}/auth/callback`
          }
        });

        if (error) {
          setMelding(
            isSupabaseUnavailableMessage(error.message)
              ? SUPABASE_UNAVAILABLE_MESSAGE
              : "We konden de link niet versturen. Controleer je e-mailadres en probeer opnieuw."
          );
          return;
        }

        setMelding("Bekijk je inbox. We hebben een veilige inloglink gestuurd.");
      } catch {
        setMelding(SUPABASE_UNAVAILABLE_MESSAGE);
      }
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
        disabled={isPending || isConfigLoading || !canSubmit}
      >
        <Mail size={18} />
        {isConfigLoading
          ? "Configuratie laden..."
          : isPending
            ? "Link wordt verstuurd..."
            : !supabaseAvailable
              ? "Supabase niet beschikbaar"
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
