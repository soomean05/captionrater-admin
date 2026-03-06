import { createAdminClient } from "@/lib/supabase/admin";

type ProfileRow = Record<string, unknown> & {
  id?: string;
  email?: string | null;
  created_datetime_utc?: string | null;
  is_superadmin?: boolean | null;
};

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  const profiles = (data ?? []) as ProfileRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Reading from <code>profiles</code>.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          Failed to load profiles: {error.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Superadmin</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={String(p.id)} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 text-zinc-900">
                  {p.email ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                  {p.id ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {p.created_datetime_utc ? new Date(p.created_datetime_utc).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.is_superadmin ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                      TRUE
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      FALSE
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {!error && profiles.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-600" colSpan={4}>
                  No profiles found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

