import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0"
};

export function GET() {
  return NextResponse.json(
    {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    {
      headers: noStoreHeaders
    }
  );
}
