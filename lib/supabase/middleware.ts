import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

const protectedPathPrefixes = [
  "/traject",
  "/dagboek",
  "/groep",
  "/reminders",
  "/zelfscan",
  "/begeleider"
];

function isProtectedPath(pathname: string) {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });
  const protectedPath = isProtectedPath(request.nextUrl.pathname);

  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    if (protectedPath) {
      return NextResponse.redirect(new URL("/login?melding=configuratie", request.url));
    }

    return response;
  }

  try {
    const supabase = createServerClient<Database>(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          }
        }
      }
    );

    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (protectedPath && (error || !user)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    if (protectedPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  return response;
}
