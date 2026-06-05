import Link from "next/link";
import { ArrowRight, Check, Circle } from "lucide-react";
import { Card, CardHeader } from "@/components/card";
import { Button, buttonVariants } from "@/components/button";
import { getAppContext, requireRole } from "@/lib/app-data";
import { getDagboekPrompt } from "@/lib/model";
import { FASES, getWeekDescription } from "@/lib/traject";
import { cn } from "@/lib/utils";

export default async function TrajectPage() {
  await requireRole("deelnemer");
  const { huidigeWeek, cohort } = await getAppContext();
  const weekInfo = getWeekDescription(huidigeWeek);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Trajectoverzicht
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-6xl">
            Van bewustzijn naar moedige praktijk.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Vier maanden oefenen met aandacht, taal en handelen. Geen scores, wel een rustige plek
            om te schrijven en anoniem te delen.
          </p>
        </div>
        <Card>
          <CardHeader
            eyebrow={`Week ${huidigeWeek}`}
            title="Deze week"
            description={cohort?.naam ?? "Je cohort wordt geladen zodra je profiel compleet is."}
          />
          <h3 className="mb-3 font-display text-2xl">{weekInfo.titel}</h3>
          <p className="mb-4 text-muted">{getDagboekPrompt(huidigeWeek)}</p>
          <p className="border-l-2 border-accent pl-4 text-sm text-muted">
            Microgewoonte: {weekInfo.microgewoonte}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dagboek" className={buttonVariants({ variant: "primary" })}>
              Naar dagboek
              <ArrowRight size={16} />
            </Link>
            <Link href="/groep" className={buttonVariants({ variant: "secondary" })}>
              Groepsruimte
            </Link>
          </div>
        </Card>
      </section>

      <div className="space-y-6">
        {FASES.map((fase) => (
          <Card key={fase.naam}>
            <CardHeader title={fase.naam} description={fase.omschrijving} />
            <ol className="grid gap-3">
              {fase.weken.map((week) => {
                const status =
                  week.week < huidigeWeek ? "afgerond" : week.week === huidigeWeek ? "nu" : "later";
                const gewoonte = getWeekDescription(week.week).microgewoonte;

                return (
                  <li
                    key={week.week}
                    className={cn(
                      "grid gap-4 border p-4 transition md:grid-cols-[7rem_1fr]",
                      status === "nu"
                        ? "border-accent bg-accent/5"
                        : status === "afgerond"
                          ? "border-line bg-white/60"
                          : "border-line bg-white/35"
                    )}
                  >
                    <div className="flex items-center gap-3 text-sm font-semibold text-muted">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center border",
                          status === "afgerond"
                            ? "border-accent bg-accent text-white"
                            : "border-line bg-white"
                        )}
                      >
                        {status === "afgerond" ? <Check size={15} /> : <Circle size={12} />}
                      </span>
                      Week {week.week}
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-ink">{week.titel}</h3>
                      <p className="mt-1 text-sm text-muted">{gewoonte}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        ))}
      </div>
    </div>
  );
}
