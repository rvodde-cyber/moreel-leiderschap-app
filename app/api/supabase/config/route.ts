import { NextResponse } from "next/server";
import { getSupabaseConfig, getSupabaseConfigDiagnostics } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0"
};

export function GET() {
  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    return NextResponse.json(
      {
        error: "Supabase runtime configuration is missing or invalid.",
        diagnostics: getSupabaseConfigDiagnostics()
      },
      {
        status: 503,
        headers: noStoreHeaders
      }
    );
  }

  return NextResponse.json(supabaseConfig, {
    headers: noStoreHeaders
  });
}
