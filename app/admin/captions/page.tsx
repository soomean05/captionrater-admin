import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { listCaptions } from "@/lib/admin/queries";

export default async function AdminCaptionsPage() {
  const { data, error } = await listCaptions();
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Captions"
        subtitle="Read-only. Reading from captions."
      />

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No captions found."
        colSpan={5}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Caption</th>
            <th className="px-4 py-3">Image ID</th>
            <th className="px-4 py-3">Profile ID</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        }
      >
        {rows.map((row) => {
          const captionText = String(row.text ?? row.caption ?? "").trim() || "—";
          return (
            <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
              <td className="max-w-xl truncate px-4 py-3 text-zinc-900">{captionText}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.image_id ?? "—")}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.profile_id ?? "—")}</td>
              <td className="px-4 py-3 text-zinc-700">
                {row.created_datetime_utc
                  ? new Date(row.created_datetime_utc as string).toLocaleString()
                  : "—"}
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
