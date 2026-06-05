import { Bell } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { updateReminder } from "@/lib/actions";
import { getAppContext, requireRole } from "@/lib/app-data";
import { REMINDERS } from "@/lib/reminders";
import { createClient } from "@/lib/supabase/server";

export default async function RemindersPage() {
  await requireRole("deelnemer");
  const { profile } = await getAppContext();
  const supabase = createClient();
  const { data } = await supabase
    .from("reminder_voorkeuren")
    .select("*")
    .eq("gebruiker_id", profile.id);
  const voorkeuren = data ?? [];

  const actiefMap = new Map(voorkeuren.map((item) => [item.reminder, item.actief]));

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader
          eyebrow="E-mail"
          title="Herinneringen"
          description="Kies welke rustige e-mailherinneringen je wilt ontvangen. Pushnotificaties zijn bewust geen onderdeel van deze versie."
        />
        <div className="space-y-4">
          {REMINDERS.map((reminder) => {
            const actief = actiefMap.get(reminder.key) ?? true;

            return (
              <form
                key={reminder.key}
                action={updateReminder}
                className="grid gap-4 border border-line bg-white/65 p-5 md:grid-cols-[1fr_auto]"
              >
                <input type="hidden" name="reminder" value={reminder.key} />
                <div>
                  <p className="font-semibold text-ink">{reminder.moment}</p>
                  <p className="mt-1 text-muted">“{reminder.bericht}”</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 text-sm font-semibold text-muted">
                    <input
                      type="checkbox"
                      name="actief"
                      defaultChecked={actief}
                      className="h-5 w-5 accent-[#534AB7]"
                    />
                    Aan
                  </label>
                  <Button type="submit" variant="secondary" size="sm">
                    <Bell size={15} />
                    Opslaan
                  </Button>
                </div>
              </form>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
