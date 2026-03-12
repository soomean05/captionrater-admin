import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { listTable } from "@/lib/admin/queries";

export default async function AdminLlmPromptChainsPage() {
  const { data, error } = await listTable("llm_prompt_chains");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="LLM Prompt Chains"
        subtitle="Read-only."
      />

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No prompt chains found."
        colSpan={5}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Step Count</th>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-900">{String(row.name ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-700">{String(row.step_count ?? row.steps ?? "—")}</td>
            <td className="px-4 py-3">
              {row.is_active != null ? (row.is_active ? "Yes" : "No") : "—"}
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
