import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { listProfiles } from "@/lib/admin/queries";

export default async function AdminUsersPage() {
  const { data, error } = await listProfiles();
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        subtitle="Reading from profiles."
      />

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
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">TRUE</span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">FALSE</span>
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
    </div>
  );
}
