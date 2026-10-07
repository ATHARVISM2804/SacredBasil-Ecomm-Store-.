export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True once the Supabase project keys are present in the environment. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
