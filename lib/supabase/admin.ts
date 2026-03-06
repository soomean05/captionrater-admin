import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the service role key for admin operations.
 * Use ONLY on the server (Server Components, Server Actions, Route Handlers).
 * Bypasses RLS - ensure you enforce superadmin checks before using this client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
