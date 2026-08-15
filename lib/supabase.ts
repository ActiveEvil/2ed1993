import { Database } from "@/database.types";
import { PostgrestError, createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const NO_ROWS_RETURNED = "PGRST116";

export function assertNoQueryErrors(
  context: string,
  ...errors: (PostgrestError | null)[]
): void {
  const failure = errors.find(
    (error) => error !== null && error.code !== NO_ROWS_RETURNED,
  );

  if (failure) {
    throw new Error(`${context}: ${failure.message}`, { cause: failure });
  }
}
