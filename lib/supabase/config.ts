export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_ENV = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
let hasWarnedMissingSupabaseConfig = false;

function readRuntimeEnv(name: string) {
  // Keep this dynamic so Next.js cannot inline stale NEXT_PUBLIC_* values at build time.
  const env = typeof process !== "undefined" ? process.env : undefined;
  return env?.[name]?.trim();
}

function isPlaceholderValue(value: string) {
  const normalizedValue = value.toLowerCase();

  return (
    normalizedValue.includes("your project's url") ||
    normalizedValue.includes("your-project-url") ||
    normalizedValue.includes("your-project-ref") ||
    normalizedValue.includes("your-anon-key") ||
    normalizedValue.includes("supabase-url") ||
    normalizedValue.includes("supabase-anon-key")
  );
}

function isSupportedUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  } catch {
    return false;
  }
}

function warnMissingSupabaseConfig(url: string | undefined, anonKey: string | undefined) {
  if (hasWarnedMissingSupabaseConfig) {
    return;
  }

  hasWarnedMissingSupabaseConfig = true;

  const diagnostics = {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    urlIsPlaceholder: url ? isPlaceholderValue(url) : false,
    anonKeyIsPlaceholder: anonKey ? isPlaceholderValue(anonKey) : false,
    urlIsValid: url ? isSupportedUrl(url) : false
  };

  console.warn("Supabase runtime configuration is missing or invalid.", diagnostics);
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = readRuntimeEnv(SUPABASE_URL_ENV);
  const anonKey = readRuntimeEnv(SUPABASE_ANON_KEY_ENV);

  if (!url || !anonKey || isPlaceholderValue(url) || isPlaceholderValue(anonKey)) {
    warnMissingSupabaseConfig(url, anonKey);
    return null;
  }

  if (!isSupportedUrl(url)) {
    warnMissingSupabaseConfig(url, anonKey);
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}
