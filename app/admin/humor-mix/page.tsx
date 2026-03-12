import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminClient } from "@/lib/admin/queries";
import { formatSupabaseError } from "@/lib/admin/formatError";
import { HumorMixEditRow } from "./HumorMixEditRow";

export default async function AdminHumorMixPage() {
  const supabase = getAdminClient();
  const { data, error } = await supabase.from("humor_mix").select("*");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Humor Mix"
        subtitle="Read + update only. Edit mix configuration."
      />

      <AdminTable
        error={error ? formatSupabaseError(error) : null}
        empty={rows.length === 0}
        emptyMessage="No humor mix records found."
        colSpan={4}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name / Config</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-900">{String(row.name ?? row.key ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-700">
              {typeof row.value === "object"
                ? JSON.stringify(row.value)
                : String(row.value ?? row.amount ?? row.weight ?? "—")}
            </td>
            <td className="px-4 py-3">
              <HumorMixEditRow row={row} />
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
