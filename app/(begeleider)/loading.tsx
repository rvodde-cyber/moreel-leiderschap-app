import { Card, CardHeader } from "@/components/card";

export default function BegeleiderLoading() {
  return (
    <div className="space-y-8">
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Laden
        </p>
        <div className="h-14 max-w-3xl animate-pulse bg-white/75" aria-hidden />
      </section>
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item}>
            <CardHeader title="Gegevens laden" description="Even geduld." />
            <div className="h-16 animate-pulse bg-white/75" aria-hidden />
          </Card>
        ))}
      </div>
    </div>
  );
}
