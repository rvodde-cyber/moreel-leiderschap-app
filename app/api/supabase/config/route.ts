import { NextResponse } from "next/server";
import { getSupabaseConfig, getSupabaseConfigDiagnostics } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0"
};

export function GET() {
  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    return NextResponse.json(
      {
        configured: false,
        diagnostics: getSupabaseConfigDiagnostics()
      },
      {
        status: 503,
        headers: noStoreHeaders
      }
    );
  }

  return NextResponse.json(
    {
      configured: true,
      config: supabaseConfig
    },
    {
      headers: noStoreHeaders
    }
  );
}
