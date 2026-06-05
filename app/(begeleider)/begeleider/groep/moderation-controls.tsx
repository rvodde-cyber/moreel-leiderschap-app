"use client";

import { Flag, EyeOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/button";
import { updateGroepsruimteModeratie } from "@/lib/actions";

export function ModerationControls({
  postId,
  verborgen,
  gespreksstarter
}: {
  postId: string;
  verborgen: boolean;
  gespreksstarter: boolean;
}) {
  function confirmHide(event: React.FormEvent<HTMLFormElement>) {
    if (!verborgen && !window.confirm("Weet je zeker dat je dit anonieme bericht wilt verbergen?")) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <form action={updateGroepsruimteModeratie}>
        <input type="hidden" name="post_id" value={postId} />
        <input type="hidden" name="veld" value="gespreksstarter" />
        <input type="hidden" name="waarde" value={gespreksstarter ? "false" : "true"} />
        <Button type="submit" variant={gespreksstarter ? "primary" : "secondary"} size="sm">
          <Flag size={15} />
          {gespreksstarter ? "Gespreksstarter" : "Markeer als gespreksstarter"}
        </Button>
      </form>

      <form action={updateGroepsruimteModeratie} onSubmit={confirmHide}>
        <input type="hidden" name="post_id" value={postId} />
        <input type="hidden" name="veld" value="verborgen" />
        <input type="hidden" name="waarde" value={verborgen ? "false" : "true"} />
        <Button type="submit" variant={verborgen ? "secondary" : "danger"} size="sm">
          {verborgen ? <RotateCcw size={15} /> : <EyeOff size={15} />}
          {verborgen ? "Terugplaatsen" : "Verbergen"}
        </Button>
      </form>
    </div>
  );
}
