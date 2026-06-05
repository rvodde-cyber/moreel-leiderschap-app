import { Button } from "@/components/button";
import { Card, CardHeader } from "@/components/card";
import { DimensieBadge } from "@/components/dimensie-badge";
import { Input, Label, Textarea } from "@/components/field";
import { ModerationControls } from "@/app/(begeleider)/begeleider/groep/moderation-controls";
import { saveWeekthema } from "@/lib/actions";
import { getAppContext, requireRole } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function BegeleiderGroepPage() {
  await requireRole("begeleider");
  const { profile, cohort, huidigeWeek } = await getAppContext();
  const supabase = createClient();
  const cohortId = profile.cohort_id ?? cohort?.id;

  const { data: thema } = cohortId
    ? await supabase
        .from("weekthemas")
        .select("*")
        .eq("cohort_id", cohortId)
        .eq("week", huidigeWeek)
        .maybeSingle()
    : { data: null };

  const { data: postData } = cohortId
    ? await supabase
        .from("groepsruimte_overzicht")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("aangemaakt_op", { ascending: false })
    : { data: [] };
  const posts = postData ?? [];

  return (
    <div className="grid gap-8 xl:grid-cols-[0.8fr_1fr]">
      <Card>
        <CardHeader
          eyebrow={`Week ${huidigeWeek}`}
          title="Weekthema instellen"
          description="Een titel en één centrale vraag verschijnen bovenaan de groepsruimte van deelnemers."
        />
        <form action={saveWeekthema} className="space-y-5">
          <input type="hidden" name="cohort_id" value={cohortId ?? ""} />
          <div className="space-y-2">
            <Label htmlFor="week">Week</Label>
            <Input id="week" name="week" type="number" min={1} max={18} defaultValue={huidigeWeek} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thema">Titel</Label>
            <Input
              id="thema"
              name="thema"
              defaultValue={thema?.thema ?? ""}
              placeholder="Bijvoorbeeld: Zien wat er speelt"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vraag">Centrale vraag</Label>
            <Textarea
              id="vraag"
              name="vraag"
              defaultValue={thema?.vraag ?? ""}
              placeholder="Welke vraag helpt de groep deze week verdiepen?"
              required
            />
          </div>
          <Button type="submit">Weekthema opslaan</Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Anonieme posts beheren"
          description="Er is geen auteur beschikbaar. Moderatie raakt alleen het bericht zelf."
        />
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="border border-line bg-white/50 p-4 text-muted">
              Er zijn nog geen posts in deze groepsruimte.
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className={`border p-5 ${
                  post.verborgen ? "border-[#C45E3E]/40 bg-[#C45E3E]/5" : "border-line bg-white/70"
                }`}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <DimensieBadge dimensie={post.dimensie} />
                    {post.gespreksstarter ? (
                      <span className="border border-accent bg-accent/5 px-3 py-1 text-sm text-accent">
                        Gespreksstarter
                      </span>
                    ) : null}
                    {post.verborgen ? (
                      <span className="border border-[#C45E3E] px-3 py-1 text-sm text-[#C45E3E]">
                        Verborgen
                      </span>
                    ) : null}
                  </div>
                  <span className="text-sm text-muted">
                    Week {post.week} · {formatDate(post.aangemaakt_op)}
                  </span>
                </div>
                <p className="mb-4 whitespace-pre-wrap text-lg leading-relaxed">{post.tekst}</p>
                <p className="mb-4 text-sm text-muted">
                  Herkenbaar-reacties: {post.herkenbaar_count}
                </p>
                <ModerationControls
                  postId={post.id}
                  verborgen={post.verborgen}
                  gespreksstarter={post.gespreksstarter}
                />
              </article>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
