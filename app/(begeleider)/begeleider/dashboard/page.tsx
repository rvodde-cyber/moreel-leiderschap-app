import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquare, Users } from "lucide-react";
import { Card, CardHeader } from "@/components/card";
import { DimensieBadge } from "@/components/dimensie-badge";
import { buttonVariants } from "@/components/button";
import { getAppContext, requireRole } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";

export default async function BegeleiderDashboardPage() {
  await requireRole("begeleider");
  const { profile, cohort, huidigeWeek } = await getAppContext();
  const supabase = createClient();
  const cohortId = profile.cohort_id ?? cohort?.id;

  const { data: aggregaat } = cohortId
    ? await supabase
        .from("begeleider_week_aggregaat")
        .select("*")
        .eq("cohort_id", cohortId)
        .eq("week", huidigeWeek)
        .maybeSingle()
    : { data: null };

  const { data: deelnemersAggregaat } = cohortId
    ? await supabase
        .from("cohort_deelnemers_aantal")
        .select("*")
        .eq("cohort_id", cohortId)
        .maybeSingle()
    : { data: null };
  const deelnemersCount = deelnemersAggregaat?.aantal_deelnemers ?? 0;

  return (
    <div className="space-y-8">
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Begeleidersdashboard
        </p>
        <h1 className="font-display text-4xl leading-tight md:text-6xl">
          Groepspatronen zonder individuele inkijk.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Je ziet alleen signalen op cohortniveau. Dagboeken en individuele scans blijven privé.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard
          icon={<Users size={22} />}
          label="Actief deze week"
          value={`${aggregaat?.actieve_deelnemers ?? 0} / ${deelnemersCount}`}
          description="Heeft minimaal één dagboeknotitie geschreven."
        />
        <MetricCard
          icon={<MessageSquare size={22} />}
          label="Posts in groepsruimte"
          value={String(aggregaat?.groepsruimte_posts ?? 0)}
          description={`Week ${huidigeWeek}`}
        />
        <MetricCard
          icon={<BookOpen size={22} />}
          label="Meest gebruikte dimensie"
          value={
            aggregaat?.meest_gebruikte_dimensie ? (
              <DimensieBadge dimensie={aggregaat.meest_gebruikte_dimensie} />
            ) : (
              "Nog geen data"
            )
          }
          description="Geaggregeerd uit dagboekaandacht."
        />
      </div>

      <Card>
        <CardHeader
          title={cohort?.naam ?? "Cohort"}
          description="Beheer het weekthema en bereid de bijeenkomst voor met anonieme groepsruimteposts."
        />
        <Link href="/begeleider/groep" className={buttonVariants({ variant: "primary" })}>
          Groepsruimte beheren
          <ArrowRight size={16} />
        </Link>
      </Card>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <div className="mb-4 flex h-11 w-11 items-center justify-center border border-line bg-white text-accent">
        {icon}
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="mt-3 font-display text-3xl text-ink">{value}</div>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </Card>
  );
}
