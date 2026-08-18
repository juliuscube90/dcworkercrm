import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Service-role client for privileged operations (inviting users, etc).
// SUPABASE_SERVICE_ROLE_KEY must never have the NEXT_PUBLIC_ prefix —
// this file must only ever be imported from server actions / route handlers.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it in your Supabase project's " +
        "Settings → API → service_role secret, then add it as an env var " +
        "(Vercel + .env.local) — never expose it to the client."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
