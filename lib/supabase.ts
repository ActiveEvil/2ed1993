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

/**
 * PostgREST's "no rows returned" code for .single(). A missing row is a
 * legitimate result rather than a failure, so callers decide what it means:
 * notFound() on a [slug] route, a thrown error on a page that must exist.
 */
const NO_ROWS_RETURNED = "PGRST116";

/**
 * supabase-js resolves rather than rejects when a query fails, so an outage is
 * indistinguishable from an empty result unless the error field is inspected.
 * Throwing here turns genuine failures into 500s caught by app/error.tsx,
 * instead of soft 404s or blank pages.
 */
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
