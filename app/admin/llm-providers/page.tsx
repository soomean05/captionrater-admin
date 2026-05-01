import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";
import { createLlmProvider } from "./actions";
import { LlmProvidersRow } from "./LlmProvidersRow";

export default async function AdminLlmProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const paramError = typeof sp.error === "string" ? sp.error : undefined;

  const { data, error, count } = await listTablePaginated(
    "llm_providers",
    page,
    pageSize,
    "created_datetime_utc"
  );
  const rows = (data ?? []) as Record<string, unknown>[];
  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="LLM Providers" subtitle="Full CRUD for llm_providers table." />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create LLM provider</h2>
        <form action={createLlmProvider} className="mt-3 flex flex-wrap gap-3">
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
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
        emptyMessage="No LLM providers found."
        colSpan={4}
        headers={
          <tr>
            <th className="px-4 py-3" colSpan={3}>
              Name
            </th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <LlmProvidersRow key={String(row.id)} row={row} />
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/llm-providers"
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
