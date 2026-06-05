import { createClient } from "https://esm.sh/@supabase/supabase-js@2.107.0";

type ReminderKey =
  | "dinsdag_avond"
  | "donderdag_ochtend"
  | "zondag_voor_bijeenkomst"
  | "dag_na_bijeenkomst";

const reminders: Record<ReminderKey, string> = {
  dinsdag_avond: "Schrijf 5 minuten in je dagboek. Wat merkte je deze week op?",
  donderdag_ochtend: "Was er gisteren een moment waarop je iets voelde maar niet uitsprak?",
  zondag_voor_bijeenkomst: "Groepsruimte: deel anoniem een situatie als voorbereiding.",
  dag_na_bijeenkomst: "Wat nam je mee uit gisteren? Schrijf één zin."
};

Deno.serve(async (request) => {
  const authHeader = request.headers.get("authorization");
  const secret = Deno.env.get("REMINDERS_CRON_SECRET");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { reminder } = (await request.json().catch(() => ({}))) as {
    reminder?: ReminderKey;
  };
  if (!reminder || !reminders[reminder]) {
    return Response.json({ error: "Onbekende reminder" }, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REMINDERS_FROM_EMAIL");
  if (!supabaseUrl || !serviceRoleKey || !resendKey || !from) {
    return Response.json({ error: "Secrets ontbreken" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("reminder_voorkeuren")
    .select("gebruiker_id")
    .eq("reminder", reminder)
    .eq("actief", true);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results = await Promise.allSettled(
    (data ?? []).map(async ({ gebruiker_id }) => {
      const { data: userData } = await supabase.auth.admin.getUserById(gebruiker_id);
      if (!userData.user?.email) return;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: userData.user.email,
          subject: "Moreel Leiderschap — kleine herinnering",
          text: reminders[reminder]
        })
      });
    })
  );

  return Response.json({
    reminder,
    verstuurd: results.filter((result) => result.status === "fulfilled").length
  });
});
