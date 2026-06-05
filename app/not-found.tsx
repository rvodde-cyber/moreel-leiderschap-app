import Link from "next/link";
import { buttonVariants } from "@/components/button";
import { INSTITUTION_FOOTER } from "@/lib/brand";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-xl border border-line bg-white/80 p-8 shadow-soft">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Niet gevonden
        </p>
        <h1 className="font-display text-4xl text-ink">Deze pagina bestaat niet.</h1>
        <p className="mt-4 text-muted">
          Controleer de link of ga terug naar de start van de leeromgeving.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Naar start
        </Link>
        <p className="mt-8 border-t border-line pt-4 text-sm text-muted">{INSTITUTION_FOOTER}</p>
      </section>
    </main>
  );
}
