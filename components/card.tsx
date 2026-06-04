import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("border border-line bg-white/72 p-6 shadow-soft", className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl text-ink md:text-3xl">{title}</h2>
      {description ? <p className="max-w-2xl text-muted">{description}</p> : null}
    </div>
  );
}
