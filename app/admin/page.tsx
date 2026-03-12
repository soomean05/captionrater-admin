import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

async function countTable(
  supabase: ReturnType<typeof createAdminClient>,
  table: string
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return { count: count ?? 0, error };
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [profiles, images, captions, superadmins] = await Promise.all([
    countTable(supabase, "profiles"),
    countTable(supabase, "images"),
    countTable(supabase, "captions"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_superadmin", true),
  ]);

  const stats = [
    {
      label: "Total users",
      value: profiles.count,
      href: "/admin/users",
      error: profiles.error,
    },
    {
      label: "Total images",
      value: images.count,
      href: "/admin/images",
      error: images.error,
    },
    {
      label: "Total captions",
      value: captions.count,
      href: "/admin/captions",
      error: captions.error,
    },
    {
      label: "Superadmins",
      value: superadmins.count ?? 0,
      href: "/admin/users",
      error: superadmins.error,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Database statistics at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <div className="text-sm font-medium text-zinc-600">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">
              {s.error ? "—" : s.value}
            </div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-zinc-600">
        <Link
          href="/admin/schema-check"
          className="font-medium text-zinc-900 underline hover:no-underline"
        >
          Schema check
        </Link>
        {" — test table access and discover column names for broken pages"}
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "users",
            "images",
            "humor-flavors",
            "humor-flavor-steps",
            "humor-mix",
            "terms",
            "captions",
            "caption-requests",
            "caption-examples",
            "llm-models",
            "llm-providers",
            "llm-prompt-chains",
            "llm-responses",
            "allowed-signup-domains",
            "whitelisted-emails",
          ].map((slug) => (
            <Link
              key={slug}
              href={`/admin/${slug}`}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              {slug.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
