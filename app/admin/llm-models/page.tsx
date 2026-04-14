import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";
import { createLlmModel } from "./actions";
import { LlmModelsRow } from "./LlmModelsRow";

export default async function AdminLlmModelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const paramError = typeof sp.error === "string" ? sp.error : undefined;

  const { data, error, count } = await listTablePaginated(
    "llm_models",
    page,
    pageSize,
    "created_datetime_utc"
  );
  const rows = (data ?? []) as Record<string, unknown>[];
  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="LLM Models" subtitle="Full CRUD for llm_models table." />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create LLM model</h2>
        <form action={createLlmModel} className="mt-3 flex flex-wrap gap-3">
          <input
            name="name"
            placeholder="Model name"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="provider_id"
            placeholder="Provider ID (optional)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
              value="true"
              className="rounded border-zinc-300"
            />
            Active
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create
          </button>
        </form>
      </div>

      {paramError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {paramError}
        </div>
      )}

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No LLM models found."
        colSpan={6}
        headers={
          <tr>
            <th className="px-4 py-3">Model name</th>
            <th className="px-4 py-3">Provider ID</th>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Modified</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <LlmModelsRow key={String(row.id)} row={row} />
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/llm-models"
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
