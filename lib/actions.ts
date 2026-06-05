"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAppContext, requireRole } from "@/lib/app-data";
import type { DimensieKey } from "@/lib/model";
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

function dimensieValue(formData: FormData): DimensieKey {
  return stringValue(formData, "dimensie") as DimensieKey;
}

export async function saveDagboekNotitie(formData: FormData) {
  const { profile, huidigeWeek } = await requireRole("deelnemer");
  const tekst = stringValue(formData, "tekst");
  const dimensie = dimensieValue(formData);
  const week = numberValue(formData, "week", huidigeWeek);

  if (!tekst || !dimensie) return;

  const supabase = createClient();
  await supabase.from("dagboek").insert({
    gebruiker_id: profile.id,
    week,
    dimensie,
    tekst
  });

  revalidatePath("/dagboek");
  revalidatePath("/traject");
}

export async function createGroepsruimtePost(formData: FormData) {
  const { profile, huidigeWeek } = await requireRole("deelnemer");
  if (!profile.cohort_id) return;

  const tekst = stringValue(formData, "tekst");
  const dimensie = dimensieValue(formData);
  const week = numberValue(formData, "week", huidigeWeek);
  if (!tekst) return;

  const supabase = createClient();
  await supabase.from("groepsruimte").insert({
    cohort_id: profile.cohort_id,
    week,
    tekst,
    dimensie
  });

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
    await supabase.from("reacties").delete().eq("id", existing.id);
  } else {
    await supabase.from("reacties").insert({
      post_id: postId,
      gebruiker_id: profile.id
    });
  }

  revalidatePath("/groep");
}

export async function updateReminder(formData: FormData) {
  const { profile } = await requireRole("deelnemer");
  const reminder = stringValue(formData, "reminder") as ReminderKey;
  const actief = formData.get("actief") === "on";
  if (!reminder) return;

  const supabase = createClient();
  await supabase.from("reminder_voorkeuren").upsert(
    {
      gebruiker_id: profile.id,
      reminder,
      actief
    },
    { onConflict: "gebruiker_id,reminder" }
  );

  revalidatePath("/reminders");
}

export async function saveZelfscan(formData: FormData) {
  const { profile } = await requireRole("deelnemer");
  const moment = stringValue(formData, "moment") as ZelfscanMoment;
  const toelichting = stringValue(formData, "toelichting");

  const supabase = createClient();
  await supabase.from("zelfscan").upsert(
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

  revalidatePath("/zelfscan");
}

export async function saveWeekthema(formData: FormData) {
  const { profile, huidigeWeek } = await requireRole("begeleider");
  const cohortId = stringValue(formData, "cohort_id") || profile.cohort_id;
  const thema = stringValue(formData, "thema");
  const vraag = stringValue(formData, "vraag");
  const week = numberValue(formData, "week", huidigeWeek);
  if (!cohortId || !thema || !vraag) return;

  const supabase = createClient();
  await supabase.from("weekthemas").upsert(
    {
      cohort_id: cohortId,
      week,
      thema,
      vraag
    },
    { onConflict: "cohort_id,week" }
  );

  revalidatePath("/begeleider/groep");
  revalidatePath("/groep");
}

export async function updateGroepsruimteModeratie(formData: FormData) {
  await requireRole("begeleider");
  const postId = stringValue(formData, "post_id");
  const veld = stringValue(formData, "veld");
  const waarde = formData.get("waarde") === "true";
  if (!postId || !["verborgen", "gespreksstarter"].includes(veld)) return;

  const supabase = createClient();
  const update =
    veld === "verborgen"
      ? { verborgen: waarde }
      : { gespreksstarter: waarde };
  await supabase.from("groepsruimte").update(update).eq("id", postId);

  revalidatePath("/begeleider/groep");
  revalidatePath("/groep");
}

export async function redirectToClaude(formData: FormData) {
  const tekst = stringValue(formData, "tekst");
  const dimensie = stringValue(formData, "dimensie");
  const prompt = [
    "Ik volg een leergang Moreel Vakmanschap.",
    "Help mij reflecteren op deze dagboeknotitie zonder oordeel en zonder advies te forceren.",
    dimensie ? `Dimensie: ${dimensie}` : "",
    "",
    tekst
  ].join("\n");

  redirect(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`);
}
