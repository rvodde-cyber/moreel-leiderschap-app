import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

export function createClient() {
  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    throw new Error(
      "Supabase browser configuration is missing or invalid. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey);
}
