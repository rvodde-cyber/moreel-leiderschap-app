import { DIMENSIE_BY_KEY, MOREEL_MODEL, type DimensieKey } from "@/lib/model";
import { cn } from "@/lib/utils";

export function DimensieBadge({
  dimensie,
  className
}: {
  dimensie?: DimensieKey | null;
  className?: string;
}) {
  if (!dimensie) {
    return (
      <span className={cn("inline-flex border border-line px-3 py-1 text-sm text-muted", className)}>
        Vrij
      </span>
    );
  }

  const item = DIMENSIE_BY_KEY[dimensie];

  return (
    <span
      className={cn("inline-flex items-center gap-2 border px-3 py-1 text-sm", className)}
      style={{ borderColor: item.kleur, color: item.kleur }}
    >
      <span aria-hidden>{item.icoon}</span>
      {item.naam}
    </span>
  );
}

export function DimensieGrid({
  value,
  name = "dimensie"
}: {
  value?: DimensieKey;
  name?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {MOREEL_MODEL.map((dimensie) => (
        <label
          key={dimensie.key}
          className={cn(
            "group flex cursor-pointer flex-col gap-2 border bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-soft",
            value === dimensie.key ? "border-accent shadow-soft" : "border-line"
          )}
          style={value === dimensie.key ? { borderColor: dimensie.kleur } : undefined}
        >
          <input
            type="radio"
            name={name}
            value={dimensie.key}
            defaultChecked={value === dimensie.key}
            className="sr-only"
            required
          />
          <span className="text-2xl" aria-hidden>
            {dimensie.icoon}
          </span>
          <span className="font-semibold text-ink">{dimensie.naam}</span>
          <span className="text-sm text-muted">{dimensie.kernvraag}</span>
        </label>
      ))}
    </div>
  );
}
