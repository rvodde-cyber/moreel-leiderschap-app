import type { SupabaseConfig } from "@/lib/supabase/config";
import {
  SUPABASE_UNAVAILABLE_MESSAGE,
  getErrorMessage,
  type SupabaseAvailability
} from "@/lib/supabase/availability";

const HEALTH_CHECK_TIMEOUT_MS = 2500;

function healthCheckUrl(supabaseUrl: string) {
  return new URL("/auth/v1/health", supabaseUrl).toString();
}

function unavailable(detail?: string, statusCode?: number): SupabaseAvailability {
  return {
    status: "unavailable",
    message: SUPABASE_UNAVAILABLE_MESSAGE,
    statusCode,
    detail
  };
}

export async function checkSupabaseAvailability(
  config: SupabaseConfig
): Promise<SupabaseAvailability> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(healthCheckUrl(config.url), {
      cache: "no-store",
      headers: {
        apikey: config.anonKey
      },
      signal: controller.signal
    });

    if (response.ok) {
      return {
        status: "available",
        message: "Supabase is bereikbaar."
      };
    }

    const detail = await response.text().catch(() => response.statusText);
    return unavailable(detail || response.statusText, response.status);
  } catch (error) {
    return unavailable(getErrorMessage(error));
  } finally {
    clearTimeout(timeout);
  }
}
