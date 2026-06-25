import { NextResponse } from "next/server";
import { getSupabaseConfig, getSupabaseConfigDiagnostics } from "@/lib/supabase/config";
import { checkSupabaseAvailability } from "@/lib/supabase/status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0"
};

export async function GET() {
  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    return NextResponse.json(
      {
        url: null,
        anonKey: null,
        availability: {
          status: "unavailable",
          message: "Inloggen is tijdelijk niet beschikbaar door ontbrekende Supabase-configuratie."
        },
        diagnostics: getSupabaseConfigDiagnostics()
      },
      {
        status: 503,
        headers: noStoreHeaders
      }
    );
  }

  const availability = await checkSupabaseAvailability(supabaseConfig);

  return NextResponse.json(
    {
      ...supabaseConfig,
      availability
    },
    {
      status: availability.status === "available" ? 200 : 503,
      headers: noStoreHeaders
    }
  );
}
