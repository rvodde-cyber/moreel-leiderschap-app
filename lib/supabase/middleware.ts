import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

type SupabaseMiddlewareConfig = {
  url: string;
  anonKey: string;
};

function isPlaceholderValue(value: string) {
  const normalizedValue = value.toLowerCase();

  return (
    normalizedValue.includes("your project's url") ||
    normalizedValue.includes("your-project-url") ||
    normalizedValue.includes("your-project-ref") ||
    normalizedValue.includes("your-anon-key") ||
    normalizedValue.includes("supabase-url") ||
    normalizedValue.includes("supabase-anon-key")
  );
}

function getSupabaseConfig(): SupabaseMiddlewareConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey || isPlaceholderValue(url) || isPlaceholderValue(anonKey)) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return null;
    }
  } catch {
    return null;
  }

  return { url, anonKey };
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
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

    await supabase.auth.getUser();
  } catch {
    return response;
  }

  return response;
}
