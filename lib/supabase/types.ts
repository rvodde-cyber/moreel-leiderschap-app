import type { DimensieKey } from "@/lib/model";

export type Rol = "deelnemer" | "begeleider";
export type ZelfscanMoment = "begin" | "einde";

export type Profile = {
  id: string;
  naam: string | null;
  rol: Rol;
  cohort_id: string | null;
  aangemaakt_op: string;
};

export type Cohort = {
  id: string;
  naam: string | null;
  startdatum: string | null;
  begeleider_id: string | null;
};

export type DagboekNotitie = {
  id: string;
  gebruiker_id: string;
  week: number;
  dimensie: DimensieKey;
  tekst: string;
  aangemaakt_op: string;
};

export type GroepsruimtePost = {
  id: string;
  cohort_id: string;
  week: number;
  tekst: string;
  dimensie: DimensieKey | null;
  verborgen: boolean;
  gespreksstarter: boolean;
  aangemaakt_op: string;
};

export type Reactie = {
  id: string;
  post_id: string;
  gebruiker_id: string;
};

export type Weekthema = {
  id: string;
  cohort_id: string;
  week: number;
  thema: string;
  vraag: string;
  aangemaakt_op: string;
};

export type Zelfscan = {
  id: string;
  gebruiker_id: string;
  moment: ZelfscanMoment;
  waarnemen: number;
  buik: number;
  hart: number;
  handen: number;
  ruggegraat: number;
  toelichting: string | null;
  aangemaakt_op: string;
};

export type ReminderKey =
  | "dinsdag_avond"
  | "donderdag_ochtend"
  | "zondag_voor_bijeenkomst"
  | "dag_na_bijeenkomst";

export type ReminderVoorkeur = {
  id: string;
  gebruiker_id: string;
  reminder: ReminderKey;
  actief: boolean;
  bijgewerkt_op: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "rol">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      cohorten: {
        Row: Cohort;
        Insert: Partial<Cohort>;
        Update: Partial<Cohort>;
        Relationships: [];
      };
      dagboek: {
        Row: DagboekNotitie;
        Insert: Pick<DagboekNotitie, "gebruiker_id" | "week" | "dimensie" | "tekst">;
        Update: Partial<Pick<DagboekNotitie, "week" | "dimensie" | "tekst">>;
        Relationships: [];
      };
      groepsruimte: {
        Row: GroepsruimtePost;
        Insert: Pick<GroepsruimtePost, "cohort_id" | "week" | "tekst"> &
          Partial<Pick<GroepsruimtePost, "dimensie" | "verborgen" | "gespreksstarter">>;
        Update: Partial<
          Pick<GroepsruimtePost, "week" | "tekst" | "dimensie" | "verborgen" | "gespreksstarter">
        >;
        Relationships: [];
      };
      reacties: {
        Row: Reactie;
        Insert: Pick<Reactie, "post_id" | "gebruiker_id">;
        Update: never;
        Relationships: [];
      };
      weekthemas: {
        Row: Weekthema;
        Insert: Pick<Weekthema, "cohort_id" | "week" | "thema" | "vraag">;
        Update: Partial<Pick<Weekthema, "week" | "thema" | "vraag">>;
        Relationships: [];
      };
      zelfscan: {
        Row: Zelfscan;
        Insert: Pick<
          Zelfscan,
          | "gebruiker_id"
          | "moment"
          | "waarnemen"
          | "buik"
          | "hart"
          | "handen"
          | "ruggegraat"
        > &
          Partial<Pick<Zelfscan, "toelichting">>;
        Update: Partial<Omit<Zelfscan, "id" | "gebruiker_id" | "aangemaakt_op">>;
        Relationships: [];
      };
      reminder_voorkeuren: {
        Row: ReminderVoorkeur;
        Insert: Pick<ReminderVoorkeur, "gebruiker_id" | "reminder"> &
          Partial<Pick<ReminderVoorkeur, "actief">>;
        Update: Partial<Pick<ReminderVoorkeur, "actief">>;
        Relationships: [];
      };
    };
    Views: {
      groepsruimte_overzicht: {
        Row: GroepsruimtePost & {
          herkenbaar_count: number;
          door_mij_herkend: boolean;
        };
        Relationships: [];
      };
      begeleider_zelfscan_aggregaat: {
        Row: {
          cohort_id: string;
          moment: ZelfscanMoment;
          waarnemen: number | null;
          buik: number | null;
          hart: number | null;
          handen: number | null;
          ruggegraat: number | null;
          aantal: number;
        };
        Relationships: [];
      };
      begeleider_week_aggregaat: {
        Row: {
          cohort_id: string;
          week: number;
          actieve_deelnemers: number;
          groepsruimte_posts: number;
          meest_gebruikte_dimensie: DimensieKey | null;
        };
        Relationships: [];
      };
      dagboek_dimensie_week_aggregaat: {
        Row: {
          cohort_id: string;
          week: number;
          dimensie: DimensieKey;
          aantal: number;
        };
        Relationships: [];
      };
      cohort_deelnemers_aantal: {
        Row: {
          cohort_id: string;
          aantal_deelnemers: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
