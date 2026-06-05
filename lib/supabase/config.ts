export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

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

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey || isPlaceholderValue(url) || isPlaceholderValue(anonKey)) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return null;
    }
  } catch {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}
