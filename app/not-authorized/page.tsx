import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Your account is signed in, but it does not have superadmin access. Sign
            out to use a different account, or return home.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Sign out
              </button>
            </form>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Login page
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

