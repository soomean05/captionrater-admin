import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSuperadmin } from "@/lib/supabase/guards";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub as string | undefined;
  if (!sub) {
    return NextResponse.redirect(`${origin}/login?error=no_session`);
  }

  const ok = await isSuperadmin(sub);
  return NextResponse.redirect(`${origin}${ok ? "/admin" : "/not-authorized"}`);
}
