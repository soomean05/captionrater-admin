import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getAdminClient } from "@/lib/admin/queries";

export default async function AdminHumorFlavorStepsPage() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .order("humor_flavor_id", { ascending: true })
    .order("step_number", { ascending: true });
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Humor Flavor Steps"
        subtitle="Read-only. Ordered by flavor then step number."
      />

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No steps found."
        colSpan={5}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Humor Flavor ID</th>
            <th className="px-4 py-3">Step Number</th>
            <th className="px-4 py-3">Content / Prompt</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.humor_flavor_id ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-700">{String(row.step_number ?? "—")}</td>
            <td className="max-w-md truncate px-4 py-3 text-zinc-700">
              {String(row.content ?? row.prompt ?? row.text ?? "—")}
            </td>
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
