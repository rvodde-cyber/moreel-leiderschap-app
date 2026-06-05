"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/app-data";
import type { DimensieKey } from "@/lib/model";
import { isDimensieKey } from "@/lib/model";
import { REMINDERS } from "@/lib/reminders";
import { createClient } from "@/lib/supabase/server";
import type { ReminderKey, ZelfscanMoment } from "@/lib/supabase/types";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(formData: FormData, key: string, fallback = 1) {
  const value = Number(stringValue(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function dimensieValue(formData: FormData): DimensieKey | null {
  const value = stringValue(formData, "dimensie");
  return isDimensieKey(value) ? value : null;
}

function assertMutation(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function saveDagboekNotitie(formData: FormData) {
  const { profile, huidigeWeek } = await requireRole("deelnemer");
  const tekst = stringValue(formData, "tekst");
  const dimensie = dimensieValue(formData);
  const week = numberValue(formData, "week", huidigeWeek);

  if (!tekst || !dimensie) return;

  const supabase = createClient();
  const { error } = await supabase.from("dagboek").insert({
    gebruiker_id: profile.id,
    week,
    dimensie,
    tekst
  });
  assertMutation(error);

  revalidatePath("/dagboek");
  revalidatePath("/traject");
}

export async function createGroepsruimtePost(formData: FormData) {
  const { profile, huidigeWeek } = await requireRole("deelnemer");
  if (!profile.cohort_id) return;

  const tekst = stringValue(formData, "tekst");
  const dimensie = dimensieValue(formData);
  const week = numberValue(formData, "week", huidigeWeek);
  if (!tekst || !dimensie) return;

  const supabase = createClient();
  const { error } = await supabase.from("groepsruimte").insert({
    cohort_id: profile.cohort_id,
    week,
    tekst,
    dimensie
  });
  assertMutation(error);

  revalidatePath("/groep");
  revalidatePath("/begeleider/dashboard");
}

export async function toggleHerkenbaar(formData: FormData) {
  const { profile } = await requireRole("deelnemer");
  const postId = stringValue(formData, "post_id");
  if (!postId) return;

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("reacties")
    .select("id")
    .eq("post_id", postId)
    .eq("gebruiker_id", profile.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("reacties").delete().eq("id", existing.id);
    assertMutation(error);
  } else {
    const { error } = await supabase.from("reacties").insert({
      post_id: postId,
      gebruiker_id: profile.id
    });
    assertMutation(error);
  }

  revalidatePath("/groep");
}

export async function updateReminder(formData: FormData) {
  const { profile } = await requireRole("deelnemer");
  const reminder = stringValue(formData, "reminder") as ReminderKey;
  const actief = formData.get("actief") === "on";
  if (!REMINDERS.some((item) => item.key === reminder)) return;

  const supabase = createClient();
  const { error } = await supabase.from("reminder_voorkeuren").upsert(
    {
      gebruiker_id: profile.id,
      reminder,
      actief
    },
    { onConflict: "gebruiker_id,reminder" }
  );
  assertMutation(error);

  revalidatePath("/reminders");
}

export async function saveZelfscan(formData: FormData) {
  const { profile } = await requireRole("deelnemer");
  const moment = stringValue(formData, "moment") as ZelfscanMoment;
  const toelichting = stringValue(formData, "toelichting");
  if (moment !== "begin" && moment !== "einde") return;

  const supabase = createClient();
  const { error } = await supabase.from("zelfscan").upsert(
    {
      gebruiker_id: profile.id,
      moment,
      waarnemen: numberValue(formData, "waarnemen", 3),
      buik: numberValue(formData, "buik", 3),
      hart: numberValue(formData, "hart", 3),
      handen: numberValue(formData, "handen", 3),
      ruggegraat: numberValue(formData, "ruggegraat", 3),
      toelichting: toelichting || null
    },
    { onConflict: "gebruiker_id,moment" }
  );
  assertMutation(error);

  revalidatePath("/zelfscan");
}

export async function saveWeekthema(formData: FormData) {
  const { profile, cohort, huidigeWeek } = await requireRole("begeleider");
  const cohortId = profile.cohort_id ?? cohort?.id;
  const thema = stringValue(formData, "thema");
  const vraag = stringValue(formData, "vraag");
  const week = numberValue(formData, "week", huidigeWeek);
  if (!cohortId || !thema || !vraag) return;

  const supabase = createClient();
  const { error } = await supabase.from("weekthemas").upsert(
    {
      cohort_id: cohortId,
      week,
      thema,
      vraag
    },
    { onConflict: "cohort_id,week" }
  );
  assertMutation(error);

  revalidatePath("/begeleider/groep");
  revalidatePath("/groep");
}

export async function updateGroepsruimteModeratie(formData: FormData) {
  const { profile, cohort } = await requireRole("begeleider");
  const cohortId = profile.cohort_id ?? cohort?.id;
  const postId = stringValue(formData, "post_id");
  const veld = stringValue(formData, "veld");
  const waarde = formData.get("waarde") === "true";
  if (!cohortId || !postId || !["verborgen", "gespreksstarter"].includes(veld)) return;

  const supabase = createClient();
  const update =
    veld === "verborgen"
      ? { verborgen: waarde }
      : { gespreksstarter: waarde };
  const { error } = await supabase
    .from("groepsruimte")
    .update(update)
    .eq("id", postId)
    .eq("cohort_id", cohortId);
  assertMutation(error);

  revalidatePath("/begeleider/groep");
  revalidatePath("/groep");
}
