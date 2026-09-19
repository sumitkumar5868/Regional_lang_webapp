// ============================================================
// Supabase client singleton
// ============================================================

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn("Supabase env vars missing — database features will be unavailable.");
}

export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: { persistSession: false },
});
