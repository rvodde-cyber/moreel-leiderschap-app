import type { ReminderKey } from "@/lib/supabase/types";

export const REMINDERS: Array<{
  key: ReminderKey;
  moment: string;
  bericht: string;
}> = [
  {
    key: "dinsdag_avond",
    moment: "Dinsdag 19:00",
    bericht: "Schrijf 5 minuten in je dagboek. Wat merkte je deze week op?"
  },
  {
    key: "donderdag_ochtend",
    moment: "Donderdag 08:30",
    bericht: "Was er gisteren een moment waarop je iets voelde maar niet uitsprak?"
  },
  {
    key: "zondag_voor_bijeenkomst",
    moment: "Zondag voor bijeenkomst",
    bericht: "Groepsruimte: deel anoniem een situatie als voorbereiding."
  },
  {
    key: "dag_na_bijeenkomst",
    moment: "Dag na bijeenkomst",
    bericht: "Wat nam je mee uit gisteren? Schrijf één zin."
  }
];
