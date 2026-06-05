import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-semibold uppercase tracking-[0.16em] text-muted", className)}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full border border-line bg-white/80 px-4 py-3 text-ink placeholder:text-muted/70 transition focus:border-accent",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-44 w-full resize-y border border-line bg-white/80 px-4 py-3 text-ink placeholder:text-muted/70 transition focus:border-accent",
        className
      )}
      {...props}
    />
  );
}
