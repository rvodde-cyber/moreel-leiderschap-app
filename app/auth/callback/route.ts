import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseUnavailableError } from "@/lib/supabase/availability";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (authError) {
    return NextResponse.redirect(new URL("/login?melding=link", request.url));
  }

  if (code) {
    if (!isSupabaseConfigured()) {
      return NextResponse.redirect(new URL("/login?melding=configuratie", request.url));
    }

    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code).catch((exchangeError) => ({
      error: exchangeError
    }));

    if (error) {
      const melding = isSupabaseUnavailableError(error) ? "supabase" : "link";
      return NextResponse.redirect(new URL(`/login?melding=${melding}`, request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
