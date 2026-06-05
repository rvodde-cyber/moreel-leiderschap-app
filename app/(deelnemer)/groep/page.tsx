import { Heart } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { DimensieBadge, DimensieGrid } from "@/components/dimensie-badge";
import { Label, Textarea } from "@/components/field";
import { createGroepsruimtePost, toggleHerkenbaar } from "@/lib/actions";
import { getAppContext, requireRole } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function GroepPage() {
  await requireRole("deelnemer");
  const { profile, huidigeWeek } = await getAppContext();
  const supabase = createClient();

  const { data: thema } = profile.cohort_id
    ? await supabase
        .from("weekthemas")
        .select("*")
        .eq("cohort_id", profile.cohort_id)
        .eq("week", huidigeWeek)
        .maybeSingle()
    : { data: null };

  const { data: postData } = profile.cohort_id
    ? await supabase
        .from("groepsruimte_overzicht")
        .select("*")
        .eq("cohort_id", profile.cohort_id)
        .eq("verborgen", false)
        .order("aangemaakt_op", { ascending: false })
    : { data: [] };
  const posts = postData ?? [];

  return (
    <div className="grid gap-8 xl:grid-cols-[0.85fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader
            eyebrow={`Week ${huidigeWeek}`}
            title={thema?.thema ?? "Weekthema volgt"}
            description={
              thema?.vraag ?? "Je begeleider kan hier één centrale vraag voor deze week plaatsen."
            }
          />
        </Card>

        <Card>
          <CardHeader
            title="Anoniem delen"
            description="Plaats een situatie of observatie voor je cohort. Er wordt geen auteur opgeslagen."
          />
          {profile.cohort_id ? (
            <form action={createGroepsruimtePost} className="space-y-5">
              <input type="hidden" name="week" value={huidigeWeek} />
              <div className="space-y-3">
                <Label>Dimensie</Label>
                <DimensieGrid value="waarnemen" />
              </div>
              <Textarea
                name="tekst"
                placeholder="Beschrijf de situatie zo concreet als nodig, zonder namen als dat niet hoeft."
                required
              />
              <p className="border border-[#C45E3E]/25 bg-[#C45E3E]/5 p-4 text-sm text-[#8a3e29]">
                Dit bericht is anoniem zichtbaar voor alle deelnemers en de begeleider. Jouw naam
                wordt nooit getoond.
              </p>
              <Button type="submit">Anoniem plaatsen</Button>
            </form>
          ) : (
            <p className="border border-line bg-white/60 p-4 text-muted">
              Je profiel is nog niet aan een cohort gekoppeld. Vraag je begeleider om je toe te
              voegen voordat je anoniem kunt delen.
            </p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Groepsruimte"
          description="Je ziet patronen en herkenning, geen discussie en geen namen."
        />
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="border border-line bg-white/50 p-4 text-muted">
              Er zijn nog geen anonieme berichten in dit cohort.
            </p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="border border-line bg-white/70 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <DimensieBadge dimensie={post.dimensie} />
                  <span className="text-sm text-muted">
                    Week {post.week} · {formatDate(post.aangemaakt_op)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink">{post.tekst}</p>
                <form action={toggleHerkenbaar} className="mt-5">
                  <input type="hidden" name="post_id" value={post.id} />
                  <Button
                    type="submit"
                    variant={post.door_mij_herkend ? "primary" : "secondary"}
                    size="sm"
                  >
                    <Heart size={16} fill={post.door_mij_herkend ? "currentColor" : "none"} />
                    Herkenbaar · {post.herkenbaar_count}
                  </Button>
                </form>
              </article>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
