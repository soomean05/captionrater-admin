import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

/**
 * Creates a Supabase client for server-side use (Server Components, Server Actions, Route Handlers).
 * Uses the anon key and respects the user's session from cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const key = getAnonKey();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components - middleware handles session refresh
          }
        },
      },
    }
  );
}
