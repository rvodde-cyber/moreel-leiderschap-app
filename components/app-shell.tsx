import Link from "next/link";
import { BookOpen, HeartHandshake, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import type { Profile } from "@/lib/supabase/types";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

const deelnemerLinks = [
  { href: "/traject", label: "Traject" },
  { href: "/dagboek", label: "Dagboek" },
  { href: "/groep", label: "Groepsruimte" },
  { href: "/reminders", label: "Reminders" },
  { href: "/zelfscan", label: "Zelfscan" }
];

const begeleiderLinks = [
  { href: "/begeleider/dashboard", label: "Dashboard" },
  { href: "/begeleider/groep", label: "Groepsruimte" },
  { href: "/begeleider/voortgang", label: "Voortgang" }
];

export function AppShell({
  profile,
  children,
  className
}: {
  profile: Profile;
  children: React.ReactNode;
  className?: string;
}) {
  const links = profile.rol === "begeleider" ? begeleiderLinks : deelnemerLinks;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-canvas/88 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <Link href={profile.rol === "begeleider" ? "/begeleider/dashboard" : "/traject"} className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-line bg-white text-accent transition group-hover:border-accent">
              {profile.rol === "begeleider" ? <LayoutDashboard size={20} /> : <HeartHandshake size={20} />}
            </span>
            <span>
              <span className="block font-display text-2xl leading-none">Moreel Vakmanschap</span>
              <span className="text-sm text-muted">
                {profile.naam ?? "Welkom"} · {profile.rol}
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border border-transparent px-3 py-2 text-sm text-muted transition hover:border-line hover:bg-white/70 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut size={16} />
                Uitloggen
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className={cn("mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12", className)}>
        {children}
      </main>

      <footer className="mx-auto flex max-w-7xl items-center gap-2 px-5 pb-8 text-sm text-muted md:px-8">
        <BookOpen size={16} />
        Rust, reflectie en morele moed — zonder scores of ranglijsten.
      </footer>
    </div>
  );
}
