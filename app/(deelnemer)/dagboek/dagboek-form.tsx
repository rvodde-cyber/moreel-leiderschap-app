"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/button";
import { Textarea } from "@/components/field";
import { MOREEL_MODEL, getDagboekPrompt, type DimensieKey } from "@/lib/model";
import { saveDagboekNotitie } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function DagboekForm({ week }: { week: number }) {
  const [dimensie, setDimensie] = useState<DimensieKey>("waarnemen");
  const [tekst, setTekst] = useState("");
  const prompt = useMemo(() => getDagboekPrompt(week, dimensie), [week, dimensie]);

  function openClaude() {
    const model = MOREEL_MODEL.find((item) => item.key === dimensie);
    const vraag = [
      "Ik volg een leergang Moreel Vakmanschap.",
      "Help mij reflecteren op deze dagboeknotitie zonder oordeel en zonder advies te forceren.",
      model ? `Dimensie: ${model.naam} — ${model.kernvraag}` : "",
      "",
      tekst || prompt
    ].join("\n");

    window.open(`https://claude.ai/new?q=${encodeURIComponent(vraag)}`, "_blank", "noopener");
  }

  return (
    <form action={saveDagboekNotitie} className="space-y-5">
      <input type="hidden" name="week" value={week} />
      <input type="hidden" name="dimensie" value={dimensie} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {MOREEL_MODEL.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => setDimensie(item.key)}
            className={cn(
              "border bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft",
              dimensie === item.key ? "shadow-soft" : "border-line"
            )}
            style={dimensie === item.key ? { borderColor: item.kleur } : undefined}
          >
            <span className="mb-2 block text-2xl" aria-hidden>
              {item.icoon}
            </span>
            <span className="block font-semibold text-ink">{item.naam}</span>
            <span className="mt-1 block text-sm text-muted">{item.kernvraag}</span>
          </button>
        ))}
      </div>

      <div className="border border-line bg-white/50 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          Prompt van deze week
        </p>
        <p className="mt-2 text-lg text-ink">{prompt}</p>
      </div>

      <Textarea
        name="tekst"
        value={tekst}
        onChange={(event) => setTekst(event.target.value)}
        placeholder="Schrijf vrij. Er is geen woordlimiet en geen teller."
        required
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit">
          <Save size={18} />
          Opslaan
        </Button>
        <Button type="button" variant="secondary" onClick={openClaude}>
          <ExternalLink size={18} />
          Bespreken
        </Button>
      </div>
    </form>
  );
}
