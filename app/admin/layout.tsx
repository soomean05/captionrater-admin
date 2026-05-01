import Link from "next/link";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { signOut } from "@/lib/auth/actions";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperadmin();

  return (
    <div className="admin-shell min-h-screen text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-[1500px] px-3 py-3 sm:px-4">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-sm md:block">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
            <Link href="/admin" className="text-base font-semibold tracking-tight text-indigo-950">
              Captionrater Admin
            </Link>
            <div className="mt-1 truncate text-xs text-indigo-900/70">{user.email ?? user.id}</div>
          </div>

          <AdminNav />

          <form action={signOut} className="mt-8">
            <button className="admin-btn-secondary w-full">
              Sign out
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1 md:pl-4">
          <header className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between md:px-5">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto md:hidden">
              <Link href="/admin" className="whitespace-nowrap rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
                Dashboard
              </Link>
              <Link href="/admin/users" className="whitespace-nowrap rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
                Users
              </Link>
              <Link href="/admin/images" className="whitespace-nowrap rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
                Images
              </Link>
              <Link href="/admin/terms" className="whitespace-nowrap rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
                Terms
              </Link>
            </div>
            <div className="hidden text-sm font-medium text-zinc-600 md:block">
              SaaS control plane
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Home
              </Link>
              <form action={signOut}>
                <button className="admin-btn-secondary">
                  Sign out
                </button>
              </form>
            </div>
          </header>

          <div className="mx-auto max-w-[1160px] pb-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

