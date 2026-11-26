import { createClient } from "@supabase/supabase-js";

// Publishable keys are intended for browser use. Database access is protected by RLS.
// This fallback binds the public client to the CLINA project; deploy-time env vars can override it.
const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || "https://kpsxjcorglvovolsmcrf.supabase.co";
const supabasePublishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_aZ1DNn0kAG0U7KNL6zWf9w_xvlnMFNk";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
