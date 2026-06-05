import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0"
};

const envNames = {
  url: ["NEXT", "PUBLIC", "SUPABASE", "URL"].join("_"),
  anonKey: ["NEXT", "PUBLIC", "SUPABASE", "ANON", "KEY"].join("_")
};

export function GET() {
  const env = process.env;

  return NextResponse.json(
    {
      url: env[envNames.url],
      anonKey: env[envNames.anonKey]
    },
    {
      headers: noStoreHeaders
    }
  );
}
