import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

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
