import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const superadminFilter = typeof sp.superadmin === "string" ? sp.superadmin : "all";
  const matrixFilter = typeof sp.matrix === "string" ? sp.matrix : "all";
  const studyFilter = typeof sp.study === "string" ? sp.study : "all";
  const { data, error, count } = await listTablePaginated("profiles", page, pageSize);
  const allRows = (data ?? []) as Record<string, unknown>[];
  const rows = allRows.filter((row) => {
    const email = String(row.email ?? "").toLowerCase();
    const fullName = `${String(row.first_name ?? "")} ${String(row.last_name ?? "")}`.toLowerCase();
    const matchesQ = q ? email.includes(q) || fullName.includes(q) : true;
    const matchesSuperadmin =
      superadminFilter === "all" ||
      (superadminFilter === "yes" && row.is_superadmin === true) ||
      (superadminFilter === "no" && row.is_superadmin !== true);
    const matchesMatrix =
      matrixFilter === "all" ||
      (matrixFilter === "yes" && row.is_matrix_admin === true) ||
      (matrixFilter === "no" && row.is_matrix_admin !== true);
    const matchesStudy =
      studyFilter === "all" ||
      (studyFilter === "yes" && row.is_in_study === true) ||
      (studyFilter === "no" && row.is_in_study !== true);
    return matchesQ && matchesSuperadmin && matchesMatrix && matchesStudy;
  });
  const total = count ?? allRows.length;
  const totalUsers = allRows.length;
  const superadmins = allRows.filter((r) => r.is_superadmin === true).length;
  const matrixAdmins = allRows.filter((r) => r.is_matrix_admin === true).length;
  const inStudy = allRows.filter((r) => r.is_in_study === true).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Users" subtitle="Reading from profiles." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total users", value: totalUsers },
          { label: "Superadmins", value: superadmins },
          { label: "Matrix admins", value: matrixAdmins },
          { label: "In study", value: inStudy },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <form method="get" className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="min-w-[260px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            name="superadmin"
            defaultValue={superadminFilter}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">All superadmin statuses</option>
            <option value="yes">Superadmin</option>
            <option value="no">Not superadmin</option>
          </select>
          <select
            name="matrix"
            defaultValue={matrixFilter}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">All matrix statuses</option>
            <option value="yes">Matrix admin</option>
            <option value="no">Not matrix admin</option>
          </select>
          <select
            name="study"
            defaultValue={studyFilter}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">All study statuses</option>
            <option value="yes">In study</option>
            <option value="no">Not in study</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Apply
          </button>
        </form>
      </div>

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No profiles found."
        colSpan={8}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">First Name</th>
            <th className="px-4 py-3">Last Name</th>
            <th className="px-4 py-3">Superadmin</th>
            <th className="px-4 py-3">In Study</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Modified</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr
            key={String(row.id)}
            className="border-b border-zinc-100 last:border-0"
          >
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">
              {String(row.id ?? "").slice(0, 8)}…
            </td>
            <td className="px-4 py-3 text-zinc-900">{String(row.email ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-700">{String(row.first_name ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-700">{String(row.last_name ?? "—")}</td>
            <td className="px-4 py-3">
              {row.is_superadmin ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                  TRUE
                </span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                  FALSE
                </span>
              )}
            </td>
            <td className="px-4 py-3">
              {row.is_in_study ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800">TRUE</span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">FALSE</span>
              )}
            </td>
            <td className="px-4 py-3 text-zinc-700">
              {row.created_datetime_utc
                ? new Date(row.created_datetime_utc as string).toLocaleString()
                : "—"}
            </td>
            <td className="px-4 py-3 text-zinc-700">
              {row.modified_datetime_utc
                ? new Date(row.modified_datetime_utc as string).toLocaleString()
                : "—"}
            </td>
          </tr>
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/users"
          page={page}
          pageSize={pageSize}
          total={total}
          rowCount={rows.length}
          preserveParams={preserve}
        />
      ) : null}
    </div>
  );
}
