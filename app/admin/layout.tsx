import Link from "next/link";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { signOut } from "./actions";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperadmin();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white p-6 md:block">
          <Link href="/admin" className="text-sm font-semibold tracking-tight">
            Admin
          </Link>
          <div className="mt-1 text-xs text-zinc-600">{user.email ?? user.id}</div>

          <AdminNav />

          <form action={signOut} className="mt-8">
            <button className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">
              Sign out
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto md:hidden">
              <Link href="/admin" className="whitespace-nowrap rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100">
                Dashboard
              </Link>
              <Link href="/admin/users" className="whitespace-nowrap rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100">
                Users
              </Link>
              <Link href="/admin/images" className="whitespace-nowrap rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100">
                Images
              </Link>
              <Link href="/admin/terms" className="whitespace-nowrap rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100">
                Terms
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Home
              </Link>
              <form action={signOut}>
                <button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">
                  Sign out
                </button>
              </form>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

