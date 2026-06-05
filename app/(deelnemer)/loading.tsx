import { Card, CardHeader } from "@/components/card";

export default function DeelnemerLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
      <Card>
        <CardHeader
          eyebrow="Laden"
          title="Je leeromgeving wordt opgehaald"
          description="We halen je persoonlijke voortgang veilig op."
        />
        <div className="space-y-4" aria-hidden>
          <div className="h-10 animate-pulse bg-white/80" />
          <div className="h-28 animate-pulse bg-white/70" />
          <div className="h-10 w-40 animate-pulse bg-white/80" />
        </div>
      </Card>
      <Card>
        <div className="space-y-3" aria-hidden>
          <div className="h-6 w-1/2 animate-pulse bg-white/80" />
          <div className="h-20 animate-pulse bg-white/70" />
          <div className="h-20 animate-pulse bg-white/70" />
        </div>
      </Card>
    </div>
  );
}
