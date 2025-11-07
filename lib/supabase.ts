import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bujwwxleldqyeubhhcrv.supabase.co";
const supabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1and3eGxlbGRxeWV1YmhoY3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTk0NzUsImV4cCI6MjA3NzE3NTQ3NX0.CbZprqb9NSgtnZW_yeu5K6wjF2rx-OAveWb8FD3XwG4";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
