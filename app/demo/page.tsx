import Link from "next/link";
import { CheckCircle2, Database, LockKeyhole, Route, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { MOREEL_MODEL } from "@/lib/model";
import { FASES } from "@/lib/traject";

export const metadata = {
  title: "Demo zonder Supabase"
};

const statusItems = [
  {
    icon: <Route size={22} />,
    title: "Frontend is beschikbaar",
    description: "Je kunt de propositie, structuur en kernflows bekijken zonder database."
  },
  {
    icon: <Database size={22} />,
    title: "Supabase is nodig voor data",
    description: "Login, profielen, cohorten, dagboek, groepsruimte en dashboards vragen Supabase."
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Productiepad blijft beveiligd",
    description: "Zodra Supabase is gekoppeld, gebruikt de app dezelfde auth-, RLS- en privacyregels."
  }
];

const featureGroups = [
  {
    title: "Deelnemer",
    items: ["18-weken traject", "Privé dagboek", "Anonieme groepsruimte", "Zelfscan", "Reminders"]
  },
  {
    title: "Begeleider",
    items: ["Cohortdashboard", "Weekthema's", "Groepsmoderatie", "Geaggregeerde voortgang"]
  },
  {
    title: "Backend",
    items: ["Magic-link auth", "Profiles en rollen", "RLS policies", "Reminder-webhook"]
  }
];

export default function DemoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-5 py-10 md:py-16">
      <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 border border-accent/20 bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            <LockKeyhole size={15} />
            Demo fallback
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-6xl">
            Supabase blijft de productie-backend.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Deze omgeving heeft nog geen geldige Supabase-configuratie. Daarom toont de app een
            veilige demo/statusmodus: genoeg om de ervaring te beoordelen, zonder te doen alsof
            login of opslag al werkt.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login?melding=configuratie"
              className={buttonVariants({ variant: "primary" })}
            >
              Bekijk loginstatus
            </Link>
            <Link href="/setup" className={buttonVariants({ variant: "secondary" })}>
              Setup controleren
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader
            eyebrow="Status"
            title="Wat werkt zonder Supabase?"
            description="De app bouwt en rendert, maar schrijft en leest geen persoonlijke data."
          />
          <div className="space-y-4">
            {statusItems.map((item) => (
              <div key={item.title} className="flex gap-4 border border-line bg-white/55 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-white text-accent">
                  {item.icon}
                </div>
                <div>
                  <h2 className="font-semibold text-ink">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {featureGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader title={group.title} />
            <ul className="space-y-3">
              {group.items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-muted">
                  <CheckCircle2 size={17} className="text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader
            eyebrow="Moreel model"
            title="Vijf dimensies"
            description="Deze inhoud is statisch en kan zonder database worden bekeken."
          />
          <div className="grid gap-3">
            {MOREEL_MODEL.map((dimensie) => (
              <div key={dimensie.key} className="border border-line bg-white/55 p-4">
                <p className="font-semibold text-ink">
                  {dimensie.naam} <span className="text-sm text-muted">({dimensie.label})</span>
                </p>
                <p className="mt-1 text-sm text-muted">{dimensie.kernvraag}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Traject"
            title="18-weken leerlijn"
            description="De live voortgang, notities en cohortdata verschijnen na Supabase-koppeling."
          />
          <div className="space-y-4">
            {FASES.map((fase) => (
              <div key={fase.naam} className="border border-line bg-white/55 p-4">
                <h2 className="font-display text-xl text-ink">{fase.naam}</h2>
                <p className="mt-1 text-sm text-muted">{fase.omschrijving}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {fase.weken.length} onderdelen
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
