import { Card, CardHeader } from "@/components/card";
import { getAppContext, requireRole } from "@/lib/app-data";
import { DIMENSIE_BY_KEY, MOREEL_MODEL, isDimensieKey, type DimensieKey } from "@/lib/model";
import { createClient } from "@/lib/supabase/server";

export default async function BegeleiderVoortgangPage() {
  await requireRole("begeleider");
  const { profile, cohort } = await getAppContext();
  const supabase = createClient();
  const cohortId = profile.cohort_id ?? cohort?.id;

  const { data: scanData } = cohortId
    ? await supabase
        .from("begeleider_zelfscan_aggregaat")
        .select("*")
        .eq("cohort_id", cohortId)
    : { data: [] };
  const scanAggregaat = scanData ?? [];

  const { data: aandachtData } = cohortId
    ? await supabase
        .from("dagboek_dimensie_week_aggregaat")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("week", { ascending: true })
    : { data: [] };
  const dagboekAandacht = aandachtData ?? [];

  const begin = scanAggregaat.find((item) => item.moment === "begin");
  const einde = scanAggregaat.find((item) => item.moment === "einde");
  const maxAandacht = Math.max(1, ...dagboekAandacht.map((item) => item.aantal));

  return (
    <div className="space-y-8">
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Voortgang
        </p>
        <h1 className="font-display text-4xl md:text-6xl">Groepsinzicht met privacy als grens.</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Deze pagina toont patronen op cohortniveau. Individuele scans en dagboeken zijn hier niet
          beschikbaar.
        </p>
      </section>

      <Card>
        <CardHeader
          title="Zelfscan: begin naast einde"
          description="Gemiddelden per dimensie. Geen verschilscore, alleen visuele vergelijking."
        />
        <div className="grid gap-5 md:grid-cols-2">
          <ScanColumn title="Begin" aggregaat={begin} />
          <ScanColumn title="Einde" aggregaat={einde} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Dagboekaandacht per week"
          description="Welke dimensies krijgen aandacht in het schrijven van de groep?"
        />
        <div className="space-y-4">
          {dagboekAandacht.length === 0 ? (
            <p className="border border-line bg-white/50 p-4 text-muted">
              Er is nog geen geaggregeerde dagboekdata.
            </p>
          ) : (
            dagboekAandacht.map((item) => {
              if (!isDimensieKey(item.dimensie)) return null;

              const dimensie = DIMENSIE_BY_KEY[item.dimensie];

              return (
                <div
                  key={`${item.week}-${item.dimensie}`}
                  className="grid gap-3 border border-line bg-white/65 p-4 md:grid-cols-[7rem_10rem_1fr_4rem]"
                >
                  <span className="text-sm font-semibold text-muted">Week {item.week}</span>
                  <span style={{ color: dimensie.kleur }}>
                    {dimensie.icoon} {dimensie.naam}
                  </span>
                  <div className="h-3 self-center border border-line bg-white">
                    <div
                      className="h-full"
                      style={{
                        width: `${(item.aantal / maxAandacht) * 100}%`,
                        backgroundColor: dimensie.kleur
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted">{item.aantal}</span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

function ScanColumn({
  title,
  aggregaat
}: {
  title: string;
  aggregaat?: {
    aantal: number;
    waarnemen: number | null;
    buik: number | null;
    hart: number | null;
    handen: number | null;
    ruggegraat: number | null;
  };
}) {
  return (
    <div className="border border-line bg-white/65 p-5">
      <h3 className="mb-2 font-display text-2xl">{title}</h3>
      <p className="mb-5 text-sm text-muted">Aantal ingevuld: {aggregaat?.aantal ?? 0}</p>
      <div className="space-y-4">
        {MOREEL_MODEL.map((dimensie) => {
          const value = aggregaat?.[dimensie.key as DimensieKey] ?? 0;

          return (
            <div key={dimensie.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{dimensie.naam}</span>
                <span>{value ? value.toFixed(1) : "—"}</span>
              </div>
              <div className="h-2 border border-line bg-white">
                <div
                  className="h-full"
                  style={{
                    width: `${(value / 5) * 100}%`,
                    backgroundColor: dimensie.kleur
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
