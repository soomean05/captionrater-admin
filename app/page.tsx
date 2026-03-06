import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 px-6">
      <h1 className="text-2xl font-semibold text-zinc-900">CaptionRater Admin</h1>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/login"
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Log in
        </Link>
        <Link
          href="/admin"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}
