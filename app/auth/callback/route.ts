import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    if (!isSupabaseConfigured()) {
      return NextResponse.redirect(new URL("/login?melding=configuratie", request.url));
    }

    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
