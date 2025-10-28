import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bujwwxleldqyeubhhcrv.supabase.co";
const supabasePublishableKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
