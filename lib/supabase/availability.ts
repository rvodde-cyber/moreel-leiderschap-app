export type SupabaseAvailability = {
  status: "available" | "unavailable";
  message: string;
  statusCode?: number;
  detail?: string;
};

export const SUPABASE_UNAVAILABLE_MESSAGE =
  "De database is tijdelijk niet bereikbaar. Het Supabase-project is mogelijk gepauzeerd; hervat het project in Supabase en probeer opnieuw.";

const unavailableMessageParts = [
  "fetch failed",
  "failed to fetch",
  "networkerror",
  "network request failed",
  "service unavailable",
  "temporarily unavailable",
  "project is paused",
  "project has been paused",
  "paused",
  "enotfound",
  "econnrefused",
  "econnreset",
  "etimedout",
  "timeout"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return "";
}

export function isSupabaseUnavailableMessage(message: string) {
  const normalizedMessage = message.toLowerCase();
  return unavailableMessageParts.some((part) => normalizedMessage.includes(part));
}

export function isSupabaseUnavailableError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (isRecord(error)) {
    const status = error.status;
    const code = error.code;

    if (typeof status === "number" && status >= 500) {
      return true;
    }

    if (typeof code === "string" && isSupabaseUnavailableMessage(code)) {
      return true;
    }

    if (isSupabaseUnavailableError(error.cause)) {
      return true;
    }
  }

  return isSupabaseUnavailableMessage(getErrorMessage(error));
}
