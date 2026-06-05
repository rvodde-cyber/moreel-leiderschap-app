"use client";

import { Button } from "@/components/button";
import { INSTITUTION_FOOTER } from "@/lib/brand";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-xl border border-line bg-white/80 p-8 shadow-soft">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Er ging iets mis
        </p>
        <h1 className="font-display text-4xl text-ink">We konden deze pagina niet laden.</h1>
        <p className="mt-4 text-muted">
          Probeer het opnieuw. Blijft dit gebeuren, log dan opnieuw in of neem contact op met je
          begeleider.
        </p>
        <Button type="button" className="mt-6" onClick={reset}>
          Opnieuw proberen
        </Button>
        <p className="mt-8 border-t border-line pt-4 text-sm text-muted">{INSTITUTION_FOOTER}</p>
      </section>
    </main>
  );
}
