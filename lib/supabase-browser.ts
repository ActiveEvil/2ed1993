import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";

const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SUPABASE_PROJECT_ID is not set");
}

if (!publishableKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is not set");
}

export const supabaseBrowser = createClient<Database>(
  `https://${projectId}.supabase.co`,
  publishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);
