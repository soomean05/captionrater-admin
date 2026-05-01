import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperadmin } from "@/lib/supabase/guards";
import { SignInWithGoogleButton } from "./SignInWithGoogleButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string } | undefined;
  if (claims?.sub) {
    const ok = await isSuperadmin(claims.sub);
    redirect(ok ? "/admin" : "/not-authorized");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mb-6 inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
            Admin Access
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Caption Rater Admin
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Sign in with your approved Google account to manage admin tools.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-medium text-zinc-700">
              Admin access is restricted to approved superadmins.
            </p>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            <SignInWithGoogleButton />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
            <span className="text-xs text-zinc-500">Secure Google sign-in</span>
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl" />
      </div>
    </div>
  );
}
