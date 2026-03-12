import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { listTable } from "@/lib/admin/queries";

function truncate(s: string, len = 80) {
  if (!s || s.length <= len) return s;
  return s.slice(0, len) + "…";
}

export default async function AdminLlmResponsesPage() {
  const { data, error } = await listTable("llm_responses");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="LLM Responses"
        subtitle="Read-only. Response bodies truncated in table."
      />

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No LLM responses found."
        colSpan={6}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Model</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Request Summary</th>
            <th className="px-4 py-3">Response Summary</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-700">{String(row.model_id ?? row.model_name ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-700">{String(row.provider_id ?? row.provider_name ?? "—")}</td>
            <td className="max-w-xs truncate px-4 py-3 text-zinc-700" title={String(row.request ?? row.prompt ?? "")}>
              {truncate(String(row.request ?? row.prompt ?? "—"), 60)}
            </td>
            <td className="max-w-xs truncate px-4 py-3 text-zinc-700" title={String(row.response ?? row.body ?? "")}>
              {truncate(String(row.response ?? row.body ?? "—"), 60)}
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
