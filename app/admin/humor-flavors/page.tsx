import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { listTable } from "@/lib/admin/queries";

export default async function AdminHumorFlavorsPage() {
  const { data, error } = await listTable("humor_flavors");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Humor Flavors"
        subtitle="Read-only. Reading from humor_flavors."
      />

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No humor flavors found."
        colSpan={4}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-900">{String(row.name ?? "—")}</td>
            <td className="max-w-md truncate px-4 py-3 text-zinc-700">{String(row.description ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-700">
              {row.created_datetime_utc
                ? new Date(row.created_datetime_utc as string).toLocaleString()
                : "—"}
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
