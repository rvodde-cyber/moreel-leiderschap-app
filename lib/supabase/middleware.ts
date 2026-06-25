import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseUnavailableError } from "@/lib/supabase/availability";
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

function loginRedirect(request: NextRequest, melding?: string) {
  const url = new URL("/login", request.url);
  if (melding) {
    url.searchParams.set("melding", melding);
  }

  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });
  const protectedPath = isProtectedPath(request.nextUrl.pathname);

  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    if (protectedPath) {
      return loginRedirect(request, "configuratie");
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

    if (protectedPath && error) {
      return loginRedirect(request, isSupabaseUnavailableError(error) ? "supabase" : undefined);
    }

    if (protectedPath && !user) {
      return loginRedirect(request);
    }
  } catch {
    if (protectedPath) {
      return loginRedirect(request, "supabase");
    }

    return response;
  }

  return response;
}
