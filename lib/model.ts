export type DimensieKey =
  | "waarnemen"
  | "buik"
  | "hart"
  | "handen"
  | "ruggegraat";

export type Microgewoonte = {
  week: string;
  dimensie: string;
  tekst: string;
};

export const MOREEL_MODEL: Array<{
  key: DimensieKey;
  naam: string;
  label: string;
  icoon: string;
  kleur: string;
  kernvraag: string;
}> = [
  {
    key: "waarnemen",
    naam: "Waarnemen",
    label: "Hoofd",
    icoon: "👁️",
    kleur: "#534AB7",
    kernvraag: "Wat gebeurt hier echt?"
  },
  {
    key: "buik",
    naam: "Wee gevoel",
    label: "Buik",
    icoon: "🫀",
    kleur: "#C45E3E",
    kernvraag: "Waar krijg ik morele buikpijn van?"
  },
  {
    key: "hart",
    naam: "Afwegen",
    label: "Hart",
    icoon: "❤️",
    kleur: "#C2436E",
    kernvraag: "Wat botst hier allemaal?"
  },
  {
    key: "handen",
    naam: "Handelen",
    label: "Handen",
    icoon: "🤝",
    kleur: "#1D9E75",
    kernvraag: "Wat doe ik als het spannend wordt?"
  },
  {
    key: "ruggegraat",
    naam: "Volhouden",
    label: "Ruggegraat",
    icoon: "🦴",
    kleur: "#BA7517",
    kernvraag: "Hoe houd ik koers als de druk toeneemt?"
  }
];

export const DIMENSIE_BY_KEY = Object.fromEntries(
  MOREEL_MODEL.map((dimensie) => [dimensie.key, dimensie])
) as Record<DimensieKey, (typeof MOREEL_MODEL)[number]>;

export function isDimensieKey(value: string | null | undefined): value is DimensieKey {
  return Boolean(value && value in DIMENSIE_BY_KEY);
}

export const MICROGEWOONTES: Microgewoonte[] = [
  {
    week: "1",
    dimensie: "Waarnemen",
    tekst: "Elke dag één moment benoemen waar iets je aandacht trok"
  },
  {
    week: "2",
    dimensie: "Waarnemen",
    tekst: "Het wee gevoel opschrijven vóór je het wegredeneert"
  },
  {
    week: "3",
    dimensie: "Afwegen",
    tekst: "Eén beslissing hardop redeneren — ook als niemand luistert"
  },
  {
    week: "4",
    dimensie: "Handelen",
    tekst: "Eén ding zeggen dat je normaal inslikte"
  },
  {
    week: "5",
    dimensie: "Volhouden",
    tekst: "Terugkijken: wat hield ik vol, wat niet — zonder oordeel"
  },
  {
    week: "6",
    dimensie: "Integratie",
    tekst: "Eigen patroon benoemen aan de hand van het dagboek"
  },
  {
    week: "7-16",
    dimensie: "Vrij",
    tekst: "Deelnemer kiest zelf — dagboekprompt biedt suggesties"
  }
];

export const DAGBOEK_PROMPTS: Record<number, string> = {
  1: "Wat merkte je deze week op — een situatie, gesprek of gevoel dat bleef hangen?",
  2: "Was er een moment waarop je iets voelde maar het wegschoof? Wat was dat gevoel?",
  3: "Beschrijf een situatie waarbij je iets moest afwegen. Wat botste er?",
  4: "Wat deed je toen het erop aankwam? Of wat deed je niet — en waarom?",
  5: "Wat hield je vol deze week? Wat kostte dat?",
  6: "Kijk terug op zes weken. Wat zie je nu wat je aan het begin nog niet zag?",
  18: "Drie maanden later: wat is er veranderd in hoe je kijkt, voelt en handelt?"
};

export const PRAKTIJK_PROMPT =
  "Wat merkte je deze week op dat moreel iets van je vroeg?";

export const ZELFSCAN_ANKERS: Record<DimensieKey, { laag: string; hoog: string }> = {
  waarnemen: {
    laag: "Ik merk zelden op dat er iets moreel speelt",
    hoog: "Ik herken morele situaties snel en scherp"
  },
  buik: {
    laag: "Ik schuif mijn morele ongemak meestal weg",
    hoog: "Ik neem mijn wee gevoel serieus voordat ik ga verklaren"
  },
  hart: {
    laag: "Ik zie vooral één belang of perspectief",
    hoog: "Ik kan botsende waarden rustig naast elkaar houden"
  },
  handen: {
    laag: "Ik wacht vaak tot iemand anders iets doet",
    hoog: "Ik handel zorgvuldig, ook als het spannend wordt"
  },
  ruggegraat: {
    laag: "Ik verlies koers wanneer de druk oploopt",
    hoog: "Ik blijf trouw aan mijn morele kompas onder druk"
  }
};

export function getDagboekPrompt(week: number, dimensie?: DimensieKey) {
  const basisPrompt =
    DAGBOEK_PROMPTS[week] ?? (week >= 7 && week <= 16 ? PRAKTIJK_PROMPT : DAGBOEK_PROMPTS[1]);
  if (!dimensie) return basisPrompt;

  const model = DIMENSIE_BY_KEY[dimensie];
  return `${basisPrompt} ${model.kernvraag}`;
}

export function getMicrogewoonteForWeek(week: number) {
  if (week >= 7 && week <= 16) {
    return MICROGEWOONTES.find((item) => item.week === "7-16")!;
  }

  return MICROGEWOONTES.find((item) => item.week === String(week));
}
