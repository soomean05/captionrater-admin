import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    request.headers.get("origin") ??
    "http://localhost:3000";
  const baseUrl = new URL(origin).origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${baseUrl}${next}`);
}
