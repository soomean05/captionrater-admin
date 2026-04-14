import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";
import { formatSupabaseError } from "@/lib/admin/formatError";
import { LlmResponseViewButton } from "./LlmResponseViewButton";

function truncate(s: string, len = 60) {
  if (!s || s.length <= len) return s;
  return s.slice(0, len) + "…";
}

export default async function AdminLlmResponsesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const { data, error, count } = await listTablePaginated(
    "llm_model_responses",
    page,
    pageSize,
    "created_datetime_utc"
  );
  const rows = (data ?? []) as Record<string, unknown>[];
  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="LLM Responses"
        subtitle="Read-only. From llm_model_responses. Use View to see full response and prompts."
      />

      <AdminTable
        error={error ? formatSupabaseError(error) : null}
        empty={rows.length === 0}
        emptyMessage="No LLM responses found."
        colSpan={9}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Model ID</th>
            <th className="px-4 py-3">Caption Req</th>
            <th className="px-4 py-3">Profile</th>
            <th className="px-4 py-3">Time (s)</th>
            <th className="px-4 py-3">Temp</th>
            <th className="px-4 py-3">Response</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">
              {String(row.id ?? "—")}
            </td>
            <td className="px-4 py-3 text-zinc-700">
              {row.created_datetime_utc
                ? new Date(row.created_datetime_utc as string).toLocaleString()
                : "—"}
            </td>
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">
              {String(row.llm_model_id ?? "—")}
            </td>
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">
              {String(row.caption_request_id ?? "—")}
            </td>
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">
              {String(row.profile_id ?? "—")}
            </td>
            <td className="px-4 py-3 text-zinc-700">
              {row.processing_time_seconds != null
                ? String(row.processing_time_seconds)
                : "—"}
            </td>
            <td className="px-4 py-3 text-zinc-700">
              {row.llm_temperature != null ? String(row.llm_temperature) : "—"}
            </td>
            <td className="max-w-xs truncate px-4 py-3 text-zinc-700">
              {truncate(String(row.llm_model_response ?? ""), 60) || "—"}
            </td>
            <td className="px-4 py-3 text-right">
              <LlmResponseViewButton row={row} />
            </td>
          </tr>
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/llm-responses"
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
