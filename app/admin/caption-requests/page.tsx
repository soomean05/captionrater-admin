import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { listTable } from "@/lib/admin/queries";

export default async function AdminCaptionRequestsPage() {
  const { data, error } = await listTable("caption_requests");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Caption Requests"
        subtitle="Read-only."
      />

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No caption requests found."
        colSpan={6}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Request / Prompt</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Profile ID</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Modified</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
            <td className="max-w-md truncate px-4 py-3 text-zinc-900">
              {String(row.request_text ?? row.prompt ?? row.text ?? "—")}
            </td>
            <td className="px-4 py-3">
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                {String(row.status ?? "—")}
              </span>
            </td>
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.profile_id ?? "—")}</td>
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
