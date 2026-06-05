export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export type SupabaseConfigDiagnostics = {
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlIsPlaceholder: boolean;
  anonKeyIsPlaceholder: boolean;
  urlIsValid: boolean;
};

const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_ENV = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
let hasWarnedMissingSupabaseConfig = false;

function readRuntimeEnv(name: string) {
  // Dynamic fallback for Node runtimes where env values are supplied after build time.
  const env = typeof process !== "undefined" ? process.env : undefined;
  return env?.[name]?.trim();
}

function readSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || readRuntimeEnv(SUPABASE_URL_ENV);
}

function readSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || readRuntimeEnv(SUPABASE_ANON_KEY_ENV);
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

export function getSupabaseConfigDiagnostics(): SupabaseConfigDiagnostics {
  const url = readSupabaseUrl();
  const anonKey = readSupabaseAnonKey();

  return {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    urlIsPlaceholder: url ? isPlaceholderValue(url) : false,
    anonKeyIsPlaceholder: anonKey ? isPlaceholderValue(anonKey) : false,
    urlIsValid: url ? isSupportedUrl(url) : false
  };
}

function warnMissingSupabaseConfig() {
  if (hasWarnedMissingSupabaseConfig) {
    return;
  }

  hasWarnedMissingSupabaseConfig = true;

  console.warn(
    "Supabase runtime configuration is missing or invalid.",
    getSupabaseConfigDiagnostics()
  );
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = readSupabaseUrl();
  const anonKey = readSupabaseAnonKey();

  if (!url || !anonKey || isPlaceholderValue(url) || isPlaceholderValue(anonKey)) {
    warnMissingSupabaseConfig();
    return null;
  }

  if (!isSupportedUrl(url)) {
    warnMissingSupabaseConfig();
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}
