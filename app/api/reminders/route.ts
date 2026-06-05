import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { REMINDERS } from "@/lib/reminders";
import type { Database, ReminderKey } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  const secret = process.env.REMINDERS_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { reminder?: ReminderKey };
  const reminderKey = body.reminder;
  const reminder = REMINDERS.find((item) => item.key === reminderKey);

  if (!reminder) {
    return NextResponse.json({ error: "Onbekende reminder" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDERS_FROM_EMAIL;

  if (!supabaseUrl || !serviceRoleKey || !resendKey || !from) {
    return NextResponse.json(
      { error: "Reminder secrets ontbreken in de omgeving" },
      { status: 500 }
    );
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("reminder_voorkeuren")
    .select("gebruiker_id")
    .eq("reminder", reminder.key)
    .eq("actief", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = data?.map((item) => item.gebruiker_id) ?? [];
  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData.user?.email) return;

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
          text: reminder.bericht
        })
      });
    })
  );

  return NextResponse.json({
    reminder: reminder.key,
    verstuurd: results.filter((result) => result.status === "fulfilled").length
  });
}
