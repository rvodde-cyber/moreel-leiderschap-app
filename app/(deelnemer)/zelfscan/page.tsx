import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { Textarea } from "@/components/field";
import { saveZelfscan } from "@/lib/actions";
import { getAppContext, requireRole } from "@/lib/app-data";
import { MOREEL_MODEL, ZELFSCAN_ANKERS } from "@/lib/model";
import { createClient } from "@/lib/supabase/server";
import type { Zelfscan } from "@/lib/supabase/types";

export default async function ZelfscanPage() {
  await requireRole("deelnemer");
  const { profile, huidigeWeek } = await getAppContext();
  const supabase = createClient();
  const moment = huidigeWeek >= 6 ? "einde" : "begin";

  const { data } = await supabase
    .from("zelfscan")
    .select("*")
    .eq("gebruiker_id", profile.id)
    .order("aangemaakt_op", { ascending: true });
  const scans = data ?? [];

  const beginScan = scans.find((scan) => scan.moment === "begin");
  const huidigeScan = scans.find((scan) => scan.moment === moment);
  const zichtbaar = huidigeWeek === 1 || huidigeWeek === 6 || huidigeWeek === 18;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader
          eyebrow={moment === "begin" ? "Begin traject" : "Spiegelmoment"}
          title="Zelfscan"
          description="Geen score of beoordeling. De sliders helpen je woorden te geven aan wat je nu herkent."
        />

        {!zichtbaar ? (
          <p className="mb-6 border border-line bg-white/60 p-4 text-muted">
            De zelfscan is bedoeld voor week 1, week 6 en week 18. Je kunt hem hier alvast
            bekijken als voorbereiding.
          </p>
        ) : null}

        <form action={saveZelfscan} className="space-y-7">
          <input type="hidden" name="moment" value={moment} />
          <fieldset disabled={!zichtbaar} className="space-y-7 disabled:opacity-70">
            {MOREEL_MODEL.map((dimensie) => {
              const waarde = huidigeScan?.[dimensie.key] ?? 3;
              const ankers = ZELFSCAN_ANKERS[dimensie.key];
              const inputId = `zelfscan-${dimensie.key}`;
              const anchorsId = `${inputId}-ankers`;

              return (
                <div key={dimensie.key} className="border border-line bg-white/65 p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <span className="text-2xl" aria-hidden>
                      {dimensie.icoon}
                    </span>
                    <div>
                      <label
                        htmlFor={inputId}
                        className="block font-display text-2xl"
                        style={{ color: dimensie.kleur }}
                      >
                        {dimensie.naam}
                      </label>
                      <p className="text-sm text-muted">{dimensie.kernvraag}</p>
                    </div>
                  </div>
                  <input
                    id={inputId}
                    type="range"
                    name={dimensie.key}
                    min="1"
                    max="5"
                    defaultValue={waarde}
                    aria-describedby={anchorsId}
                    className="w-full accent-[#534AB7]"
                  />
                  <div id={anchorsId} className="mt-3 grid grid-cols-2 gap-4 text-sm text-muted">
                    <span>1: {ankers.laag}</span>
                    <span className="text-right">5: {ankers.hoog}</span>
                  </div>
                </div>
              );
            })}

            <Textarea
              name="toelichting"
              defaultValue={huidigeScan?.toelichting ?? ""}
              placeholder="Optioneel: wat wil je onthouden bij deze scan?"
            />
            <Button type="submit" disabled={!zichtbaar}>
              Zelfscan opslaan
            </Button>
          </fieldset>
        </form>
      </Card>

      <Card>
        <CardHeader
          title={huidigeWeek >= 6 ? "Begin en nu" : "Je beginscan"}
          description="Alleen jij ziet je individuele scan. De begeleider ziet uitsluitend groepsgemiddelden."
        />
        {huidigeWeek >= 6 && beginScan ? (
          <div className="space-y-4">
            <ScanMirror title="Begin" scan={beginScan} />
            {huidigeScan ? <ScanMirror title="Nu" scan={huidigeScan} /> : null}
          </div>
        ) : beginScan ? (
          <ScanMirror title="Begin" scan={beginScan} />
        ) : (
          <p className="border border-line bg-white/50 p-4 text-muted">
            Er is nog geen beginscan opgeslagen.
          </p>
        )}
      </Card>
    </div>
  );
}

function ScanMirror({ title, scan }: { title: string; scan: Zelfscan }) {
  return (
    <div className="border border-line bg-white/65 p-4">
      <h3 className="mb-4 font-display text-xl">{title}</h3>
      <div className="space-y-3">
        {MOREEL_MODEL.map((dimensie) => (
          <div key={dimensie.key}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{dimensie.naam}</span>
              <span aria-label={`${scan[dimensie.key]} van 5`}>{scan[dimensie.key]}/5</span>
            </div>
            <div className="h-2 border border-line bg-white">
              <div
                className="h-full"
                style={{
                  width: `${(scan[dimensie.key] / 5) * 100}%`,
                  backgroundColor: dimensie.kleur
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
