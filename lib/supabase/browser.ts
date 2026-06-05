import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

export function createClient(supabaseConfig: SupabaseConfig) {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey);
}
