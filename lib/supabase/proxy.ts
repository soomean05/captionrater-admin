import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

/**
 * Refreshes the Supabase session (cookie bridge).
 *
 * Next.js Server Components can't write cookies. Next.js proxy/middleware runs
 * before rendering, so it can refresh auth and keep cookies in sync.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getAnonKey();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // set cookies on the incoming request (for Server Components)
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        // and also set cookies on the outgoing response (for the browser)
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: calling getClaims() refreshes expired sessions.
  await supabase.auth.getClaims();

  return supabaseResponse;
}

