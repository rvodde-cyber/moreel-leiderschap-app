import { getMicrogewoonteForWeek } from "@/lib/model";

export type TrajectWeek = {
  week: number;
  titel: string;
  fase: "Leergang" | "Praktijk" | "Terugkomst";
};

export const TRAJECT_WEKEN: TrajectWeek[] = [
  { week: 1, titel: "Oriëntatie", fase: "Leergang" },
  { week: 2, titel: "Bijeenkomst 1 — Zien wat er speelt", fase: "Leergang" },
  { week: 3, titel: "Verdieping (wee gevoel + afwegen)", fase: "Leergang" },
  { week: 4, titel: "Bijeenkomst 2 — Wat doe je ermee", fase: "Leergang" },
  { week: 5, titel: "Toepassing (handelen + volhouden)", fase: "Leergang" },
  { week: 6, titel: "Bijeenkomst 3 — Koers houden", fase: "Leergang" },
  ...Array.from({ length: 10 }, (_, index) => ({
    week: index + 7,
    titel: "Zelfstandig oefenen in de praktijk",
    fase: "Praktijk" as const
  })),
  { week: 18, titel: "Bijeenkomst 4 — Terugkomst", fase: "Terugkomst" }
];

export const FASES = [
  {
    naam: "Fase 1 — Leergang",
    omschrijving: "Week 1-6: drie bijeenkomsten, oefenen met waarnemen, voelen, afwegen en handelen.",
    weken: TRAJECT_WEKEN.filter((week) => week.fase === "Leergang")
  },
  {
    naam: "Fase 2 — Praktijk",
    omschrijving: "Week 7-16: zelfstandig werken, dagboek en groepsruimte blijven beschikbaar.",
    weken: TRAJECT_WEKEN.filter((week) => week.fase === "Praktijk")
  },
  {
    naam: "Fase 3 — Terugkomst",
    omschrijving: "Week 18: samen terugkijken na drie maanden praktijk.",
    weken: TRAJECT_WEKEN.filter((week) => week.fase === "Terugkomst")
  }
];

export function getWeekDescription(week: number) {
  const item = TRAJECT_WEKEN.find((trajectWeek) => trajectWeek.week === week);
  const gewoonte = getMicrogewoonteForWeek(week);

  return {
    titel: item?.titel ?? "Praktijkweek",
    microgewoonte: gewoonte?.tekst ?? "Kies een kleine reflectiegewoonte die past bij deze week."
  };
}
