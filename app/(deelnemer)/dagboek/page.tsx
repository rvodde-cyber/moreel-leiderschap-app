import Link from "next/link";
import { Card, CardHeader } from "@/components/card";
import { DimensieBadge } from "@/components/dimensie-badge";
import { DagboekForm } from "@/app/(deelnemer)/dagboek/dagboek-form";
import { getAppContext, requireRole } from "@/lib/app-data";
import { MOREEL_MODEL, type DimensieKey } from "@/lib/model";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function DagboekPage({
  searchParams
}: {
  searchParams?: { dimensie?: DimensieKey; vergelijk?: string };
}) {
  await requireRole("deelnemer");
  const { profile, huidigeWeek } = await getAppContext();
  const supabase = createClient();
  const filter = searchParams?.dimensie;

  let query = supabase
    .from("dagboek")
    .select("*")
    .eq("gebruiker_id", profile.id)
    .order("aangemaakt_op", { ascending: false });

  if (filter) query = query.eq("dimensie", filter);

  const { data } = await query;
  const notities = data ?? [];
  const toonVergelijking = searchParams?.vergelijk === "nu" && [6, 18].includes(huidigeWeek);
  const weekEen = notities.filter((notitie) => notitie.week === 1);
  const huidigeWeekNotities = notities.filter((notitie) => notitie.week === huidigeWeek);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader
          eyebrow={`Week ${huidigeWeek}`}
          title="Schrijven in je dagboek"
          description="Je dagboek is privé. Alleen jij kunt deze notities lezen en bewerken."
        />
        <DagboekForm week={huidigeWeek} />
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Terugkijken" description="Nieuwste notities staan bovenaan." />
          <div className="mb-5 flex flex-wrap gap-2">
            <Link
              href="/dagboek"
              className="border border-line bg-white/70 px-3 py-2 text-sm text-muted hover:text-ink"
            >
              Alles
            </Link>
            {MOREEL_MODEL.map((dimensie) => (
              <Link
                key={dimensie.key}
                href={`/dagboek?dimensie=${dimensie.key}`}
                className="border px-3 py-2 text-sm"
                style={{ borderColor: dimensie.kleur, color: dimensie.kleur }}
              >
                {dimensie.icoon} {dimensie.naam}
              </Link>
            ))}
          </div>

          {[6, 18].includes(huidigeWeek) ? (
            <Link
              href="/dagboek?vergelijk=nu"
              className="mb-5 inline-flex border border-accent px-4 py-2 text-sm font-semibold text-accent"
            >
              Vergelijk begin en nu
            </Link>
          ) : null}

          {toonVergelijking ? (
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <ComparisonColumn title="Week 1" notities={weekEen} />
              <ComparisonColumn title={`Week ${huidigeWeek}`} notities={huidigeWeekNotities} />
            </div>
          ) : null}

          <div className="space-y-4">
            {notities.length === 0 ? (
              <p className="border border-line bg-white/50 p-4 text-muted">
                Er zijn nog geen notities. Begin met een korte observatie van vijf minuten.
              </p>
            ) : (
              notities.map((notitie) => (
                <article key={notitie.id} className="border border-line bg-white/65 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <DimensieBadge dimensie={notitie.dimensie} />
                    <span className="text-sm text-muted">
                      Week {notitie.week} · {formatDate(notitie.aangemaakt_op)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-ink">{notitie.tekst}</p>
                </article>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ComparisonColumn({
  title,
  notities
}: {
  title: string;
  notities: Array<{ id: string; tekst: string; dimensie: DimensieKey }>;
}) {
  return (
    <div className="border border-line bg-white/55 p-4">
      <h3 className="mb-3 font-display text-xl">{title}</h3>
      <div className="space-y-3">
        {notities.length === 0 ? (
          <p className="text-sm text-muted">Geen notities gevonden.</p>
        ) : (
          notities.map((notitie) => (
            <div key={notitie.id} className="space-y-2 border border-line bg-white/70 p-3">
              <DimensieBadge dimensie={notitie.dimensie} />
              <p className="whitespace-pre-wrap text-sm">{notitie.tekst}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
