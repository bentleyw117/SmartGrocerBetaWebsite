export interface WaitlistEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  RESEND_API_KEY?: string;
}

export interface RequiredEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  RESEND_API_KEY: string;
}

export function requireEnv(env: WaitlistEnv): RequiredEnv {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;
  const resendApiKey = env.RESEND_API_KEY;
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("SUPABASE_ANON_KEY");
  if (!resendApiKey) missing.push("RESEND_API_KEY");
  if (missing.length > 0 || !supabaseUrl || !supabaseAnonKey || !resendApiKey) {
    throw new Error(`Missing required environment variables: ${missing.join(", ") || "unknown"}`);
  }
  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    RESEND_API_KEY: resendApiKey,
  };
}
